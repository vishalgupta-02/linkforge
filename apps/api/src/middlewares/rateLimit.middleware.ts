// middlewares/rateLimit.middleware.ts

// middleware/rateLimit.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { publicRateLimiter, authRateLimiter } from "./rateLimit.ts";

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🔐 If user is authenticated
    if (req.user?.id) {
      await authRateLimiter.consume(req.user.id);
    } else {
      // 🌐 Use IP for public users
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

      await publicRateLimiter.consume(ip as string);
    }

    next();
  } catch (rejRes: any) {
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);

    res.setHeader("Retry-After", retryAfter);

    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      meta: {
        retryAfter,
      },
    });
  }
};
