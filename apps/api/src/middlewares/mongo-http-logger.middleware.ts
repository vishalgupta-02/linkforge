import type { Request, Response, NextFunction } from "express";
 import { recordMongoLog } from "../lib/mongo-logger.ts";
import { getRequestId, getUserId } from "../lib/request-context.ts";
import { getTraceContext } from "../utils/tracing-utils.ts";
import { scrubSensitiveData } from "../lib/logger.ts";

export const mongoHttpLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Store HTTP logs in MongoDB for production only, not for development
  if (process.env.NODE_ENV !== "production" && process.env.FORCE_MONGO_LOGS !== "true") {
    return next();
  }

  const startTime = process.hrtime();
  const originalUrl = req.originalUrl || req.url;

  // Track finished response
  res.on("finish", () => {
    // Avoid spamming with internal favicon or static assets if needed, or record as trace
    const isFavicon = originalUrl === "/favicon.ico";
    if (isFavicon) return;

    const diff = process.hrtime(startTime);
    const durationMs = Number(((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2));
    const statusCode = res.statusCode;

    const reqId = getRequestId() || (req.headers["x-request-id"] as string) || null;
    const userId = getUserId() || (req as any).user?.id || null;
    const traceCtx = getTraceContext();

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "unknown";

    const isError = statusCode >= 500;
    const isWarn = statusCode >= 400 && statusCode < 500;
    const level = isError ? "error" : isWarn ? "warn" : "info";

    const query = scrubSensitiveData(req.query);
    const body = req.body && typeof req.body === "object" ? scrubSensitiveData(req.body) : null;

    recordMongoLog({
      timestamp: new Date(),
      level,
      category: "http",
      message: `${req.method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`,
      requestId: reqId,
      userId,
      traceId: traceCtx.traceId || null,
      spanId: traceCtx.spanId || null,
      method: req.method,
      route: req.route?.path || originalUrl.split("?")[0],
      statusCode,
      durationMs,
      clientIp,
      userAgent,
      metadata: {
        method: req.method,
        url: originalUrl,
        statusCode,
        durationMs,
        clientIp,
        userAgent,
        query,
        ...(req.method !== "GET" && body ? { body } : {}),
      },
    });
  });

  next();
};
