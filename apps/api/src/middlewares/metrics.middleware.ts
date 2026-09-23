import type { Request, Response, NextFunction } from "express";
import {
  httpRequestCounter,
  httpRequestDurationHistogram,
} from "../lib/metrics.ts";

export function getNormalizedRoute(req: Request, res: Response): string {

  if (res.statusCode === 404 && (!req.route || req.route.path === "/{*path}")) {
    return "unknown";
  }

  if (req.route?.path) {

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

  const rawPath = (req.originalUrl || req.path || "").split("?")[0] || "/";
  if (rawPath === "/" || rawPath === "/health" || rawPath === "/api/me") {
    return rawPath;
  }

  return "unknown";
}

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {

  const rawPath = (req.originalUrl || req.path || "").split("?")[0];
  if (rawPath === "/metrics") {
    next();
    return;
  }

  const startHrTime = process.hrtime.bigint();
  let recorded = false;

  const recordMetrics = () => {
    res.removeListener("finish", recordMetrics);
    res.removeListener("close", recordMetrics);
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

    }
  };

  res.once("finish", recordMetrics);
  res.once("close", recordMetrics);

  next();
}
