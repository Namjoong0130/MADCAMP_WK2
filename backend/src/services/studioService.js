const prisma = require('../config/prisma');
const { createError } = require('../utils/responseHandler');
const aiService = require('./aiService');
const { saveLocalFile } = require('../utils/fileHandler');
const sharp = require('sharp');
const axios = require('axios');

/**
 * Upload studio photos (front and back) and process them
 */
exports.uploadStudioPhotos = async (userId, frontPhotoUrl, backPhotoUrl) => {
  try {
    // Create initial studio photo record
    const studioPhoto = await prisma.studioPhoto.create({
      data: {
        user_id: userId,
        front_photo_url: frontPhotoUrl,
        back_photo_url: backPhotoUrl,
        processing_status: 'processing',
      },
    });

    // Process images asynchronously
    setImmediate(async () => {
      try {
        console.log(`[Studio] Processing studio photo #${studioPhoto.studio_photo_id}`);

        // Step 1: Generate side-by-side combined image using fal.ai
        const combinedImageUrl = await generateCombinedImage(
          frontPhotoUrl,
          backPhotoUrl,
          studioPhoto.studio_photo_id
        );

        if (!combinedImageUrl) {
          throw new Error('Failed to generate combined image');
        }

        // Update with combined image
        await prisma.studioPhoto.update({
          where: { studio_photo_id: studioPhoto.studio_photo_id },
          data: {
            combined_image_url: combinedImageUrl,
          },
        });

        console.log(`[Studio] Combined image created: ${combinedImageUrl}`);

        // Step 2: Remove background from combined image
        const processedBuffer = await aiService.removeBackground(combinedImageUrl);

        if (processedBuffer) {
          const processedUrl = saveLocalFile(
            processedBuffer,
            'studio',
            `${studioPhoto.studio_photo_id}_processed.png`
          );

          await prisma.studioPhoto.update({
            where: { studio_photo_id: studioPhoto.studio_photo_id },
            data: {
              processed_image_url: processedUrl,
              processing_status: 'completed',
              ai_metadata: {
                processed_at: new Date().toISOString(),
                method: 'fal.ai + imgly-background-removal',
              },
            },
          });

          console.log(`[Studio] Background removal completed for studio photo #${studioPhoto.studio_photo_id}`);
        } else {
          throw new Error('Background removal failed');
        }
      } catch (error) {
        console.error(`[Studio] Processing failed for studio photo #${studioPhoto.studio_photo_id}:`, error);

        await prisma.studioPhoto.update({
          where: { studio_photo_id: studioPhoto.studio_photo_id },
          data: {
            processing_status: 'failed',
            ai_metadata: {
              error: error.message,
              failed_at: new Date().toISOString(),
            },
          },
        });
      }
    });

    return studioPhoto;
  } catch (error) {
    console.error('[Studio] Upload failed:', error);
    throw createError(500, 'Failed to upload studio photos');
  }
};

/**
 * Generate combined side-by-side image using fal.ai
 */
async function generateCombinedImage(frontPhotoUrl, backPhotoUrl, studioPhotoId) {
  try {
    // Resolve URLs to data URIs for fal.ai
    const frontDataUri = await aiService.resolveImageUrl(frontPhotoUrl);
    const backDataUri = await aiService.resolveImageUrl(backPhotoUrl);

    const prompt = `A high-quality product photo showing two views of the same clothing item side-by-side on a SINGLE, CONTINUOUS, UNIFORM PURE WHITE BACKGROUND.

Layout:
- Left side: FRONT view (based on Image 1)
- Right side: BACK view (based on Image 2)
- Center: A wide empty white space separating them. DO NOT OVERLAP. DO NOT DRAW ANY DIVIDER LINES.

The input Image 1 strictly represents the FRONT view. The input Image 2 strictly represents the BACK view.

CRITICAL ENVIRONMENT INSTRUCTION: The background must be one single infinite white surface. The lighting, shadows, and color tone must be IDENTICAL for both views. It should look like two items placed on the same white table/floor, not two different images stitched together.

Professional product photography style, neutral studio lighting, no harsh shadows, straight-on camera view at eye level.`;

    console.log(`[Studio] Calling fal.ai for combined image generation`);

    const imageUrl = await aiService.callFalAi(prompt, [frontDataUri, backDataUri]);

    if (imageUrl) {
      // Download and save the combined image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const savedUrl = saveLocalFile(buffer, 'studio', `${studioPhotoId}_combined.png`);
      console.log(`[Studio] Combined image saved: ${savedUrl}`);

      return savedUrl;
    }

    return null;
  } catch (error) {
    console.error('[Studio] Combined image generation failed:', error);
    return null;
  }
}

/**
 * Get all studio photos for a user
 */
exports.getUserStudioPhotos = async (userId, filters = {}) => {
  try {
    const where = {
      user_id: userId,
      deleted_at: null,
    };

    if (filters.status) {
      where.processing_status = filters.status;
    }

    const studioPhotos = await prisma.studioPhoto.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return studioPhotos;
  } catch (error) {
    console.error('[Studio] Failed to get studio photos:', error);
    throw createError(500, 'Failed to retrieve studio photos');
  }
};

/**
 * Get a single studio photo
 */
exports.getStudioPhoto = async (userId, studioPhotoId) => {
  try {
    const studioPhoto = await prisma.studioPhoto.findFirst({
      where: {
        studio_photo_id: parseInt(studioPhotoId),
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!studioPhoto) {
      throw createError(404, 'Studio photo not found');
    }

    return studioPhoto;
  } catch (error) {
    if (error.statusCode === 404) throw error;
    console.error('[Studio] Failed to get studio photo:', error);
    throw createError(500, 'Failed to retrieve studio photo');
  }
};

/**
 * Delete a studio photo (soft delete)
 */
exports.deleteStudioPhoto = async (userId, studioPhotoId) => {
  try {
    const studioPhoto = await prisma.studioPhoto.findFirst({
      where: {
        studio_photo_id: parseInt(studioPhotoId),
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!studioPhoto) {
      throw createError(404, 'Studio photo not found');
    }

    await prisma.studioPhoto.update({
      where: { studio_photo_id: studioPhoto.studio_photo_id },
      data: { deleted_at: new Date() },
    });

    return { message: 'Studio photo deleted successfully' };
  } catch (error) {
    if (error.statusCode === 404) throw error;
    console.error('[Studio] Failed to delete studio photo:', error);
    throw createError(500, 'Failed to delete studio photo');
  }
};

/**
 * Get processing status of a studio photo
 */
exports.getStudioPhotoStatus = async (userId, studioPhotoId) => {
  try {
    const studioPhoto = await prisma.studioPhoto.findFirst({
      where: {
        studio_photo_id: parseInt(studioPhotoId),
        user_id: userId,
        deleted_at: null,
      },
      select: {
        studio_photo_id: true,
        processing_status: true,
        combined_image_url: true,
        processed_image_url: true,
        ai_metadata: true,
        updated_at: true,
      },
    });

    if (!studioPhoto) {
      throw createError(404, 'Studio photo not found');
    }

    return studioPhoto;
  } catch (error) {
    if (error.statusCode === 404) throw error;
    console.error('[Studio] Failed to get status:', error);
    throw createError(500, 'Failed to get studio photo status');
  }
};