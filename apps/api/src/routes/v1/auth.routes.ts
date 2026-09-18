import { Router, type Request, type Response, type NextFunction } from "express";
import {
  forgotPasswordController,
  verifyResetTokenController,
  resetPasswordController,
} from "../../controllers/auth.controller.ts";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { redis } from "../../lib/redis.ts";

const passwordResetLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:pwd-reset",
  points: 5, 
  duration: 15 * 60, 
  inmemoryBlockOnConsumed: 5,
  insuranceLimiter: new RateLimiterMemory({
    points: 5,
    duration: 15 * 60,
  }),
});

const passwordResetRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  try {
    await passwordResetLimiter.consume(ip as string);
    next();
  } catch (rejRes: any) {
    const retryAfter = Math.ceil((rejRes?.msBeforeNext || 60000) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      success: false,
      message: "Too many password reset attempts. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      meta: { retryAfter },
    });
  }
};

const router: Router = Router();

router.post(
  "/forgot-password",
  passwordResetRateLimitMiddleware,
  forgotPasswordController,
);

router.get("/reset-password/verify", verifyResetTokenController);

router.post("/reset-password", resetPasswordController);

export default router;
