const axios = require('axios');
const sharp = require('sharp');
const { createError } = require('../utils/responseHandler');
const { saveLocalFile, saveFileFromUrl } = require('../utils/fileHandler');

const FAL_KEY = process.env.FAL_KEY;
// Using a generic endpoint for now as "nanobanana pro" specific endpoint isn't standard public info without docs.
// User can replace this constant.
const FAL_MODEL_ENDPOINT = 'fal-ai/nano-banana-pro/edit';

const fs = require('fs');
const path = require('path');
const UPLOAD_ROOT = path.join(__dirname, '../../public/images'); // Align with fileHandler

// Helper to convert local file or URL to appropriate format for FAL
const resolveImageUrl = async (imgUrl) => {
  if (!imgUrl) return null;

  // If it's a web URL, return as is
  if (imgUrl.startsWith('http')) return imgUrl;

  // If it's a local path (e.g. /images/fittings/...), read and convert to Data URI
  if (imgUrl.startsWith('/images/')) {
    // /images/abc.png -> .../public/images/abc.png
    const relativePath = imgUrl.replace('/images/', '');
    const fullPath = path.join(UPLOAD_ROOT, relativePath);

    if (fs.existsSync(fullPath)) {
      const fileBuffer = fs.readFileSync(fullPath);
      const base64 = fileBuffer.toString('base64');
      const mimeType = fullPath.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${base64}`;
    }
  }
  return imgUrl;
};

const { fal } = require("@fal-ai/client");

fal.config({
  credentials: FAL_KEY, // Use environment variable
});

const callFalAi = async (prompt, imageUrls = []) => {
  if (!FAL_KEY) {
    console.warn('FAL_KEY is missing. Using mock generation.');
    return null; // Trigger mock
  }

  try {
    // Resolve all image URLs (convert local to base64 if needed)
    // Map usage to resolve all, handling promises
    const imagePromises = imageUrls.map(url => resolveImageUrl(url));
    const processedImages = (await Promise.all(imagePromises)).filter(img => img !== null);

    // Fallback: If array is empty but we need input, generate blank?
    // User requested "front and back", so if we have images, pass them all.
    // If strict 0 images provided, generate blank (handled by controller validation actually, but for safety)
    let finalInputImages = processedImages;
    if (finalInputImages.length === 0) {
      // Auto-generate blank if somehow explicit empty
      const blank = await getBlankImageBase64();
      finalInputImages = [blank];
    }

    console.log('[FAL AI Request]', { endpoint: FAL_MODEL_ENDPOINT, imageCount: finalInputImages.length });

    const result = await fal.subscribe(FAL_MODEL_ENDPOINT, {
      input: {
        prompt: prompt,
        image_urls: finalInputImages // Pass full array
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Log result for debugging
    console.log('[FAL AI Result]', JSON.stringify(result.data));

    // Return the image URL from result
    if (result.data) {
      // Check for 'images' array or 'image' object
      if (result.data.images && result.data.images[0]) return result.data.images[0].url;
      if (result.data.image && result.data.image.url) return result.data.image.url;
    }
  } catch (error) {
    console.error('Fal.ai API Error:', error.message || error);
  }
  return null;
};

// Mock buffer generator (same as before but slightly better)
const generateMockBuffer = (text, width = 1024, height = 1024) => {
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#eee" />
    <text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle" fill="#555">${text}</text>
    <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="black" stroke-dasharray="4" />
  </svg>`;
  return Buffer.from(svg);
};

exports.generateDesignImage = async (clothId, userPrompt, attemptId, inputImages = []) => {
  // 1. Construct Prompt
  // Explicitly map inputs if 2 are provided (checked by controller anyway)
  const mappingText = "The input Image 1 strictly represents the FRONT view sketch. The input Image 2 strictly represents the BACK view sketch.";

  const finalPrompt = `A photorealistic 3D product rendering with a strict vertical split-screen layout. The entire left 50% frame shows the FRONT view based on the first sketch, and the entire right 50% frame shows the BACK view based on the second sketch. ${mappingText} The center line must be clear empty space, guaranteeing absolutely no overlap. Both views must be perfectly symmetrical, aligned horizontally at the same height, and rendered at the identical scale. Render details based on user description: ${userPrompt}. Ghost mannequin style (just clothes, invisible body), neutral studio lighting, straight-on camera view at eye level, clean solid white background.`;

  console.log(`[AI] Generating Design for Cloth #${clothId}, Attempt #${attemptId} with Prompt:`, finalPrompt);

  let imageUrl = await callFalAi(finalPrompt, inputImages);
  let buffer;

  if (imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    // Mock Generation
    buffer = generateMockBuffer(`Design ${clothId}-${attemptId}`, 1024, 768);
  }

  // 2. Save Combined Image
  // Use id_attempt format as requested
  const fileNameBase = `${clothId}_${attemptId}`;
  const allUrl = saveLocalFile(buffer, 'designs', `${fileNameBase}_all.png`);

  // 3. Split Image (Left/Right)
  // Optimization: use sharp locally
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  const midpoint = Math.floor(width / 2);

  const leftBuffer = await image.clone().extract({ left: 0, top: 0, width: midpoint, height: height }).toBuffer();
  const rightBuffer = await image.clone().extract({ left: midpoint, top: 0, width: width - midpoint, height: height }).toBuffer();

  const frontUrl = saveLocalFile(leftBuffer, 'designs', `${fileNameBase}_front.png`);
  const backUrl = saveLocalFile(rightBuffer, 'designs', `${fileNameBase}_back.png`);

  return {
    all: allUrl,
    front: frontUrl,
    back: backUrl
  };
};

exports.generateFittingResult = async (fittingId, basePhotoUrl, clothingList) => {
  // clothingList example: [{ category: 'TOP', order: 1, name: 'White T-shirt' }, { category: 'BOTTOM', order: 1, name: 'Jeans' }...]

  let layeringText = "";
  if (clothingList && clothingList.length > 0) {
    // 1. Group by category to form structured sentences
    const tops = clothingList.filter(c => c.category === 'TOP' || c.category === 'OUTER').sort((a, b) => a.order - b.order);
    const bottoms = clothingList.filter(c => c.category === 'BOTTOM'); // Usually single layer, but supports multiple
    const shoes = clothingList.filter(c => c.category === 'SHOES');
    const acc = clothingList.filter(c => ['ACC', 'HAT'].includes(c.category));

    const sentences = [];

    // Tops & Outerwear
    if (tops.length > 0) {
      if (tops[0]) {
        sentences.push(`First, putting on the [${tops[0].category}, ${tops[0].order}: ${tops[0].name}] as the base layer.`);
      }
      if (tops.length > 1) {
        const layers = tops.slice(1).map(t => `[${t.category}, ${t.order}: ${t.name}]`).join(' and ');
        sentences.push(`Then, layering the ${layers} over it.`);
      }
    }

    // Bottoms
    if (bottoms.length > 0) {
      const bottomDesc = bottoms.map(b => `[${b.category}, ${b.order}: ${b.name}]`).join(', ');
      sentences.push(`Wearing the ${bottomDesc} on the lower body.`);
    }

    // Shoes
    if (shoes.length > 0) {
      const shoeDesc = shoes.map(s => `[${s.category}, ${s.order}: ${s.name}]`).join(', ');
      sentences.push(`Putting on the ${shoeDesc}.`);
    }

    // Accessories
    if (acc.length > 0) {
      const accDesc = acc.map(a => `[${a.category}, ${a.order}: ${a.name}]`).join(', ');
      sentences.push(`Adding accessories: ${accDesc}.`);
    }

    layeringText = `The person is now wearing the following items, layered strictly in this order: ${sentences.join(' ')}`;
  } else {
    layeringText = "The person is wearing the specified clothing items.";
  }

  const finalPrompt = `A photorealistic virtual try-on image. The goal is to dress the person from the main reference image with the provided clothing items. CRITICAL REQUIREMENT: The person's identity, facial features, body shape, pose, and the original background environment must be PERFECTLY PRESERVED without any alteration. Only the clothing area on the person's body should be changed. ${layeringText}. Ensure realistic fabric physics, natural folds, and believable shadows cast by the new clothes onto the person's body. The lighting on the clothes must match the lighting conditions of the original photo.`;

  console.log(`[AI] Generating Fitting #${fittingId}`);

  let imageUrl = await callFalAi(finalPrompt, [basePhotoUrl]);
  let buffer;

  if (imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    buffer = generateMockBuffer(`Try-On Result #${fittingId}`);
  }

  // Unique filename
  const uniqueName = `${fittingId}_${Date.now()}_tryon.png`;
  const resultUrl = saveLocalFile(buffer, 'fittings', uniqueName);
  return resultUrl;
};

exports.generateMannequinResult = async (fittingId, tryOnImageUrl) => {
  const finalPrompt = `A photorealistic transformation based on the reference image. The goal is to replace *only* the visible human skin areas with a mannequin material. CRITICAL REQUIREMENT: All clothing items, including their specific fabric textures, folds, shadows, and the exact lighting striking them, MUST be perfectly preserved without any alteration. The original background remains unchanged. Transform the human figure into a high-quality retail display mannequin while maintaining the exact original body shape, volume, and pose. Mannequin Specification (Standardized): The mannequin must have a uniform MATTE WHITE finish over its entire surface. The head is abstract and featureless (smooth surface, no eyes, nose, mouth, or hair). The joints are seamless.`;

  console.log(`[AI] Generating Mannequin #${fittingId}`);

  let imageUrl = await callFalAi(finalPrompt, [tryOnImageUrl]);
  let buffer;

  if (imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    buffer = generateMockBuffer(`Mannequin Result #${fittingId}`);
  }

  // Unique filename
  const uniqueName = `${fittingId}_${Date.now()}_mannequin.png`;
  const resultUrl = saveLocalFile(buffer, 'fittings', uniqueName);
  return resultUrl;
};
