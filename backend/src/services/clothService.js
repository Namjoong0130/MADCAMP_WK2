const prisma = require('../config/prisma');
const { createError } = require('../utils/responseHandler');
const { requireFields, toNumber } = require('../utils/validator');
const {
  toDbCategory,
  toDbGender,
  ensureArray,
  parseJson,
  toFrontendCloth,
} = require('../utils/transformers');

const normalizeClothPayload = (payload) => {
  const category = toDbCategory(payload.category);
  const gender = toDbGender(payload.gender);
  const sizeSpecs = parseJson(payload.size_specs, {});

  return {
    clothing_name: payload.clothing_name || payload.name,
    category,
    sub_category: payload.sub_category || payload.category,
    gender,
    style: payload.style || null,
    price: toNumber(payload.price, 'price') ?? 0,
    sizes: ensureArray(payload.sizes, []),
    size_specs: sizeSpecs || {},
    description: payload.description || null,
    note: payload.note || null,
    material: payload.material || null,
    origin: payload.origin || null,
    color: payload.color || null,
    stretch: toNumber(payload.stretch, 'stretch') ?? 5,
    weight: toNumber(payload.weight, 'weight') ?? 5,
    stiffness: toNumber(payload.stiffness, 'stiffness') ?? 5,
    thickness: toNumber(payload.thickness, 'thickness') ?? 5,
    layer_order: toNumber(payload.layer_order, 'layer_order') ?? 1,
    thumbnail_url: payload.thumbnail_url || payload.design_img_url || null,
    final_result_front_url: payload.final_result_front_url || payload.design_img_url || null,
    is_public: payload.is_public ?? true,
  };
};

