const userService = require('../services/userService');
const aiService = require('../services/aiService');
const fs = require('fs');
const path = require('path');
const { success } = require('../utils/responseHandler');

exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserHeader(req.user.userId);
    return success(res, user);
  } catch (error) {
    next(error);
  }
};

exports.updateBodyMetrics = async (req, res, next) => {
  try {
    const updated = await userService.updateBodyMetrics(req.user.userId, req.body);
    return success(res, updated, '신체 정보가 업데이트되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.userId);
    return success(res, profile);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user.userId, req.body);
    return success(res, updated, '프로필이 업데이트되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.userId);
    return success(res, null, "Account deleted.");
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    let webPath = `/api/images/uploads/${req.file.filename}`;
    const type = req.query.type === 'body' ? 'body' : 'profile';

    // If uploading body photo, try to remove background
    if (type === 'body') {
      try {
        console.log('[Upload] Attempting background removal for:', req.file.path);
        const bgRemovedBuffer = await aiService.removeBackground(req.file.path);

        if (bgRemovedBuffer) {
          const noBgFilename = `nobg_${Date.now()}_${req.file.filename.split('.')[0]}.png`;
          const noBgPath = path.join(req.file.destination, noBgFilename);

          fs.writeFileSync(noBgPath, bgRemovedBuffer);
          webPath = `/api/images/uploads/${noBgFilename}`;
          console.log('[Upload] Background removed. Saved to:', webPath);
        } else {
          console.warn('[Upload] Background removal returned empty. Using original.');
        }
      } catch (aiErr) {
        console.error('[Upload] Background removal failed:', aiErr);
        // Fallback to original
      }
    }

    const payload =
      type === 'body'
        ? { base_photo_url: webPath }
        : { profile_img_url: webPath };

    // Save image URL to the requested field.
    const updated = await userService.updateUserProfile(
      req.user.userId,
      payload
    );

    return success(res, updated, '사진이 업로드되었습니다.');
  } catch (error) {
    next(error);
  }
};
