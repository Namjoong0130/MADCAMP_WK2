const fittingService = require('../services/fittingService');
const { created, success } = require('../utils/responseHandler');

exports.createFitting = async (req, res, next) => {
  console.log('[FittingController] createFitting called. Body:', JSON.stringify(req.body, null, 2));
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

    // Handle Uploaded Cloth Images & Metadata
    if (req.files && req.files.length > 0) {
      console.log('[FittingController] Processing uploaded files:', req.files.length);
      const uploadedUrls = req.files.map(file => `/images/uploads/${file.filename}`);

      // Parse categories and orders
      let categories = req.body.cloth_category;
      let orders = req.body.cloth_order;

      // Ensure arrays if single value
      if (categories && !Array.isArray(categories)) categories = [categories];
      if (orders && !Array.isArray(orders)) orders = [orders];

      console.log('[FittingController] Categories:', categories, 'Orders:', orders);

      // Strict Validation for Metadata
      if (!categories || categories.length !== req.files.length) {
        throw new Error('모든 업로드 의류에 대한 카테고리(cloth_category)를 입력해야 합니다.');
      }
      if (!orders || orders.length !== req.files.length) {
        throw new Error('모든 업로드 의류에 대한 레이어링 순서(cloth_order)를 입력해야 합니다.');
      }

      // Create Metadata Tags
      const metaTags = uploadedUrls.map((url, idx) => {
        const meta = {
          url,
          category: categories[idx],
          order: Number(orders[idx])
        };
        return `META_CLOTH_JSON:${JSON.stringify(meta)}`;
      });

      // Merge with existing external_cloth_urls
      const existingExternal = req.body.external_cloth_urls ? (Array.isArray(req.body.external_cloth_urls) ? req.body.external_cloth_urls : [req.body.external_cloth_urls]) : [];
      req.body.external_cloth_urls = [...existingExternal, ...uploadedUrls];

      // Add to tags
      const existingTags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [];
      req.body.tags = [...existingTags, ...metaTags];
    }

    const fitting = await fittingService.createFitting(req.user.userId, req.body);

    // Trigger AI Generation immediately
    const results = await fittingService.generateFittingImage(req.user.userId, fitting.fitting_id);

    return created(res, { fitting, results }, '피팅 및 AI 생성이 완료되었습니다. (착용샷 + 마네킹)');
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
    return success(res, result, '가상 피팅(Real)이 시작되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.generateMannequin = async (req, res, next) => {
  try {
    const result = await fittingService.generateMannequinImage(
      req.user.userId,
      Number(req.params.fittingId)
    );
    return success(res, result, '마네킹 변환이 시작되었습니다.');
  } catch (error) {
    next(error);
  }
};
