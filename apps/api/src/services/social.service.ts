import { prisma } from "../db/client.ts";
import { CACHE_KEYS, REDIRECT_CACHE_TTL } from "../lib/cache-keys.ts";
import { redis } from "../lib/redis.ts";
import { AppError } from "../utils/api-error.ts";
import { generatePublicId } from "../utils/public-id.ts";

const formatDestinationUrl = (url: string): string => {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const createSocialLink = async (userId: string, data: {
  platform: string;
  url: string;
  position?: number;
  isActive?: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const existingCount = await prisma.socialLink.count({
    where: {
      userId,
      deletedAt: null,
    },
  });

  const publicId = generatePublicId();
  const formattedUrl = formatDestinationUrl(data.url);

  const socialLink = await prisma.socialLink.create({
    data: {
      userId,
      publicId,
      platform: data.platform.toLowerCase().trim(),
      url: formattedUrl,
      position: data.position ?? existingCount,
      isActive: data.isActive ?? true,
    },
  });

  if (user.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }

  return socialLink;
};

export const getSocialLinks = async (userId: string) => {
  return prisma.socialLink.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: [
      { position: "asc" },
      { createdAt: "asc" },
    ],
  });
};

export const updateSocialLink = async (
  userId: string,
  socialId: string,
  data: {
    platform?: string;
    url?: string;
    position?: number;
    isActive?: boolean;
  },
) => {
  const social = await prisma.socialLink.findUnique({
    where: { id: socialId },
  });

  if (!social) {
    throw new AppError("Social link not found", 404);
  }

  if (social.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (social.deletedAt !== null) {
    throw new AppError("Social link has been deleted", 410);
  }

  const updateData: Record<string, any> = {};
  if (data.platform !== undefined) updateData.platform = data.platform.toLowerCase().trim();
  if (data.url !== undefined) updateData.url = formatDestinationUrl(data.url);
  if (data.position !== undefined) updateData.position = data.position;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updated = await prisma.socialLink.update({
    where: { id: socialId },
    data: updateData,
  });

  if (social.publicId) {
    await redis.del(CACHE_KEYS.redirect(social.publicId));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }

  return updated;
};

export const deleteSocialLink = async (userId: string, socialId: string) => {
  const social = await prisma.socialLink.findUnique({
    where: { id: socialId },
  });

  if (!social) {
    throw new AppError("Social link not found", 404);
  }

  if (social.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (social.deletedAt !== null) {
    throw new AppError("Social link already deleted", 410);
  }

  const deleted = await prisma.socialLink.update({
    where: { id: socialId },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  if (social.publicId) {
    await redis.del(CACHE_KEYS.redirect(social.publicId));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }

  return deleted;
};

export const reorderSocialLinks = async (userId: string, socialIds: string[]) => {
  const socials = await prisma.socialLink.findMany({
    where: {
      id: { in: socialIds },
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (socials.length !== socialIds.length) {
    throw new AppError("Invalid social link IDs provided for reordering", 400);
  }

  await prisma.$transaction(
    socialIds.map((id, index) =>
      prisma.socialLink.update({
        where: { id },
        data: { position: index },
      }),
    ),
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }

  return true;
};

export const getSocialLinkByPublicId = async (publicId: string) => {
  const cacheKey = CACHE_KEYS.redirect(publicId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {

  }

  const social = await prisma.socialLink.findUnique({
    where: { publicId },
    select: {
      id: true,
      publicId: true,
      platform: true,
      url: true,
      userId: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!social || !social.isActive || social.deletedAt !== null) {
    return null;
  }

  try {
    await redis.set(
      cacheKey,
      JSON.stringify(social),
      "EX",
      REDIRECT_CACHE_TTL,
    );
  } catch (error) {

  }

  return social;
};
