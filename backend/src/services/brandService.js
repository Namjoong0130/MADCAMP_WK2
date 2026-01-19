const prisma = require('../config/prisma');
const { createError } = require('../utils/responseHandler');
const { requireFields } = require('../utils/validator');
const { buildHandle } = require('../utils/transformers');
const notificationService = require('./notificationService');

exports.createBrand = async (userId, payload) => {
  requireFields(payload, ['brand_name']);

  const existing = await prisma.brand.findUnique({ where: { owner_id: userId } });
  if (existing) {
    if (!existing.deleted_at) {
      throw createError(400, '??? ?????? ?????? ??????.');
    }
    return prisma.$transaction(async (tx) => {
      const brand = await tx.brand.update({
        where: { brand_id: existing.brand_id },
        data: {
          brand_name: payload.brand_name,
          brand_logo: payload.brand_logo || null,
          brand_story: payload.brand_story || null,
          is_public: payload.is_public ?? true,
          deleted_at: null,
          totalFollowers: 0,
          design_count: 0,
        },
      });
      await tx.user.update({
        where: { user_id: userId },
        data: { is_creator: true },
      });
      return brand;
    });
  }

  return prisma.$transaction(async (tx) => {
    const brand = await tx.brand.create({
      data: {
        owner_id: userId,
        brand_name: payload.brand_name,
        brand_logo: payload.brand_logo || null,
        brand_story: payload.brand_story || null,
        is_public: payload.is_public ?? false,
      },
    });

    await tx.user.update({
      where: { user_id: userId },
      data: { is_creator: true },
    });

    return brand;
  });
};

exports.listPublicBrands = async () => {
  const brands = await prisma.brand.findMany({
    where: { is_public: true, deleted_at: null },
    include: {
      clothes: {
        include: { fund: true },
      },
    },
    orderBy: { brand_id: 'desc' },
  });

  return brands.map((brand) => {
    const funds = brand.clothes
      .map((cloth) => cloth.fund)
      .filter((fund) => fund && fund.status === 'FUNDING');

    const goalSum = funds.reduce((sum, fund) => sum + fund.goal_amount, 0);
    const currentSum = funds.reduce((sum, fund) => sum + fund.current_amount, 0);
    const participantSum = funds.reduce((sum, fund) => sum + fund.participantCount, 0);
    const progress = goalSum > 0 ? currentSum / goalSum : 0;

    return {
      id: brand.brand_id,
      brand: brand.brand_name,
      brand_logo: brand.brand_logo,
      is_public: brand.is_public,
      progress,
      participantCount: participantSum,
      current_amount: currentSum,
    };
  });
};

exports.getBrandDetail = async (brandId) => {
  const brand = await prisma.brand.findUnique({
    where: { brand_id: brandId },
    include: {
      clothes: true,
    },
  });
  if (!brand || brand.deleted_at) throw createError(404, '브랜드를 찾을 수 없습니다.');
  return brand;
};

exports.listBrandProfiles = async () => {
  const brands = await prisma.brand.findMany({
    where: { deleted_at: null },
    include: { owner: true },
    orderBy: { brand_id: 'desc' },
  });

  return Promise.all(
    brands.map(async (brand) => {
      const followingCount = await prisma.follow.count({
        where: { follower_id: brand.owner_id },
      });

      return {
        id: brand.brand_id,
        brand: brand.brand_name,
        brand_logo: brand.brand_logo,
        handle: buildHandle(brand.owner?.userName),
        followerCount: brand.totalFollowers,
        followingCount,
        bio: brand.brand_story || '',
        location: null,
      };
    })
  );
};

exports.getBrandProfile = async (brandId) => {
  const brand = await prisma.brand.findUnique({
    where: { brand_id: brandId },
    include: { owner: true },
  });
  if (!brand || brand.deleted_at) throw createError(404, '브랜드를 찾을 수 없습니다.');

  const followingCount = await prisma.follow.count({
    where: { follower_id: brand.owner_id },
  });

  return {
    id: brand.brand_id,
    brand: brand.brand_name,
    brand_logo: brand.brand_logo,
    handle: buildHandle(brand.owner?.userName),
    followerCount: brand.totalFollowers,
    followingCount,
    bio: brand.brand_story || '',
    location: null,
  };
};

exports.deleteBrand = async (userId, brandId) => {
  const brand = await prisma.brand.findUnique({
    where: { brand_id: brandId },
  });
  if (!brand || brand.deleted_at) {
    throw createError(404, '브랜드를 찾을 수 없습니다.');
  }
  if (brand.owner_id !== userId) {
    throw createError(403, '삭제 권한이 없습니다.');
  }

  return prisma.$transaction(async (tx) => {
    await tx.follow.deleteMany({ where: { target_brand: brandId } });
    const deleted = await tx.brand.update({
      where: { brand_id: brandId },
      data: {
        deleted_at: new Date(),
        is_public: false,
        totalFollowers: 0,
      },
    });
    await tx.user.update({
      where: { user_id: userId },
      data: { is_creator: false },
    });
    return deleted;
  });
};

exports.updateBrand = async (userId, brandId, payload) => {
  const brand = await prisma.brand.findUnique({
    where: { brand_id: brandId },
  });
  if (!brand || brand.deleted_at) {
    throw createError(404, '???? ?? ? ????.');
  }
  if (brand.owner_id !== userId) {
    throw createError(403, '?? ??? ????.');
  }

  const data = {
    brand_name: payload.brand_name,
    brand_logo: payload.brand_logo,
    brand_story: payload.brand_story,
    is_public: payload.is_public,
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  if (Object.keys(data).length == 0) {
    throw createError(400, '??? ??? ????.');
  }

  return prisma.brand.update({
    where: { brand_id: brandId },
    data,
  });
};

exports.toggleFollow = async (userId, brandId) => {
  const brand = await prisma.brand.findUnique({ where: { brand_id: brandId } });
  if (!brand) throw createError(404, '브랜드를 찾을 수 없습니다.');

  const existing = await prisma.follow.findFirst({
    where: { follower_id: userId, target_brand: brandId },
  });

  if (existing) {
    await prisma.follow.delete({ where: { follow_id: existing.follow_id } });
    await prisma.brand.update({
      where: { brand_id: brandId },
      data: { totalFollowers: { decrement: 1 } },
    });
    return { followed: false };
  }

  await prisma.follow.create({
    data: { follower_id: userId, target_brand: brandId },
  });
  await prisma.brand.update({
    where: { brand_id: brandId },
    data: { totalFollowers: { increment: 1 } },
  });

  if (brand.owner_id && brand.owner_id !== userId) {
    await notificationService.createNotification({
      userId: brand.owner_id,
      title: '새 팔로워',
      message: `${brand.brand_name}에 새로운 팔로워가 생겼습니다.`,
      type: 'GENERAL',
      url: `/brands/${brand.brand_id}`,
      data: { brand_id: brand.brand_id },
    });
  }

  return { followed: true };
};
