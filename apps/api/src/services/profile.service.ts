import { prisma } from "../db/client.ts";
import { AppError } from "../utils/api-error.ts";
import cloudinary from "../lib/cloudinary.ts";
import { uploadImage } from "../services/upload.service.ts";
import { redis } from "../lib/redis.ts";
import { normalizeUsername } from "../utils/username.ts";
import { CACHE_KEYS } from "../lib/cache-keys.ts";
import { sleep } from "../utils/sleep.ts";

type UpdateProfileInput = {
  userId: string;
  name?: string | undefined;
  bio?: string | undefined;
  image?: string | undefined;
};

const CACHE_TTL = 60 * 5;

export const getPublicProfile = async (username: string) => {
  const normalized = username.toLowerCase();

  const cacheKey = CACHE_KEYS.publicProfile(normalized);

  const lockKey = CACHE_KEYS.profileLock(normalized);

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const lock = await redis.set(
    lockKey,
    "1",
    "EX",
    5,
    "NX",
  );

  if (lock) {
    try {

      const profile = await prisma.user.findUnique({
        where: {
          userName_lower: normalized,
        },

        select: {
          name: true,
          userName: true,
          bio: true,
          image: true,

          links: {
            where: {
              isActive: true,
              deletedAt: null,
              public: true,
            },

            orderBy: {
              position: "asc",
            },

            select: {
              publicId: true,
              title: true,
              url: true,
              position: true,
            },
          },

          socialLinks: {
            where: {
              isActive: true,
              deletedAt: null,
            },

            orderBy: {
              position: "asc",
            },

            select: {
              publicId: true,
              platform: true,
              url: true,
              position: true,
            },
          },
        },
      });

      if (!profile) {
        return null;
      }

      await redis.set(cacheKey, JSON.stringify(profile), "EX", CACHE_TTL);

      return profile;
    } finally {

      await redis.del(lockKey);
    }
  }

  await sleep(100);

  const retry = await redis.get(cacheKey);

  if (retry) {
    return JSON.parse(retry);
  }

  return null;
};

export const updateProfile = async ({
  userId,
  name,
  bio,
  image,
}: UpdateProfileInput) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(image !== undefined && { image }),
    },
    select: {
      id: true,
      name: true,
      userName: true,
      bio: true,
      image: true,
    },
  });

  if (updatedUser.userName) {
    await redis.del(CACHE_KEYS.publicProfile(updatedUser.userName));
  }

  return updatedUser;
};

export const updateProfileImage = async (
  userId: string,
  fileBuffer: Buffer,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        image: true,
        imagePublicId: true,
      },
    });

    if (user?.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.imagePublicId);
      } catch (error) {
        console.log("Error deleting previous one", error);
      }
    }

    const result: any = await uploadImage(fileBuffer);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        image: result.secure_url,
        imagePublicId: result.public_id,
      },
    });

    if (updatedUser.userName) {
      await redis.del(CACHE_KEYS.publicProfile(updatedUser.userName));
    }

    return updatedUser;
  } catch (error) {
    console.log("Error while updating profile image", error);
    throw new AppError("Error while updating profile image", 500);
  }
};

export const getPublicProfileByUserId = async (userId: string) => {
  try {
    const profile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        userName: true,
        plan: true,
        bio: true,
        image: true,
        email: true,
      },
    });

    return profile;
  } catch (error) {
    console.log("Error fetching profile by user ID", error);
    throw new AppError("Error fetching profile", 500);
  }
};
