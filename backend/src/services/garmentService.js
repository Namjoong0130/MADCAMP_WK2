const prisma = require('../config/prisma');
const { createError } = require('../utils/responseHandler');
const aiService = require('./aiService');
const path = require('path');

/**
 * Upload a garment image and process it with fal.ai background removal
 */
exports.uploadGarment = async (userId, imageUrl, metadata = {}) => {
  try {
    // Create initial garment record
    const garment = await prisma.garment.create({
      data: {
        user_id: userId,
        original_image_url: imageUrl,
        processing_status: 'processing',
        category: metadata.category || null,
        name: metadata.name || null,
        description: metadata.description || null,
      },
    });

    // Process background removal asynchronously
    // In production, this should be done in a background job
    setImmediate(async () => {
      try {
        const processedBuffer = await aiService.removeBackground(imageUrl);

        if (processedBuffer) {
          // Save the processed image
          const { saveLocalFile } = require('../utils/fileHandler');
          const processedUrl = saveLocalFile(
            processedBuffer,
            'garments',
            `${garment.garment_id}_processed.png`
          );

          // Update garment record
          await prisma.garment.update({
            where: { garment_id: garment.garment_id },
            data: {
              processed_image_url: processedUrl,
              processing_status: 'completed',
              ai_metadata: {
                processed_at: new Date().toISOString(),
                method: 'imgly-background-removal',
              },
            },
          });

          console.log(`[Garment] Background removal completed for garment #${garment.garment_id}`);
        } else {
          throw new Error('Background removal failed');
        }
      } catch (error) {
        console.error(`[Garment] Processing failed for garment #${garment.garment_id}:`, error);

        // Update status to failed
        await prisma.garment.update({
          where: { garment_id: garment.garment_id },
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

    return garment;
  } catch (error) {
    console.error('[Garment] Upload failed:', error);
    throw createError(500, 'Failed to upload garment');
  }
};

/**
 * Get all garments for a user
 */
exports.getUserGarments = async (userId, filters = {}) => {
  const where = {
    user_id: userId,
    deleted_at: null,
  };

  if (filters.status) {
    where.processing_status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  const garments = await prisma.garment.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });

  return garments;
};

/**
 * Get a single garment by ID
 */
exports.getGarment = async (userId, garmentId) => {
  const garment = await prisma.garment.findFirst({
    where: {
      garment_id: garmentId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!garment) {
    throw createError(404, 'Garment not found');
  }

  return garment;
};

/**
 * Update garment metadata
 */
exports.updateGarment = async (userId, garmentId, data) => {
  // Verify ownership
  const existing = await prisma.garment.findFirst({
    where: {
      garment_id: garmentId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw createError(404, 'Garment not found');
  }

  const updateData = {
    name: data.name,
    description: data.description,
    category: data.category,
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const updated = await prisma.garment.update({
    where: { garment_id: garmentId },
    data: updateData,
  });

  return updated;
};

/**
 * Delete a garment (soft delete)
 */
exports.deleteGarment = async (userId, garmentId) => {
  const existing = await prisma.garment.findFirst({
    where: {
      garment_id: garmentId,
      user_id: userId,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw createError(404, 'Garment not found');
  }

  await prisma.garment.update({
    where: { garment_id: garmentId },
    data: { deleted_at: new Date() },
  });

  return true;
};

/**
 * Get processing status for a garment
 */
exports.getGarmentStatus = async (userId, garmentId) => {
  const garment = await prisma.garment.findFirst({
    where: {
      garment_id: garmentId,
      user_id: userId,
      deleted_at: null,
    },
    select: {
      garment_id: true,
      processing_status: true,
      original_image_url: true,
      processed_image_url: true,
      ai_metadata: true,
    },
  });

  if (!garment) {
    throw createError(404, 'Garment not found');
  }

  return garment;
};