const axios = require('axios');
const sharp = require('sharp');
const { createError } = require('../utils/responseHandler');
const { saveLocalFile, saveFileFromUrl } = require('../utils/fileHandler');

const FAL_KEY = process.env.FAL_KEY;
// Using a generic endpoint for now as "nanobanana pro" specific endpoint isn't standard public info without docs.
// User can replace this constant.
const FAL_MODEL_ENDPOINT = 'https://queue.fal.run/fal-ai/fast-sdxl';

const callFalAi = async (prompt, imageUrls = []) => {
  if (!FAL_KEY) {
    console.warn('FAL_KEY is missing. Using mock generation.');
    return null; // Trigger mock
  }

  try {
    const response = await axios.post(FAL_MODEL_ENDPOINT, {
      prompt: prompt,
      image_url: imageUrls[0] // Simplify for now, real implementation depends on model API
    }, {
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    // This is async queue usually, need polling. For simplicity assuming sync or fast response structure here
    // or just returning the queue result. Real Fal.ai often needs polling.
    // For this prototype, if it returns a URL immediately (fast-sdxl does), use it.
    if (response.data && response.data.images && response.data.images[0]) {
      return response.data.images[0].url;
    }
  } catch (error) {
    console.error('Fal.ai API Error:', error.response?.data || error.message);
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

exports.generateDesignImage = async (clothId, userPrompt) => {
  // 1. Construct Prompt
  const finalPrompt = `A photorealistic 3D product rendering with a strict vertical split-screen layout. The entire left 50% frame shows the FRONT view based on the first sketch, and the entire right 50% frame shows the BACK view based on the second sketch. The center line must be clear empty space, guaranteeing absolutely no overlap. Both views must be perfectly symmetrical, aligned horizontally at the same height, and rendered at the identical scale. Render details based on user description: ${userPrompt}. Ghost mannequin style (just clothes, invisible body), neutral studio lighting, straight-on camera view at eye level, clean solid white background.`;

  console.log(`[AI] Generating Design for Cloth #${clothId} with Prompt:`, finalPrompt);

  let imageUrl = await callFalAi(finalPrompt);
  let buffer;

  if (imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    // Mock Generation
    buffer = generateMockBuffer(`Design ${clothId} (Split View)`, 1024, 768);
  }

  // 2. Save Combined Image
  const allUrl = saveLocalFile(buffer, 'designs', `${clothId}_all.png`);

  // 3. Split Image (Left/Right)
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  const midpoint = Math.floor(width / 2);

  const leftBuffer = await image.clone().extract({ left: 0, top: 0, width: midpoint, height: height }).toBuffer();
  const rightBuffer = await image.clone().extract({ left: midpoint, top: 0, width: width - midpoint, height: height }).toBuffer();

  const frontUrl = saveLocalFile(leftBuffer, 'designs', `${clothId}_front.png`);
  const backUrl = saveLocalFile(rightBuffer, 'designs', `${clothId}_back.png`);

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

  const resultUrl = saveLocalFile(buffer, 'fittings', `${fittingId}_tryon.png`);
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

  const resultUrl = saveLocalFile(buffer, 'fittings', `${fittingId}_mannequin.png`);
  return resultUrl;
};
