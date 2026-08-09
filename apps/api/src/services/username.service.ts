// services/username.service.ts
import { prisma } from "../db/client.ts";
import { AppError } from "../utils/api-error.ts";
import {
  normalizeUsername,
  isValidUsername,
  isReservedUsername,
} from "../utils/username.ts";

export const checkUsernameAvailability = async (username: string) => {
  const normalized = normalizeUsername(username);

  if (!isValidUsername(normalized)) {
    throw new AppError("Not a valid username", 400);
  }

  if (isReservedUsername(normalized)) {
    throw new AppError("This username is not available", 400);
  }

  const existing = await prisma.user.findUnique({
    where: { userName_lower: normalized },
    select: { id: true },
  });

  return {
    available: !existing,
  };
};

export const isUsernameAvailable = async (
  username: string,
): Promise<boolean> => {
  try {
    const normalized = username.toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        userName_lower: normalized,
      },
      select: { id: true },
    });

    return user === null;
  } catch (error) {
    console.log("Username is taken", error);
    return false;
  }
};

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const changeUsername = async (userId: string, newUsername: string) => {
  const normalized = newUsername.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      userName_lower: true,
      lastUsernameChangedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.userName_lower === normalized) {
    throw new AppError("Username is the same", 400);
  }

  if (user.lastUsernameChangedAt) {
    const lastChange = new Date(user.lastUsernameChangedAt).getTime();
    const now = Date.now();

    if (now - lastChange < THIRTY_DAYS) {
      const remaining = THIRTY_DAYS - (now - lastChange);

      const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

      throw new AppError(`You can change username in ${daysLeft} days`, 403);
    }
  }

  const existing = await prisma.user.findUnique({
    where: { userName_lower: normalized },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Username already taken", 409);
  }

  try {
    return prisma.user.update({
      where: { id: userId },
      data: {
        username: newUsername,
        userName_lower: normalized,
        lastUsernameChangedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
      },
    });
  } catch (error) {
    throw new AppError("Username already taken", 409);
  }
};

// const getUsername = () => {};
