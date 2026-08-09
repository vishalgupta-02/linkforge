import { FREE_LINK_LIMIT } from "../configs/base.config.ts";
import { prisma } from "../db/client.ts";
import { CACHE_KEYS } from "../lib/cache-keys.ts";
import { redis } from "../lib/redis.ts";
import { AppError } from "../utils/api-error.ts";
import { normalizeUsername } from "../utils/username.ts";

// export const createLink = async (userId: string, data: any) => {
//   return prisma.link.create({
//     data: {
//       ...data,
//       userId,
//     },
//   });
// };

export const createLink = async (userId: string, data: any) => {
  // 🔍 Count active links
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

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      userName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const link = await prisma.link.create({
    data: {
      ...data,
      userId,
    },
  });

  // 🔥 Invalidate public profile cache
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
    orderBy: { createdAt: "desc" },
  });
};

export const updateLink = async (userId: string, linkId: string, data: any) => {
  // First verify the link exists and belongs to the user
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

  return prisma.link.update({
    where: { id: linkId },
    data,
  });
};

export const deleteLink = async (userId: string, linkId: string) => {
  // First verify the link exists and belongs to the user
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

  return prisma.link.update({
    where: { id: linkId },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
};

export const reorderLinks = async (userId: string, linkIds: string[]) => {
  // 🔒 Ensure all links belong to user
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

  // 🔥 Transaction for atomic update
  await prisma.$transaction(
    linkIds.map((id, index) =>
      prisma.link.update({
        where: { id },
        data: { position: index },
      }),
    ),
  );

  return true;
};

export const getPublicLinks = async (username: string) => {
  //   return prisma.link.findMany({
  //     where: {
  //       userId,
  //       isDeleted: false,
  //       isActive: true, // 👈 critical
  //     },
  //     orderBy: {
  //       createdAt: "asc",
  //     },
  //   });

  const normalized = normalizeUsername(username);

  // 🔍 Step 1: find user
  const user = await prisma.user.findUnique({
    where: { userName_lower: normalized },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 🔗 Step 2: fetch links
  return prisma.link.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      isActive: true,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
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

export const getLinkById = async (id: string) => {
  return prisma.link.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      userId: true,
      isActive: true,
      deletedAt: true,
    },
  });
};
