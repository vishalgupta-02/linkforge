import { redis } from "../lib/redis.ts";
import { CACHE_KEYS, LIVE_VISITOR_TTL } from "../lib/cache-keys.ts";

export const createLiveVisitor = async (userId: string, sessionId: string) => {
  const key = CACHE_KEYS.liveVisitorZSet(userId);
  const expireAt = Date.now() + LIVE_VISITOR_TTL * 1000;

  await redis.zadd(key, expireAt, sessionId);
  await redis.expire(key, LIVE_VISITOR_TTL * 2);
};

export const refreshLiveVisitor = async (userId: string, sessionId: string) => {
  await createLiveVisitor(userId, sessionId);
};

export const removeLiveVisitor = async (userId: string, sessionId: string) => {
  const key = CACHE_KEYS.liveVisitorZSet(userId);

  await redis.zrem(key, sessionId);
};

export const getLiveVisitorCount = async (userId: string) => {
  const key = CACHE_KEYS.liveVisitorZSet(userId);
  const now = Date.now();

  // Prune expired entries in O(log(N) + M)
  await redis.zremrangebyscore(key, "-inf", now);

  // Return active visitor count in O(1)
  return await redis.zcard(key);
};


