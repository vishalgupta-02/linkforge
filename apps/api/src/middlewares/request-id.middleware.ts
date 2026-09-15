import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { runWithContext } from "../lib/request-context.ts";
import { logger } from "../lib/logger.ts";

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Validates whether an incoming Request ID header conforms to safety constraints.
 */
function isValidRequestId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  return SAFE_REQUEST_ID_REGEX.test(trimmed);
}

/**
 * Generates a cryptographically secure, unique request identifier.
 */
function generateRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

/**
 * Request Correlation & AsyncLocalStorage Request Context Middleware
 * 
 * 1. Inspects & sanitizes incoming X-Request-ID header (or generates a new secure ID).
 * 2. Echoes X-Request-ID on the response header.
 * 3. Encloses request lifecycle within AsyncLocalStorage request context.
 * 4. Captures monotonic duration on response finish and logs structured request completion.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingHeader = req.headers["x-request-id"] || req.headers["X-Request-ID"];
  const rawId = Array.isArray(incomingHeader) ? incomingHeader[0] : incomingHeader;

  const requestId = isValidRequestId(rawId) ? rawId.trim() : generateRequestId();

  req.id = requestId;
  req.requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  // Attach to Sentry Request Context
  try {
    Sentry.setTag("requestId", requestId);
    Sentry.setContext("request_correlation", {
      requestId,
      method: req.method,
      path: req.path,
    });
  } catch {
    // Sentry context tagging failure must never fail the request
  }

  const startTime = process.hrtime.bigint();

  // Log completion when response finishes
  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - startTime;
    const durationMs = Math.round(Number(durationNs) / 1e4) / 100; // 2 decimal places

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

  // Execute entire downstream middleware & handler chain inside AsyncLocalStorage
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
