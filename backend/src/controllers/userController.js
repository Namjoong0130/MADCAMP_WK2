const userService = require('../services/userService');
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

return success(res, updated, '프로필이 업데이트되었습니다.');
  } catch (error) {
  next(error);
}
};

exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    const webPath = `/images/uploads/${req.file.filename}`;

    // Update basePhotoUrl in user profile
    const updated = await userService.updateUserProfile(req.user.userId, {
      base_photo_url: webPath
    });

    return success(res, updated, '사진이 업로드되었습니다.');
  } catch (error) {
    next(error);
  }
};
