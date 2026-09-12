import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

/**
 * Request Correlation & Request ID Middleware
 * 
 * 1. Reads incoming X-Request-ID header or generates a cryptographically secure UUIDv4.
 * 2. Attaches requestId to Express Request object (`req.id`, `req.requestId`).
 * 3. Echoes X-Request-ID on the response header.
 * 4. Binds requestId to Sentry's current request/isolation scope for end-to-end debugging correlation.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingId = req.headers["x-request-id"] || req.headers["X-Request-ID"];
  const requestId =
    typeof incomingId === "string" && incomingId.trim().length > 0
      ? incomingId.trim()
      : crypto.randomUUID();

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

  next();
}
