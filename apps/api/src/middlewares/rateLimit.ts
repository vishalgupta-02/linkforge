// middleware/rateLimit.ts
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { redis } from "../lib/redis.ts";

// 🌐 Public (IP-based distributed limiter)
export const publicRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:public",
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
  inmemoryBlockOnConsumed: 100,
  insuranceLimiter: new RateLimiterMemory({
    points: 100,
    duration: 60,
  }),
});

// 🔐 Authenticated (user-based distributed limiter)
export const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:auth",
  points: 1000,
  duration: 60,
  inmemoryBlockOnConsumed: 1000,
  insuranceLimiter: new RateLimiterMemory({
    points: 1000,
    duration: 60,
  }),
});

