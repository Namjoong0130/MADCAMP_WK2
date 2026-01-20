const garmentService = require('../services/garmentService');
const { success, created, createError } = require('../utils/responseHandler');

/**
 * Upload a new garment image
 * POST /api/garments
 */
exports.uploadGarment = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'No image file uploaded');
    }

    const imageUrl = `/images/uploads/${req.file.filename}`;
    const metadata = {
      category: req.body.category,
      name: req.body.name,
      description: req.body.description,
    };

    const garment = await garmentService.uploadGarment(
      req.user.userId,
      imageUrl,
      metadata
    );

    return created(res, garment, 'Garment uploaded successfully. Processing background removal...');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all user's garments
 * GET /api/garments
 */
exports.listGarments = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
    };

    const garments = await garmentService.getUserGarments(req.user.userId, filters);
    return success(res, garments);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single garment
 * GET /api/garments/:garmentId
 */
exports.getGarment = async (req, res, next) => {
  try {
    const garmentId = parseInt(req.params.garmentId);
    const garment = await garmentService.getGarment(req.user.userId, garmentId);
    return success(res, garment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update garment metadata
 * PATCH /api/garments/:garmentId
 */
exports.updateGarment = async (req, res, next) => {
  try {
    const garmentId = parseInt(req.params.garmentId);
    const updated = await garmentService.updateGarment(
      req.user.userId,
      garmentId,
      req.body
    );
    return success(res, updated, 'Garment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a garment
 * DELETE /api/garments/:garmentId
 */
exports.deleteGarment = async (req, res, next) => {
  try {
    const garmentId = parseInt(req.params.garmentId);
    await garmentService.deleteGarment(req.user.userId, garmentId);
    return success(res, null, 'Garment deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get garment processing status
 * GET /api/garments/:garmentId/status
 */
exports.getGarmentStatus = async (req, res, next) => {
  try {
    const garmentId = parseInt(req.params.garmentId);
    const status = await garmentService.getGarmentStatus(req.user.userId, garmentId);
    return success(res, status);
  } catch (error) {
    next(error);
  }
};