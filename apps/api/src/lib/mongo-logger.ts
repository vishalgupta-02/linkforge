import { LogModel, type LogCategoryType, type LogLevelType } from "../models/log.model.ts";
import { isMongooseConnected } from "./mongoose.ts";

export interface MongoLogPayload {
  timestamp?: Date;
  level: LogLevelType;
  category: LogCategoryType;
  message: string;
  service?: string;
  environment?: string;
  requestId?: string | null;
  userId?: string | null;
  traceId?: string | null;
  spanId?: string | null;
  parentSpanId?: string | null;
  durationMs?: number | null;
  statusCode?: number | null;
  method?: string | null;
  route?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string | number | null;
  } | null;
}

const MAX_BUFFER_SIZE = 1500;
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 800;

let buffer: MongoLogPayload[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let isFlushing = false;

async function flushBuffer(): Promise<void> {
  if (isFlushing || buffer.length === 0) return;
  if (!isMongooseConnected()) return;

  isFlushing = true;
  const itemsToInsert = buffer.splice(0, BATCH_SIZE);

  try {
    await LogModel.insertMany(itemsToInsert, { ordered: false });
  } catch (error) {
    // If inserting fails, discard to avoid memory leaks or re-buffer a subset if connection dropped
    if (buffer.length < MAX_BUFFER_SIZE / 2) {
      buffer.unshift(...itemsToInsert.slice(-10));
    }
  } finally {
    isFlushing = false;
    if (buffer.length >= BATCH_SIZE) {
      setImmediate(flushBuffer);
    }
  }
}

function startPeriodicFlush(): void {
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      flushBuffer().catch(() => {});
    }, FLUSH_INTERVAL_MS);
    if (flushTimer.unref) {
      flushTimer.unref();
    }
  }
}

export function isMongoLoggingEnabled(): boolean {
  if (process.env.FORCE_MONGO_LOGS === "true") return true;
  return process.env.NODE_ENV === "production";
}

export function recordMongoLog(log: MongoLogPayload): void {
  // Store logs in MongoDB for production only, not for development
  if (!isMongoLoggingEnabled()) {
    return;
  }

  startPeriodicFlush();

  if (buffer.length >= MAX_BUFFER_SIZE) {
    // Drop oldest items to preserve memory under high load
    buffer.splice(0, 100);
  }

  const normalized: MongoLogPayload = {
    ...log,
    timestamp: log.timestamp || new Date(),
    service:
      log.service ||
      (process.argv.some((arg) => arg.includes("worker")) ? "linkforge-worker" : "linkforge-api"),
    environment: log.environment || process.env.NODE_ENV || "development",
  };

  buffer.push(normalized);

  if (buffer.length >= BATCH_SIZE) {
    flushBuffer().catch(() => {});
  }
}

export async function flushMongoLogsImmediate(): Promise<void> {
  while (buffer.length > 0 && isMongooseConnected()) {
    await flushBuffer();
  }
}
