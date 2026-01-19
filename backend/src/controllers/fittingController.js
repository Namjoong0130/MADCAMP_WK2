const fittingService = require('../services/fittingService');
const { created, success } = require('../utils/responseHandler');

exports.createFitting = async (req, res, next) => {
  try {
    // Check if base_photo_url is provided, otherwise fallback to user's saved photo
    if (!req.body.base_photo_url) {
      const userService = require('../services/userService');
      const userProfile = await userService.getUserHeader(req.user.userId);

      // Need to fetch full profile or just check db directly? 
      // getUserHeader gets basic info. let's check profile_img_url or basePhotoUrl
      // Actually fittingService uses user_id, so we can let service handle it? 
      // No, service createFitting validates payload.base_photo_url first.

      // Better: Get full profile
      const fullProfile = await userService.getUserProfile(req.user.userId);

      if (fullProfile.base_photo_url) {
        req.body.base_photo_url = fullProfile.base_photo_url;
      } else {
        throw new Error('피팅을 위해 전신 사진(base_photo_url)을 입력하거나 프로필 사진을 먼저 업로드해주세요.');
      }
    }

    const fitting = await fittingService.createFitting(req.user.userId, req.body);
    return created(res, fitting, '피팅이 생성되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.listFittings = async (req, res, next) => {
  try {
    const fittings = await fittingService.listFittings(req.user.userId);
    return success(res, fittings);
  } catch (error) {
    next(error);
  }
};

exports.getFittingDetail = async (req, res, next) => {
  try {
    const fitting = await fittingService.getFittingDetail(
      req.user.userId,
      Number(req.params.fittingId)
    );
    return success(res, fitting);
  } catch (error) {
    next(error);
  }
};

exports.createFittingResult = async (req, res, next) => {
  try {
    const result = await fittingService.createFittingResult(
      req.user.userId,
      Number(req.params.fittingId),
      req.body
    );
    return created(res, result, '피팅 결과가 저장되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.listFittingAlbum = async (req, res, next) => {
  try {
    const album = await fittingService.listFittingAlbum(req.user.userId);
    return success(res, album);
    return success(res, album);
  } catch (error) {
    next(error);
  }
};

exports.generateFitting = async (req, res, next) => {
  try {
    const result = await fittingService.generateFittingImage(
      req.user.userId,
      Number(req.params.fittingId)
    );
    return success(res, result, 'AI 피팅이 시작되었습니다.');
  } catch (error) {
    next(error);
  }
};
