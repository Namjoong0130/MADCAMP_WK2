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
    return success(res, updated, '?좎껜 ?뺣낫媛 ?낅뜲?댄듃?섏뿀?듬땲??');
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
    return success(res, updated, '?꾨줈?꾩씠 ?낅뜲?댄듃?섏뿀?듬땲??');
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
      throw new Error('?뚯씪???낅줈?쒕릺吏 ?딆븯?듬땲??');
    }

    const webPath = `/images/uploads/${req.file.filename}`;

    const type = req.query.type === 'body' ? 'body' : 'profile';
    const payload =
      type === 'body'
        ? { base_photo_url: webPath }
        : { profile_img_url: webPath };

    // Save image URL to the requested field.
    const updated = await userService.updateUserProfile(
      req.user.userId,
      payload
    );

    return success(res, updated, '?ъ쭊???낅줈?쒕릺?덉뒿?덈떎.');
  } catch (error) {
    next(error);
  }
};




