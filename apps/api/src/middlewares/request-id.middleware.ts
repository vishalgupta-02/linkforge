import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { runWithContext } from "../lib/request-context.ts";
import { logger } from "../lib/logger.ts";

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function isValidRequestId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  return SAFE_REQUEST_ID_REGEX.test(trimmed);
}

function generateRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingHeader = req.headers["x-request-id"] || req.headers["X-Request-ID"];
  const rawId = Array.isArray(incomingHeader) ? incomingHeader[0] : incomingHeader;

  const requestId = isValidRequestId(rawId) ? rawId.trim() : generateRequestId();

  (req as any).id = requestId;
  (req as any).requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  try {
    Sentry.setTag("requestId", requestId);
    Sentry.setContext("request_correlation", {
      requestId,
      method: req.method,
      path: req.path,
    });
  } catch {

  }

  const startTime = process.hrtime.bigint();

  const attachFinish = (res.once || res.on).bind(res);
  attachFinish("finish", () => {
    const durationNs = process.hrtime.bigint() - startTime;
    const durationMs = Math.round(Number(durationNs) / 1e4) / 100; 

    const normalizedRoute = (req.baseUrl || "") + (req.route?.path || req.path || req.originalUrl?.split("?")[0] || "unknown");
    const isQuietEndpoint = normalizedRoute.startsWith("/health") || normalizedRoute.startsWith("/metrics") || normalizedRoute === "/favicon.ico";

    const completionContext = {
      event: "http.request.completed",
      method: req.method,
      route: normalizedRoute,
      statusCode: res.statusCode,
      durationMs,
    };

    if (isQuietEndpoint) {
      logger.debug("HTTP request completed", completionContext);
    } else if (res.statusCode >= 500) {
      logger.error("HTTP request completed with server error", completionContext);
    } else if (res.statusCode >= 400) {
      logger.warn("HTTP request completed with client error", completionContext);
    } else {
      logger.info("HTTP request completed", completionContext);
    }
  });

  runWithContext(
    {
      requestId,
      userId: null,
      startTime,
      method: req.method,
      route: req.path,
    },
    () => next(),
  );
}
