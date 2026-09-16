import { Router } from "express";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import { Sentry } from "../../lib/sentry.ts";
import { sleep } from "../../utils/sleep.ts";
import { AppError } from "../../utils/api-error.ts";

const router: Router = Router();

/**
 * Temporary Sentry Verification Endpoints
 * Strictly development/test only — disabled in production.
 */

// Production guard middleware for test endpoints
router.use((_req, _res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Not Found", 404));
  }
  next();
});

// Authenticated test error endpoint (requires valid session)
router.get("/auth", protectedRoute, (_req, _res) => {
  throw new Error("Sentry rich context integration test");
});

// Controlled Performance Test Endpoint
// Generates measurable multi-step transaction with child spans
router.get("/performance", async (_req, res, next) => {
  try {
    const result = await Sentry.startSpan(
      { name: "sentry-performance-test-operation", op: "custom.test" },
      async () => {
        // Child span 1: Simulated Redis Cache lookup
        const cacheResult = await Sentry.startSpan(
          { name: "cache.check", op: "cache.get" },
          async () => {
            await sleep(20);
            return { hit: false };
          },
        );

        // Child span 2: Simulated Database query
        const dbResult = await Sentry.startSpan(
          { name: "db.query.sample_data", op: "db.query" },
          async () => {
            await sleep(50);
            return { records: 42 };
          },
        );

        // Child span 3: Computation & serialization
        return Sentry.startSpan(
          { name: "data.serialization", op: "serialize" },
          () => {
            return {
              status: "success",
              cached: cacheResult.hit,
              dataCount: dbResult.records,
              durationMs: "~70ms",
            };
          },
        );
      },
    );

    return res.json({
      success: true,
      message: "Sentry performance transaction completed successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

// Default test endpoint
router.get("/", (_req, _res) => {
  throw new Error("Sentry rich context integration test");
});

export default router;

