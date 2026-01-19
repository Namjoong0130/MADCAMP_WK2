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

const { removeBackground: removeBackgroundImgly } = require('@imgly/background-removal-node');

// ...

const removeBackground = async (inputPath) => {
  try {
    const fullPath = inputPath.startsWith('/') ? inputPath : path.join(UPLOAD_ROOT, inputPath.replace('/images/', ''));

    if (!fs.existsSync(fullPath)) return null;

    // imgly accepts file path or blob. Node env usually path or buffer. 
    // Documentation says: removeBackground(src)
    console.log('[AI] Removing background (Local) for:', fullPath);
    const blob = await removeBackgroundImgly(`file://${fullPath}`);

    // Convert Blob to Buffer
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Background Removal Failed:', error.message || error);
  }
  return null;
};

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

  const finalPrompt = `A high-quality 3D product rendering showing two views of the same clothing item side-by-side on a SINGLE, CONTINUOUS, UNIFORM PURE WHITE BACKGROUND.
  
  Layout:
  - Left side: FRONT view (based on Image 1)
  - Right side: BACK view (based on Image 2)
  - Center: A wide empty white space separating them. DO NOT OVERLAP. DO NOT DRAW ANY DIVIDER LINES.

  ${mappingText}

  CRITICAL ENVIRONMENT INSTRUCTION: The background must be one single infinite white surface. The lighting, shadows, and color tone must be IDENTICAL for both views. It should look like two items placed on the same white table/floor, not two different images stitched together.

  CRITICAL DESIGN INSTRUCTION: The final design must be a perfect synthesis of the input sketches and the user prompt. You must strictly preserve the structural silhouette, cut, and shape from the input sketches, while applying the materials, colors, textures, and design details specified in the user description: "${userPrompt}".

  Ghost mannequin style (just clothes, invisible body), neutral studio lighting, no shadows, straight-on camera view at eye level.`;

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

  // ... (inside generateDesignImage)
  const frontUrl = saveLocalFile(leftBuffer, 'designs', `${fileNameBase}_front.png`);
  const backUrl = saveLocalFile(rightBuffer, 'designs', `${fileNameBase}_back.png`);

  // Background Removal Integration (Design)
  const frontBuffer = await removeBackground(frontUrl);
  if (frontBuffer) {
    saveLocalFile(frontBuffer, 'designs', `${fileNameBase}_front.png`); // Overwrite
  }
  const backBuffer = await removeBackground(backUrl);
  if (backBuffer) {
    saveLocalFile(backBuffer, 'designs', `${fileNameBase}_back.png`); // Overwrite
  }

  return {
    all: allUrl,
    front: frontUrl,
    back: backUrl
  };
};

exports.generateFittingResult = async (fittingId, basePhotoUrl, clothingList, externalClothItems = []) => {
  // ... (existing logic)
  let imageUrl = await callFalAi(finalPrompt, allInputImages);
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

  // Background Removal Integration (Fitting)
  if (imageUrl) { // Only remove bg if AI actually generated something
    const transparentBuffer = await removeBackground(resultUrl);
    if (transparentBuffer) {
      saveLocalFile(transparentBuffer, 'fittings', uniqueName); // Overwrite
    }
  }

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

  // Background Removal Integration (Mannequin)
  if (imageUrl) {
    const transparentBuffer = await removeBackground(resultUrl);
    if (transparentBuffer) {
      saveLocalFile(transparentBuffer, 'fittings', uniqueName); // Overwrite
    }
  }

  return resultUrl;
};
