
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "apps/api/generated/prisma/client.ts";
import { captureSentryWithRichContext } from "../utils/sentry-context.ts";
import { logger } from "../lib/logger.ts";

const NODE_ENV = process.env.NODE_ENV || "development";

type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data: T | null;
  code?: string;
  meta?: unknown;
  error?: unknown;
};

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,

  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = undefined;
  let code: string | undefined = undefined;
  let meta: unknown = undefined;

  if (err && typeof err === "object" && "statusCode" in err) {
    statusCode = (err as { statusCode: number }).statusCode;
    message = (err as { message?: string }).message || message;
    code = (err as { code?: string }).code;
    meta = (err as { meta?: unknown }).meta;
  }

  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    if (err.code === "P2002") {
      message = "Unique constraint failed";
      errorDetails = err.meta;
    } else {
      message = "Database error";
      errorDetails = err.message;
    }
  }

  else if (err instanceof Error) {
    message = err.message || message;
  }

  logger.error("HTTP request error", {
    event: "api.request.error",
    method: req.method,
    route: (req.baseUrl || "") + (req.route?.path || req.path || req.originalUrl?.split("?")[0] || "unknown"),
    statusCode,
  }, err);

  if (statusCode >= 500 && process.env.SENTRY_DSN) {
    captureSentryWithRichContext(err, req).catch(() => {

    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    data: null,
    ...(code ? { code } : {}),
    ...(meta ? { meta } : {}),
  };

  if (NODE_ENV === "development") {
    response.error = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      details: errorDetails,
    };
  }

  return res.status(statusCode).json(response);
}
