import { FREE_LINK_LIMIT } from "../configs/base.config.ts";
import { prisma } from "../db/client.ts";
import { CACHE_KEYS, REDIRECT_CACHE_TTL } from "../lib/cache-keys.ts";
import { redis } from "../lib/redis.ts";
import { AppError } from "../utils/api-error.ts";
import { normalizeUsername } from "../utils/username.ts";
import { isProPlan } from "../utils/plan.ts";
import { recordLinkCreated } from "../lib/metrics.ts";
import { generatePublicId } from "../utils/public-id.ts";
import { logger } from "../lib/logger.ts";

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

  // Check link scheduling & custom sections pro gate
  if ((data.scheduledStart || data.scheduledEnd || data.sectionId) && !isProPlan(user.plan)) {
    throw new AppError(
      "Link scheduling and custom sections require a Pro plan. Please upgrade to continue.",
      403,
      "PRO_PLAN_REQUIRED",
    );
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
    include: {
      section: true,
    },
  });

  recordLinkCreated();

  if (user.userName) {
    await redis.del(CACHE_KEYS.publicProfile(user.userName));
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }
  return link;
};

export const getLinks = async (userId: string) => {
  return prisma.link.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      section: {
        select: {
          id: true,
          title: true,
          position: true,
        },
      },
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

  // Check Pro requirement for scheduling and sections
  if (data.scheduledStart || data.scheduledEnd || data.sectionId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user || !isProPlan(user.plan)) {
      throw new AppError(
        "Link scheduling and custom sections require a Pro plan. Please upgrade to continue.",
        403,
        "PRO_PLAN_REQUIRED",
      );
    }
  }

  const { publicId: _ignored, ...cleanData } = data;

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: cleanData,
    include: {
      section: true,
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
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

  const now = new Date();

  return prisma.link.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      isActive: true,
      public: true,
      AND: [
        {
          OR: [
            { scheduledStart: null },
            { scheduledStart: { lte: now } },
          ],
        },
        {
          OR: [
            { scheduledEnd: null },
            { scheduledEnd: { gte: now } },
          ],
        },
      ],
    },
    orderBy: {
      position: "asc",
    },
    select: {
      publicId: true,
      url: true,
      title: true,
      sectionId: true,
      section: {
        select: {
          id: true,
          title: true,
          position: true,
        },
      },
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
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
      scheduledStart: true,
      scheduledEnd: true,
      sectionId: true,
    },
  });
};

export const getLinkByPublicId = async (publicId: string) => {
  const cacheKey = CACHE_KEYS.redirect(publicId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = new Date();
      if (parsed.scheduledStart && now < new Date(parsed.scheduledStart)) {
        return null;
      }
      if (parsed.scheduledEnd && now > new Date(parsed.scheduledEnd)) {
        return null;
      }
      return parsed;
    }
  } catch (error) {
    // Redis miss or error, fallback to database
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
      scheduledStart: true,
      scheduledEnd: true,
    },
  });

  if (!link || !link.isActive || link.deletedAt !== null) {
    return null;
  }

  const now = new Date();
  if (link.scheduledStart && now < new Date(link.scheduledStart)) {
    return null;
  }
  if (link.scheduledEnd && now > new Date(link.scheduledEnd)) {
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
    // Cache write error non-blocking
  }

  return link;
};

// Section Management
export const getSections = async (userId: string) => {
  return prisma.linkSection.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    include: {
      link: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });
};

export const createSection = async (userId: string, title: string, position?: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, userName: true },
  });

  if (!user) throw new AppError("User not found", 404);
  if (!isProPlan(user.plan)) {
    throw new AppError(
      "Section headers require a Pro plan. Please upgrade to continue.",
      403,
      "PRO_PLAN_REQUIRED",
    );
  }

  const count = await prisma.linkSection.count({ where: { userId } });
  const pos = position !== undefined ? position : count;

  const section = await prisma.linkSection.create({
    data: {
      title,
      position: pos,
      userId,
    },
  });

  try {
    if (user.userName) {
      await redis.del(CACHE_KEYS.publicProfile(user.userName));
      await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
    }
  } catch (err) {
    logger.warn("Failed to invalidate profile cache on createSection", { error: err });
  }

  return section;
};

export const updateSection = async (
  userId: string,
  sectionId: string,
  data: { title?: string | undefined; position?: number | undefined },
) => {
  const section = await prisma.linkSection.findUnique({
    where: { id: sectionId },
  });

  if (!section) throw new AppError("Section not found", 404);
  if (section.userId !== userId) throw new AppError("Unauthorized", 403);

  const updated = await prisma.linkSection.update({
    where: { id: sectionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.position !== undefined && { position: data.position }),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  try {
    if (user?.userName) {
      await redis.del(CACHE_KEYS.publicProfile(user.userName));
      await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
    }
  } catch (err) {
    logger.warn("Failed to invalidate profile cache on updateSection", { error: err });
  }

  return updated;
};

export const deleteSection = async (userId: string, sectionId: string) => {
  const section = await prisma.linkSection.findUnique({
    where: { id: sectionId },
  });

  if (!section) throw new AppError("Section not found", 404);
  if (section.userId !== userId) throw new AppError("Unauthorized", 403);

  // Unset sectionId from links under this section
  await prisma.link.updateMany({
    where: { sectionId },
    data: { sectionId: null },
  });

  await prisma.linkSection.delete({
    where: { id: sectionId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userName: true },
  });

  try {
    if (user?.userName) {
      await redis.del(CACHE_KEYS.publicProfile(user.userName));
      await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
    }
  } catch (err) {
    logger.warn("Failed to invalidate profile cache on deleteSection", { error: err });
  }

  return true;
};

export const reorderSections = async (userId: string, sectionIds: string[]) => {
  const sections = await prisma.linkSection.findMany({
    where: { id: { in: sectionIds }, userId },
    select: { id: true },
  });

  if (sections.length !== sectionIds.length) {
    throw new AppError("Invalid section IDs", 400);
  }

  await prisma.$transaction(
    sectionIds.map((id, index) =>
      prisma.linkSection.update({
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
    await redis.del(CACHE_KEYS.publicProfile(user.userName.toLowerCase()));
  }

  return true;
};
