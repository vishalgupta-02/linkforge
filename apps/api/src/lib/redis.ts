import Redis from "ioredis";
import * as Sentry from "@sentry/node";
import { logger } from "./logger.ts";


export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || "codemonkey",
      maxRetriesPerRequest: null,
    });

redis.on("connect", () => {
  logger.info("Redis connected successfully", { event: "redis.connect.success" });
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { event: "redis.connection.error" }, error);
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error);
  }
});

