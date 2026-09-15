import pino from "pino";
import * as Sentry from "@sentry/node";
import { getRequestId, getUserId } from "./request-context.ts";
import { getTraceContext } from "../utils/tracing-utils.ts";

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

/**
 * Deeply redacts sensitive keys from log context payloads
 */
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

/**
 * Base Pino Logger Instance configured with custom ISO timestamp,
 * string level labels, message key, and sensitive data redaction.
 */
export const pinoInstance = pino({
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
});

/**
 * Normalizes log context by combining:
 * 1. AsyncLocalStorage request context (requestId, userId)
 * 2. Active OpenTelemetry trace context (traceId, spanId)
 * 3. User-supplied log context and error objects
 */
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
    // Also include snake_case for OpenTelemetry backwards compatibility
    baseContext.trace_id = traceCtx.traceId;
    baseContext.span_id = traceCtx.spanId;
  }

  let userContext: Record<string, unknown> = {};
  if (contextInput && typeof contextInput === "object" && !Array.isArray(contextInput)) {
    userContext = contextInput as Record<string, unknown>;
  }

  // Handle passed error objects
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

/**
 * Dispatches log through Pino and records Sentry breadcrumb
 */
function emitPinoLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown,
): void {
  const enriched = buildEnrichedLogContext(context, error);

  // 1. Emit structured JSON via Pino
  pinoInstance[level](enriched, message);

  // 2. Add Sentry breadcrumb
  try {
    Sentry.addBreadcrumb({
      category: (context?.event as string) || "app.log",
      message,
      level: level === "warn" ? "warning" : level === "error" || level === "fatal" ? "error" : "info",
      data: enriched,
    });
  } catch {
    // Sentry failure must never interrupt log emission
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