exports.listCloths = async (query = {}) => {
  const where = { deleted_at: null };
  const category = toDbCategory(query.category);
  const gender = toDbGender(query.gender);

  if (category) where.category = category;
  if (gender) where.gender = gender;
  if (query.style) where.style = query.style;
  if (query.brand_id) where.brand_id = Number(query.brand_id);
  if (query.is_public !== undefined) {
    where.is_public = query.is_public === 'true' || query.is_public === true;
  }
  if (query.q) {
    where.OR = [
      { clothing_name: { contains: query.q, mode: 'insensitive' } },
      { style: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  let orderBy = { created_at: 'desc' }; // Default: Latest

  if (query.sort === 'popular') {
    orderBy = { likeCount: 'desc' };
  } else if (query.sort === 'price') {
    orderBy = { price: 'asc' }; // Lowest to highest
  } else if (query.sort === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  const cloths = await prisma.cloth.findMany({
    where,
    include: { brand: true, fund: true },
    orderBy,
  });

  return cloths.map((cloth) => ({
    ...toFrontendCloth(cloth),
    funding_id: cloth.fund?.funding_id || null,
  }));
};

exports.getClothDetail = async (clothId) => {
  const cloth = await prisma.cloth.findUnique({
    where: { clothing_id: clothId },
    include: { brand: true, fund: true },
  });
  if (!cloth || cloth.deleted_at) throw createError(404, '의류를 찾을 수 없습니다.');

  return {
    ...toFrontendCloth(cloth),
    fund: cloth.fund,
  };
};

exports.createCloth = async (userId, payload) => {
  if (!payload.name && !payload.clothing_name) {
    throw createError(400, '의류 이름이 필요합니다.');
  }
  if (!payload.category) {
    throw createError(400, '카테고리가 필요합니다.');
  }

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { brand: true },
  });

  if (!user?.brand) throw createError(400, '브랜드가 존재하지 않습니다.');

  // Auto-fix creator user role if they have a brand but is_creator is false
  if (user.brand && !user.is_creator) {
    await prisma.user.update({
      where: { user_id: userId },
      data: { is_creator: true }
    });
    user.is_creator = true; // Update local variable
  }

  if (!user.is_creator) throw createError(403, '크리에이터 권한이 없습니다.');
  // if (user.tokens <= 0) throw createError(400, '보유한 디자인 토큰이 부족합니다.'); // Temporary disable for testing
  if (user.brand.design_count >= 10) {
    throw createError(400, '브랜드당 최대 10개까지만 디자인 가능합니다.');
  }

  const clothData = normalizeClothPayload(payload);
  if (!clothData.clothing_name) throw createError(400, '의류 이름이 필요합니다.');
  if (!clothData.category) throw createError(400, '카테고리를 확인해주세요.');
  if (!clothData.gender) clothData.gender = 'UNISEX';

  const attemptPayload = payload.design_attempt;

  return prisma.$transaction(async (tx) => {
    const cloth = await tx.cloth.create({
      data: {
        ...clothData,
        brand_id: user.brand.brand_id,
      },
    });

    if (attemptPayload?.design_prompt || attemptPayload?.ai_result_url) {
      await tx.designAttempt.create({
        data: {
          clothing_id: cloth.clothing_id,
          input_images: ensureArray(attemptPayload.input_images, []),
          design_prompt: attemptPayload.design_prompt || '',
          ai_result_url: attemptPayload.ai_result_url || cloth.final_result_front_url || '',
        },
      });
    }

    await tx.user.update({
      where: { user_id: userId },
      data: { tokens: { decrement: 1 } },
    });

    await tx.brand.update({
      where: { brand_id: user.brand.brand_id },
      data: { design_count: { increment: 1 } },
    });

    return toFrontendCloth(cloth);
  });
};

exports.updateClothPhysics = async (userId, clothId, payload) => {
  const cloth = await prisma.cloth.findUnique({
    where: { clothing_id: clothId },
    include: { brand: true },
  });
  if (!cloth || cloth.deleted_at) throw createError(404, '의류를 찾을 수 없습니다.');
  if (cloth.brand?.owner_id !== userId) throw createError(403, '수정 권한이 없습니다.');

  const data = {
    stretch: toNumber(payload.stretch, 'stretch'),
    weight: toNumber(payload.weight, 'weight'),
    stiffness: toNumber(payload.stiffness, 'stiffness'),
    thickness: toNumber(payload.thickness, 'thickness'),
    layer_order: toNumber(payload.layer_order, 'layer_order'),
    size_specs: parseJson(payload.size_specs, undefined),
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  const updated = await prisma.cloth.update({
    where: { clothing_id: clothId },
    data,
  });

  return toFrontendCloth(updated);
};

exports.createDesignAttempt = async (userId, clothId, payload) => {
  requireFields(payload, ['design_prompt']);

  const cloth = await prisma.cloth.findUnique({
    where: { clothing_id: clothId },
    include: { brand: true },
  });
  if (!cloth || cloth.deleted_at) throw createError(404, '의류를 찾을 수 없습니다.');
  if (cloth.brand?.owner_id !== userId) throw createError(403, '저장 권한이 없습니다.');

  const attempt = await prisma.designAttempt.create({
    data: {
      clothing_id: clothId,
      input_images: ensureArray(payload.input_images, []),
      design_prompt: payload.design_prompt,
      ai_result_url: payload.ai_result_url || cloth.final_result_front_url || '',
    },
  });

  return attempt;
};

exports.listDesignAttempts = async (userId, clothId) => {
  const cloth = await prisma.cloth.findUnique({
    where: { clothing_id: clothId },
    include: { brand: true },
  });
  if (!cloth || cloth.deleted_at) throw createError(404, '의류를 찾을 수 없습니다.');
  if (cloth.brand?.owner_id !== userId) throw createError(403, '조회 권한이 없습니다.');

  return prisma.designAttempt.findMany({
    where: { clothing_id: clothId },
    orderBy: { created_at: 'desc' },
  });
};

exports.listDesignHistory = async (userId) => {
  const brand = await prisma.brand.findUnique({ where: { owner_id: userId } });
  if (!brand) return [];

  return prisma.designAttempt.findMany({
    where: { cloth: { brand_id: brand.brand_id } },
    include: { cloth: true },
    orderBy: { created_at: 'desc' },
  });
};

exports.generateDesignImage = async (userId, clothId, prompt) => {
  const cloth = await prisma.cloth.findUnique({
    where: { clothing_id: clothId },
    include: { brand: true },
  });
  if (!cloth || cloth.deleted_at) throw createError(404, '의류를 찾을 수 없습니다.');
  if (cloth.brand?.owner_id !== userId) throw createError(403, '권한이 없습니다.');

  // Call AI Service (Now returns { all, front, back })
  const images = await require('./aiService').generateDesignImage(clothId, prompt);

  // Update Cloth with Front/Back
  await prisma.cloth.update({
    where: { clothing_id: clothId },
    data: {
      final_result_front_url: images.front,
      final_result_back_url: images.back,
      thumbnail_url: images.front
    }
  });

  // Save as DesignAttempt
  const attempt = await prisma.designAttempt.create({
    data: {
      clothing_id: clothId,
      input_images: [],
      design_prompt: prompt,
      ai_result_url: images.all, // Store the combined one here
    }
  });

  // Return combined info
  return { ...attempt, front: images.front, back: images.back };
};
