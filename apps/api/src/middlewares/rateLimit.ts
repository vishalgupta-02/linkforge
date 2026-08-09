// middleware/rateLimit.ts
import { RateLimiterMemory } from "rate-limiter-flexible";

// 🌐 Public (IP-based)
export const publicRateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

// 🔐 Authenticated (user-based)
export const authRateLimiter = new RateLimiterMemory({
  points: 1000,
  duration: 60,
});
