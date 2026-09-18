
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { redis } from "../lib/redis.ts";

export const publicRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:public",
  points: 100, 
  duration: 60, 
  inmemoryBlockOnConsumed: 100,
  insuranceLimiter: new RateLimiterMemory({
    points: 100,
    duration: 60,
  }),
});

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
