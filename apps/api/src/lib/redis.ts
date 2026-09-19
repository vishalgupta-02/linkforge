import { Redis } from "ioredis";
import * as Sentry from "@sentry/node";
import { logger } from "./logger.ts";

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

redis.on("connect", () => {
  logger.info("Redis connected successfully", {
    event: "redis.connect.success",
  });
});

redis.on("error", (error: unknown) => {
  logger.error(
    "Redis connection error",
    { event: "redis.connection.error" },
    error instanceof Error ? error : new Error(String(error)),
  );
  if (process.env.NODE_ENV === "production" && error instanceof Error) {
    Sentry.captureException(error);
  }
});
