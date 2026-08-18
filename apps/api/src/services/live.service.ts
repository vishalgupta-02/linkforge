import { redis } from "../lib/redis.ts";
import { CACHE_KEYS, LIVE_VISITOR_TTL } from "../lib/cache-keys.ts";

export const createLiveVisitor = async (userId: string, sessionId: string) => {
  const key = CACHE_KEYS.liveVisitor(userId, sessionId);

  await redis.set(key, "1", "EX", LIVE_VISITOR_TTL);
};

export const refreshLiveVisitor = async (userId: string, sessionId: string) => {
  const key = CACHE_KEYS.liveVisitor(userId, sessionId);

  const exists = await redis.exists(key);

  if (!exists) {
    await redis.set(key, "1", "EX", LIVE_VISITOR_TTL);
    return;
  }

  await redis.expire(key, LIVE_VISITOR_TTL);
};

export const removeLiveVisitor = async (userId: string, sessionId: string) => {
  const key = CACHE_KEYS.liveVisitor(userId, sessionId);

  await redis.del(key);
};

const scanKeys = async (pattern: string): Promise<string[]> => {
  const keys: string[] = [];

  let cursor = "0";

  do {
    const [nextCursor, foundKeys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );

    cursor = nextCursor;

    keys.push(...foundKeys);
  } while (cursor !== "0");

  return keys;
};

export const getLiveVisitorCount = async (userId: string) => {
  const pattern = CACHE_KEYS.liveVisitorPattern(userId);

  const keys = await scanKeys(pattern);

  return keys.length;
};

