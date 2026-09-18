import { Router } from "express";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import { Sentry } from "../../lib/sentry.ts";
import { sleep } from "../../utils/sleep.ts";
import { AppError } from "../../utils/api-error.ts";

const router: Router = Router();

router.use((_req, _res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Not Found", 404));
  }
  next();
});

router.get("/auth", protectedRoute, (_req, _res) => {
  throw new Error("Sentry rich context integration test");
});

router.get("/performance", async (_req, res, next) => {
  try {
    const result = await Sentry.startSpan(
      { name: "sentry-performance-test-operation", op: "custom.test" },
      async () => {

        const cacheResult = await Sentry.startSpan(
          { name: "cache.check", op: "cache.get" },
          async () => {
            await sleep(20);
            return { hit: false };
          },
        );

        const dbResult = await Sentry.startSpan(
          { name: "db.query.sample_data", op: "db.query" },
          async () => {
            await sleep(50);
            return { records: 42 };
          },
        );

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

router.get("/", (_req, _res) => {
  throw new Error("Sentry rich context integration test");
});

export default router;
