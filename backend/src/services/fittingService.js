const prisma = require('../config/prisma');
const { createError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validator');
const { toFrontendFittingHistory } = require('../utils/transformers');
const notificationService = require('./notificationService');
const aiService = require('./aiService'); // Added

exports.createFitting = async (userId, payload) => {
  requireFields(payload, ['base_photo_url']);

  return prisma.fitting.create({
    data: {
      user_id: userId,
      base_photo_url: payload.base_photo_url,
      internal_cloth_ids: payload.internal_cloth_ids || [],
      external_cloth_urls: payload.external_cloth_urls || [],
      note: payload.note || null,
      tags: payload.tags || [],
      status: payload.status || 'PENDING',
      is_shared: payload.is_shared ?? false,
    },
  });
};

exports.listFittings = async (userId) => {
  return prisma.fitting.findMany({
    where: { user_id: userId, deleted_at: null },
    include: { results: true },
    orderBy: { created_at: 'desc' },
  });
};

exports.getFittingDetail = async (userId, fittingId) => {
  const fitting = await prisma.fitting.findUnique({
    where: { fitting_id: fittingId },
    include: { results: true },
  });
  if (!fitting || fitting.user_id !== userId) {
    throw createError(404, '피팅을 찾을 수 없습니다.');
  }
  return fitting;
};

exports.createFittingResult = async (userId, fittingId, payload) => {
  requireFields(payload, ['result_img_url', 'generation_prompt']);

  const fitting = await prisma.fitting.findUnique({
    where: { fitting_id: fittingId },
  });
  if (!fitting || fitting.user_id !== userId) {
    throw createError(404, '피팅을 찾을 수 없습니다.');
  }

  const result = await prisma.fittingResult.create({
    data: {
      fitting_id: fittingId,
      user_id: userId,
      result_img_url: payload.result_img_url,
      generation_prompt: payload.generation_prompt,
      fit_score: payload.fit_score || null,
      error_msg: payload.error_msg || null,
    },
  });

  if (payload.status) {
    await prisma.fitting.update({
      where: { fitting_id: fittingId },
      data: { status: payload.status },
    });

    if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
      const message =
        payload.status === 'COMPLETED'
          ? 'AI 피팅 결과가 생성되었습니다.'
          : 'AI 피팅에 실패했습니다. 토큰 반환 안내를 확인해주세요.';

      await notificationService.createNotification({
        userId,
        title: 'AI 피팅 결과',
        message,
        type: 'GENERAL',
        url: `/fittings/${fittingId}`,
        data: { fitting_id: fittingId, status: payload.status },
      });
    }
  }

  return result;
};

exports.listFittingAlbum = async (userId) => {
  const fittings = await prisma.fitting.findMany({
    where: { user_id: userId, deleted_at: null },
    include: { results: { orderBy: { created_at: 'desc' }, take: 1 } },
    orderBy: { created_at: 'desc' },
  });

  return fittings.map((fitting) => toFrontendFittingHistory(fitting));
};

exports.generateFittingImage = async (userId, fittingId) => {
  const fitting = await prisma.fitting.findUnique({
    where: { fitting_id: fittingId },
  });
  if (!fitting || fitting.user_id !== userId) {
    throw createError(404, '피팅을 찾을 수 없습니다.');
  }

  await prisma.fitting.update({
    where: { fitting_id: fittingId },
    data: { status: 'PROCESSING' },
  });

  try {
    // Prepare clothing list for prompt
    // For now, mapping external/internal checks ideally. 
    // Simplified: Assuming fitting.tags or similar holds info, or fetching cloth details
    // using "internal_cloth_ids".
    const clothingList = [];
    if (fitting.internal_cloth_ids && fitting.internal_cloth_ids.length > 0) {
      const cloths = await prisma.cloth.findMany({
        where: { clothing_id: { in: fitting.internal_cloth_ids } }
      });
      cloths.forEach((c, idx) => {
        clothingList.push({
          category: c.category,
          order: c.layer_order || (idx + 1),
          name: c.clothing_name,
          url: c.final_result_front_url // Pass the design image
        });
      });
    }

    // Prepare External Clothing from Tags
    const externalClothItems = [];
    if (fitting.tags) {
      fitting.tags.forEach(tag => {
        if (tag.startsWith('META_CLOTH_JSON:')) {
          try {
            const jsonStr = tag.replace('META_CLOTH_JSON:', '');
            externalClothItems.push(JSON.parse(jsonStr));
          } catch (e) {
            console.error('Failed to parse cloth meta tag', e);
          }
        }
      });
    }

    // If no meta tags but urls exist (legacy or simple upload), fallback to basic
    if (externalClothItems.length === 0 && fitting.external_cloth_urls && fitting.external_cloth_urls.length > 0) {
      fitting.external_cloth_urls.forEach((url, idx) => {
        externalClothItems.push({ url, category: 'UNKNOWN', order: 10 + idx });
      });
    }

    // 1. Generate Try-On
    const tryOnUrl = await aiService.generateFittingResult(
      fittingId,
      fitting.base_photo_url,
      clothingList,
      externalClothItems
    );

    // 2. Generate Mannequin Ver.
    const mannequinUrl = await aiService.generateMannequinResult(fittingId, tryOnUrl);

    // Create Result Record (Primary Try-On)
    const result = await prisma.fittingResult.create({
      data: {
        fitting_id: fittingId,
        user_id: userId,
        result_img_url: tryOnUrl,
        generation_prompt: 'AI Virtual Try-On'
      }
    });

    // Ideally store mannequinUrl too, but schema might not have it.
    // We can store it in a separate result or note.
    // For now, let's create a second result entry or just log it.
    // Creating second result for Mannequin
    await prisma.fittingResult.create({
      data: {
        fitting_id: fittingId,
        user_id: userId,
        result_img_url: mannequinUrl,
        generation_prompt: 'AI Mannequin Transformation'
      }
    });

    await prisma.fitting.update({
      where: { fitting_id: fittingId },
      data: { status: 'COMPLETED' },
    });

    await notificationService.createNotification({
      userId,
      title: 'AI 피팅 완료',
      message: '피팅 결과(착용샷 + 마네킹)가 생성되었습니다.',
      type: 'GENERAL',
      url: `/fittings/${fittingId}`,
      data: { fitting_id: fittingId },
    });

    return { tryOn: tryOnUrl, mannequin: mannequinUrl };
  } catch (error) {
    await prisma.fitting.update({
      where: { fitting_id: fittingId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
};
