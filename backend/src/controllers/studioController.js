const studioService = require('../services/studioService');
const { success, created, createError } = require('../utils/responseHandler');

/**
 * Upload front and back studio photos
 */
exports.uploadStudioPhotos = async (req, res, next) => {
  try {
    if (!req.files || !req.files.front_photo || !req.files.back_photo) {
      throw createError(400, 'Both front and back photos are required');
    }

    const frontPhotoUrl = `/images/uploads/${req.files.front_photo[0].filename}`;
    const backPhotoUrl = `/images/uploads/${req.files.back_photo[0].filename}`;

    const studioPhoto = await studioService.uploadStudioPhotos(
      req.user.userId,
      frontPhotoUrl,
      backPhotoUrl
    );

    return created(
      res,
      studioPhoto,
      'Studio photos uploaded successfully. Processing images...'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all studio photos for the current user
 */
exports.listStudioPhotos = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
    };

    const studioPhotos = await studioService.getUserStudioPhotos(
      req.user.userId,
      filters
    );

    return success(res, studioPhotos);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single studio photo
 */
exports.getStudioPhoto = async (req, res, next) => {
  try {
    const studioPhoto = await studioService.getStudioPhoto(
      req.user.userId,
      req.params.studioPhotoId
    );

    return success(res, studioPhoto);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a studio photo
 */
exports.deleteStudioPhoto = async (req, res, next) => {
  try {
    const result = await studioService.deleteStudioPhoto(
      req.user.userId,
      req.params.studioPhotoId
    );

    return success(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get processing status of a studio photo
 */
exports.getStudioPhotoStatus = async (req, res, next) => {
  try {
    const status = await studioService.getStudioPhotoStatus(
      req.user.userId,
      req.params.studioPhotoId
    );

    return success(res, status);
  } catch (error) {
    next(error);
  }
};