import pino from "pino";
import * as Sentry from "@sentry/node";
import { getRequestId, getUserId } from "./request-context.ts";
import { getTraceContext } from "../utils/tracing-utils.ts";
import { recordMongoLog } from "./mongo-logger.ts";
import type { LogCategoryType } from "../models/log.model.ts";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  event?: string;
  requestId?: string | null;
  userId?: string | null;
  linkId?: string;
  plan?: string;
  durationMs?: number;
  statusCode?: number;
  route?: string;
  method?: string;
  traceId?: string;
  spanId?: string;
  trace_id?: string;
  span_id?: string;
  err?: unknown;
  error?: unknown;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "apikey",
  "x-api-key",
  "stripe-signature",
  "stripesecretkey",
  "cvv",
  "creditcard",
]);

export function scrubSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = scrubSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const pinoInstance = pino(
  {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    messageKey: "message",
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: {
      paths: [
        "password",
        "*.password",
        "token",
        "*.token",
        "accessToken",
        "*.accessToken",
        "refreshToken",
        "*.refreshToken",
        "authorization",
        "*.authorization",
        "cookie",
        "*.cookie",
        "secret",
        "*.secret",
        "apiKey",
        "*.apiKey",
        "stripe-signature",
        "creditCard",
        "cvv",
      ],
      censor: "[REDACTED]",
    },
  },
  process.stdout,
);

function buildEnrichedLogContext(contextInput?: LogContext | unknown, errInput?: unknown): Record<string, unknown> {
  const currentReqId = getRequestId();
  const currentUserId = getUserId();
  const traceCtx = getTraceContext();

  const baseContext: Record<string, unknown> = {
    requestId: currentReqId ?? null,
    userId: currentUserId ?? null,
  };

  if (traceCtx.traceId) {
    baseContext.traceId = traceCtx.traceId;
    baseContext.spanId = traceCtx.spanId;

    baseContext.trace_id = traceCtx.traceId;
    baseContext.span_id = traceCtx.spanId;
  }

  let userContext: Record<string, unknown> = {};
  if (contextInput && typeof contextInput === "object" && !Array.isArray(contextInput)) {
    userContext = contextInput as Record<string, unknown>;
  }

  const rawError = errInput || userContext.error || userContext.err;
  const errorObj =
    rawError instanceof Error
      ? {
          name: rawError.name,
          message: rawError.message,
          stack: rawError.stack,
        }
      : rawError
      ? { message: String(rawError) }
      : undefined;

  const sanitizedUserContext = (scrubSensitiveData(userContext) as Record<string, unknown>) || {};
  if (errorObj) {
    sanitizedUserContext.error = errorObj;
  }

  return {
    ...baseContext,
    ...sanitizedUserContext,
  };
}

function emitPinoLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown,
): void {
  const enriched = buildEnrichedLogContext(context, error);

  pinoInstance[level](enriched, message);

  try {
    Sentry.addBreadcrumb({
      category: (context?.event as string) || "app.log",
      message,
      level: level === "warn" ? "warning" : level === "error" || level === "fatal" ? "error" : "info",
      data: enriched,
    });
  } catch {

  }

  // Store logs in MongoDB for production only, not for development
  if (process.env.NODE_ENV !== "production" && process.env.FORCE_MONGO_LOGS !== "true") {
    return;
  }

  try {
    const event = String(context?.event || "").toLowerCase();
    let category: LogCategoryType = (context?.category as LogCategoryType) || "general";
    if (event.startsWith("worker.") || event.startsWith("queue.")) category = "worker";
    else if (event.startsWith("auth.") || event.includes("session")) category = "auth";
    else if (event.startsWith("billing.") || event.startsWith("stripe.")) category = "billing";
    else if (event.startsWith("email.") || event.startsWith("resend.")) category = "email";
    else if (event.startsWith("db.") || event.startsWith("prisma.")) category = "database";
    else if (event.startsWith("security.") || event.startsWith("ratelimit") || event.includes("blocked")) category = "security";
    else if (event.startsWith("system.") || event.startsWith("cron.") || event.startsWith("mongo.")) category = "system";
    else if ((level === "error" || level === "fatal") && category === "general") category = "system";

    recordMongoLog({
      level,
      category,
      message,
      requestId: (enriched.requestId as string) || null,
      userId: (enriched.userId as string) || null,
      traceId: (enriched.traceId as string) || (enriched.trace_id as string) || null,
      spanId: (enriched.spanId as string) || (enriched.span_id as string) || null,
      metadata: enriched,
      error: enriched.error as any,
    });
  } catch {
    // Non-blocking fallback
  }
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    emitPinoLog("info", message, context),
  warn: (message: string, context?: LogContext, error?: unknown) =>
    emitPinoLog("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) =>
    emitPinoLog("error", message, context, error),
  debug: (message: string, context?: LogContext) =>
    emitPinoLog("debug", message, context),
  trace: (message: string, context?: LogContext) =>
    emitPinoLog("trace", message, context),
  fatal: (message: string, context?: LogContext, error?: unknown) =>
    emitPinoLog("fatal", message, context, error),
  child: (bindings: pino.Bindings) => pinoInstance.child(bindings),
};
