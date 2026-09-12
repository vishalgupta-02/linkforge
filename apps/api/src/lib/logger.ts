import * as Sentry from "@sentry/node";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  event?: string;
  requestId?: string;
  userId?: string;
  linkId?: string;
  plan?: string;
  durationMs?: number;
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
 * Emits a structured JSON log and sends a breadcrumb to Sentry
 */
function emitLog(
  level: LogLevel,
  message: string,
  context: LogContext = {},
  error?: unknown,
): void {
  const timestamp = new Date().toISOString();
  const sanitizedContext = (scrubSensitiveData(context) as LogContext) || {};

  const logPayload = {
    timestamp,
    level,
    message,
    ...sanitizedContext,
    ...(error instanceof Error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : error
      ? { error: String(error) }
      : {}),
  };

  // 1. Output to stdout/stderr in structured JSON
  const output = JSON.stringify(logPayload);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }

  // 2. Add Breadcrumb to Sentry for tracing context (does NOT create an alert/error issue)
  try {
    Sentry.addBreadcrumb({
      category: sanitizedContext.event || "app.log",
      message,
      level: level === "warn" ? "warning" : level === "error" ? "error" : "info",
      data: sanitizedContext,
    });
  } catch {
    // Sentry telemetry failure must never interrupt application execution
  }
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    emitLog("info", message, context),
  warn: (message: string, context?: LogContext, error?: unknown) =>
    emitLog("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) =>
    emitLog("error", message, context, error),
  debug: (message: string, context?: LogContext) =>
    emitLog("debug", message, context),
};
