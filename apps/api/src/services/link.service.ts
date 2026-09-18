import { FREE_LINK_LIMIT } from "../configs/base.config.ts";
import { prisma } from "../db/client.ts";
import { CACHE_KEYS, REDIRECT_CACHE_TTL } from "../lib/cache-keys.ts";
import { redis } from "../lib/redis.ts";
import { AppError } from "../utils/api-error.ts";
import { normalizeUsername } from "../utils/username.ts";
import { isProPlan } from "../utils/plan.ts";
import { recordLinkCreated } from "../lib/metrics.ts";
import { generatePublicId } from "../utils/public-id.ts";

export const createLink = async (userId: string, data: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      userName: true,
      plan: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!isProPlan(user.plan)) {
    const activeCount = await prisma.link.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (activeCount >= FREE_LINK_LIMIT) {
      throw new AppError(
        "Free plan allows up to 8 links. Upgrade to add more.",
        403,
        "LINK_LIMIT_REACHED",
        {
          limit: FREE_LINK_LIMIT,
          upgrade: true,
        },
      );
    }
  }

  const { publicId: _ignored, ...cleanData } = data;
  const publicId = generatePublicId();

  const link = await prisma.link.create({
    data: {
      ...cleanData,
      publicId,
      userId,
    },
  });

  recordLinkCreated();

  if (user.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
  }
  return link;
};

export const getLinks = async (userId: string) => {
  return prisma.link.findMany({
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

export const updateLink = async (userId: string, linkId: string, data: any) => {

  const link = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (link.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (link.deletedAt !== null) {
    throw new AppError("Link has been deleted", 410);
  }

  const { publicId: _ignored, ...cleanData } = data;

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: cleanData,
  });

  if (link.publicId) {
    await redis.del(CACHE_KEYS.redirect(link.publicId));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
  }

  return updated;
};

export const deleteLink = async (userId: string, linkId: string) => {

  const link = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (link.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (link.deletedAt !== null) {
    throw new AppError("Link already deleted", 410);
  }

  const deleted = await prisma.link.update({
    where: { id: linkId },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  if (link.publicId) {
    await redis.del(CACHE_KEYS.redirect(link.publicId));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
  }

  return deleted;
};

export const reorderLinks = async (userId: string, linkIds: string[]) => {

  const links = await prisma.link.findMany({
    where: {
      id: { in: linkIds },
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (links.length !== linkIds.length) {
    throw new AppError("Invalid link IDs", 400);
  }

  await prisma.$transaction(
    linkIds.map((id, index) =>
      prisma.link.update({
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
  }

  return true;
};

export const getPublicLinks = async (username: string) => {
  const normalized = normalizeUsername(username);

  const user = await prisma.user.findUnique({
    where: { userName_lower: normalized },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return prisma.link.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      isActive: true,
      public: true,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      publicId: true,
      url: true,
      title: true,
    },
  });
};

export const getLinkStats = async (userId: string) => {
  const [active, inactive] = await Promise.all([
    prisma.link.count({
      where: { userId, isActive: true, deletedAt: null },
    }),
    prisma.link.count({
      where: { userId, isActive: false, deletedAt: null },
    }),
  ]);

  return {
    active,
    inactive,
  };
};

export const toggleLink = async (userId: string, linkId: string) => {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    throw new AppError("Link not found", 404);
  }

  if (link.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (link.deletedAt !== null) {
    throw new AppError("Link has been deleted", 410);
  }

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: {
      isActive: !link.isActive,
    },
  });

  if (link.publicId) {
    await redis.del(CACHE_KEYS.redirect(link.publicId));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  if (user?.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
  }

  return updated;
};

export const getLinkById = async (id: string) => {
  return prisma.link.findUnique({
    where: { id },
    select: {
      id: true,
      publicId: true,
      url: true,
      userId: true,
      isActive: true,
      deletedAt: true,
    },
  });
};

export const getLinkByPublicId = async (publicId: string) => {
  const cacheKey = CACHE_KEYS.redirect(publicId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {

  }

  const link = await prisma.link.findUnique({
    where: { publicId },
    select: {
      id: true,
      publicId: true,
      url: true,
      userId: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!link || !link.isActive || link.deletedAt !== null) {
    return null;
  }

  try {
    await redis.set(
      cacheKey,
      JSON.stringify(link),
      "EX",
      REDIRECT_CACHE_TTL,
    );
  } catch (error) {

  }

  return link;
};
