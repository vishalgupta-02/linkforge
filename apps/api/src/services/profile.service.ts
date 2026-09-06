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
  bio?: string | undefined;
  image?: string | undefined;
};

// export const getPublicProfile = async (username: string) => {
//   const normalized = normalizeUsername(username);

//   const user = await prisma.user.findFirst({
//     where: { userName_lower: normalized },
//     select: {
//       id: true,
//       userName: true,
//       createdAt: true,
//       name: true,
//       links: {
//         where: {
//           public: true,
//         },
//         select: {
//           id: true,
//           title: true,
//           url: true,
//           position: true,
//           sectionId: true,
//         },
//         orderBy: { position: "asc" },
//       },
//       linkSection: true,
//     },
//   });

//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   const publicData = {
//     userId: user.id,
//     name: user.name,
//     userName: user.userName,
//     email: user.email,
//     createdAt: user.createdAt,
//     links: user.links,
//     sections: user.linkSection,
//   };

//   return publicData;
// };

// export const getPublicProfile = async (username: string) => {
//   const start = performance.now();

//   // 🔑 Cache key
//   const cacheKey = `profile:${username}`;

//   // 🔥 1. Check Redis
//   const cached = await redis.get(cacheKey);

//   if (cached) {
//     const end = performance.now();

//     console.log(`⚡ Cache HIT: ${(end - start).toFixed(2)}ms`);

//     return JSON.parse(cached);
//   }

//   // ❌ Cache miss
//   console.log("❌ Cache MISS");

//   // 🔥 2. Query DB
//   const profile = await prisma.user.findUnique({
//     where: {
//       userName_lower: normalizeUsername(username),
//     },

//     select: {
//       id: true,
//       name: true,
//       userName: true,
//       bio: true,
//       image: true,

//       links: {
//         where: {
//           isActive: true,
//         },

//         orderBy: {
//           position: "asc",
//         },

//         select: {
//           id: true,
//           title: true,
//           url: true,
//         },
//       },
//     },
//   });

//   if (!profile) {
//     return null;
//   }

//   // 🔥 3. Store in Redis
//   await redis.set(
//     cacheKey,
//     JSON.stringify(profile),

//     // expire in 5 min
//     "EX",
//     60 * 5,
//   );

//   const end = performance.now();

//   console.log(`🐘 DB Query: ${(end - start).toFixed(2)}ms`);

//   return profile;
// };

// export const getPublicProfile = async (username: string) => {
//   const normalized = username.toLowerCase();

//   const cacheKey = CACHE_KEYS.publicProfile(normalized);

//   // 🔥 Redis lookup
//   const cached = await redis.get(cacheKey);

//   if (cached) {
//     console.log("⚡ Cache HIT");

//     return JSON.parse(cached);
//   }

//   console.log("❌ Cache MISS");

//   // 🔥 DB query
//   const profile = await prisma.user.findUnique({
//     where: {
//       userName_lower: normalized,
//     },

//     select: {
//       id: true,
//       name: true,
//       userName: true,
//       bio: true,
//       image: true,

//       links: {
//         where: {
//           isActive: true,
//         },

//         orderBy: {
//           position: "asc",
//         },

//         select: {
//           id: true,
//           title: true,
//           url: true,
//         },
//       },
//     },
//   });

//   if (!profile) {
//     return null;
//   }

//   // 🔥 Cache profile
//   await redis.set(cacheKey, JSON.stringify(profile), "EX", 60 * 5);

//   return profile;
// };

const CACHE_TTL = 60 * 5;

export const getPublicProfile = async (username: string) => {
  const normalized = username.toLowerCase();

  const cacheKey = CACHE_KEYS.publicProfile(normalized);

  const lockKey = CACHE_KEYS.profileLock(normalized);

  // 🔥 1. Check cache
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // 🔥 2. Try acquiring mutex lock
  const lock = await redis.set(
    lockKey,
    "1",
    // only set if NOT exists
    "NX",
    // auto-expire lock
    "EX",
    5,
  );

  // ✅ THIS request owns lock
  if (lock) {
    try {
      // 🔥 Query DB
      const profile = await prisma.user.findUnique({
        where: {
          userName_lower: normalized,
        },

        select: {
          id: true,
          name: true,
          userName: true,
          bio: true,
          image: true,
          email: true,

          links: {
            where: {
              isActive: true,
            },

            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              title: true,
              url: true,
              isActive: true,
              scheduledStart: true,
              scheduledEnd: true,
              public: true,
              position: true,
            },
          },
        },
      });

      if (!profile) {
        return null;
      }

      // 🔥 Store in cache
      await redis.set(cacheKey, JSON.stringify(profile), "EX", CACHE_TTL);

      return profile;
    } finally {
      // 🔥 Release lock
      await redis.del(lockKey);
    }
  }

  // wait briefly
  await sleep(100);

  // 🔥 Retry cache
  const retry = await redis.get(cacheKey);

  if (retry) {
    return JSON.parse(retry);
  }

  return null;
};

export const updateProfile = async ({
  userId,
  bio,
  image,
}: UpdateProfileInput) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(bio !== undefined && { bio }),
      ...(image !== undefined && { image }),
    },
    select: {
      id: true,
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

// For uploading - order must be fetch → destroy → upload → DB write.

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

    // 2. Upload new image
    const result: any = await uploadImage(fileBuffer);

    // 4. Update DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        image: result.secure_url,
        imagePublicId: result.public_id,
      },
    });

    // 5. Invalidate cache - & if username exists, invalidate public profile cache
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
        userName: true,
        plan: true,
      },
    });

    return profile;
  } catch (error) {
    console.log("Error fetching profile by user ID", error);
    throw new AppError("Error fetching profile", 500);
  }
};

