
import type { Request, Response, NextFunction } from "express";
import { publicRateLimiter, authRateLimiter } from "./rateLimit.ts";

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  if (
    req.method === "OPTIONS" ||
    req.path === "/health" ||
    req.path === "/metrics"
  ) {
    return next();
  }

  try {

    if (req.user?.id) {
      await authRateLimiter.consume(req.user.id);
    } else {

      const ip =
        (req.ip as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

      await publicRateLimiter.consume(ip);
    }

    next();
  } catch (rejRes: any) {
    const retryAfter = Math.ceil((rejRes?.msBeforeNext || 60000) / 1000);

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
