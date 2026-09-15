import type { Request, Response, NextFunction } from "express";
import {
  httpRequestCounter,
  httpRequestDurationHistogram,
} from "../lib/metrics.ts";

/**
 * Extracts a normalized, bounded route label from the Express request.
 * 
 * Strict cardinality safety rules:
 * 1. Prefer matched Express route patterns (e.g. `/api/v1/links/update/:id`).
 * 2. Static root routes like `/health` or `/` resolve to their exact path.
 * 3. Any unmatched route, 404, or catch-all wildcard (`/{*path}`) resolves to `"unknown"`
 *    to prevent high-cardinality label explosion from arbitrary scanner/attacker URLs.
 */
export function getNormalizedRoute(req: Request, res: Response): string {
  // If response is 404 and did not match a specific application route, keep it bounded
  if (res.statusCode === 404 && (!req.route || req.route.path === "/{*path}")) {
    return "unknown";
  }

  if (req.route?.path) {
    // If the catch-all 404 router matched
    if (req.route.path === "/{*path}" || req.route.path === "*") {
      return "unknown";
    }

    const base = req.baseUrl || "";
    const routePath =
      req.route.path === "/" && base
        ? ""
        : typeof req.route.path === "string"
        ? req.route.path
        : String(req.route.path);

    return `${base}${routePath}`;
  }

  // Handle known top-level static routes if req.route was not populated
  const rawPath = (req.originalUrl || req.path || "").split("?")[0] || "/";
  if (rawPath === "/" || rawPath === "/health" || rawPath === "/api/me") {
    return rawPath;
  }

  return "unknown";
}

/**
 * Express Middleware for Prometheus HTTP Metrics Instrumentation.
 * 
 * Tracks:
 * - Total HTTP requests counter (`http_requests_total`)
 * - Request duration histogram (`http_request_duration_seconds`)
 * 
 * Guarantees:
 * - Excludes `/metrics` scraping requests to prevent self-referential metrics inflation.
 * - Records response duration using high-precision process.hrtime.bigint().
 * - Records metrics exactly once per request upon response completion (finish/close).
 * - Safe against 4xx/5xx errors, unhandled exceptions, and async route rejections.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Do not record metrics for the Prometheus scrape endpoint itself
  const rawPath = (req.originalUrl || req.path || "").split("?")[0];
  if (rawPath === "/metrics") {
    next();
    return;
  }

  const startHrTime = process.hrtime.bigint();
  let recorded = false;

  const recordMetrics = () => {
    if (recorded) return;
    recorded = true;

    const endHrTime = process.hrtime.bigint();
    const durationSeconds = Number(endHrTime - startHrTime) / 1e9;

    const method = req.method ? req.method.toUpperCase() : "UNKNOWN";
    const route = getNormalizedRoute(req, res);
    const statusCode = String(res.statusCode || 500);

    const labels = {
      method,
      route,
      status_code: statusCode,
    };

    try {
      httpRequestCounter.inc(labels, 1);
      httpRequestDurationHistogram.observe(labels, durationSeconds);
    } catch {
      // Metrics collection failures must never interrupt HTTP response delivery
    }
  };

  res.once("finish", recordMetrics);
  res.once("close", recordMetrics);

  next();
}
