const clothService = require('../services/clothService');
const { created, success, createError } = require('../utils/responseHandler');

exports.listCloths = async (req, res, next) => {
  try {
    const cloths = await clothService.listCloths(req.query);
    return success(res, cloths);
  } catch (error) {
    next(error);
  }
};

exports.getClothDetail = async (req, res, next) => {
  try {
    const cloth = await clothService.getClothDetail(Number(req.params.clothId));
    return success(res, cloth);
  } catch (error) {
    next(error);
  }
};

exports.createCloth = async (req, res, next) => {
  try {
    const cloth = await clothService.createCloth(req.user.userId, req.body);
    return created(res, cloth, '의류가 등록되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.updateClothPhysics = async (req, res, next) => {
  try {
    const cloth = await clothService.updateClothPhysics(
      req.user.userId,
      Number(req.params.clothId),
      req.body
    );
    return success(res, cloth, '물성 값이 업데이트되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.createDesignAttempt = async (req, res, next) => {
  try {
    const attempt = await clothService.createDesignAttempt(
      req.user.userId,
      Number(req.params.clothId),
      req.body
    );
    return created(res, attempt, '디자인 시도가 저장되었습니다.');
  } catch (error) {
    next(error);
  }
};

exports.listDesignAttempts = async (req, res, next) => {
  try {
    const attempts = await clothService.listDesignAttempts(
      req.user.userId,
      Number(req.params.clothId)
    );
    return success(res, attempts);
  } catch (error) {
    next(error);
  }
};

exports.listDesignHistory = async (req, res, next) => {
  try {
    const history = await clothService.listDesignHistory(req.user.userId);
    return success(res, history);
    return success(res, history);
  } catch (error) {
    next(error);
  }
};

exports.generateDesign = async (req, res, next) => {
  try {
    console.log('[Controller] generateDesign called');
    const { prompt } = req.body;
    let input_images = [];

    // Prioritize uploaded files
    if (req.files && req.files.length > 0) {
      // With diskStorage, req.files is array of file objects
      input_images = req.files.map(file => `/images/uploads/${file.filename}`);
    } else if (req.body.input_images) {
      // Fallback to URL string/array if provided manually
      input_images = Array.isArray(req.body.input_images) ? req.body.input_images : [req.body.input_images];
    }

    console.log('[Controller] Inputs:', {
      prompt,
      imageCount: input_images.length
    });

    // Strict validation
    if (!prompt || input_images.length !== 2) {
      throw createError(400, '디자인 생성을 위해서는 프롬프트와 참조 이미지 2장(앞면, 뒷면)이 반드시 필요합니다.');
    }

    const attempt = await clothService.generateDesignImage(
      req.user.userId,
      Number(req.params.clothId),
      prompt,
      input_images
    );
    return created(res, attempt, '디자인이 생성되었습니다.');
  } catch (error) {
    console.error('[Controller] generateDesign Error:', error);
    next(error);
  }
};

exports.deleteCloth = async (req, res, next) => {
  try {
    await clothService.deleteCloth(req.user.userId, Number(req.params.clothId));
    return success(res, null, '디자인이 삭제되었습니다.');
  } catch (error) {
    next(error);
  }
};
