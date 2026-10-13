import mongoose, { Schema, Document, Model } from "mongoose";

export type LogLevelType =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export type LogCategoryType =
  | "http"
  | "otel_span"
  | "otel_event"
  | "system"
  | "worker"
  | "auth"
  | "database"
  | "security"
  | "billing"
  | "email"
  | "general";

export interface ILogDocument extends Document {
  timestamp: Date;
  level: LogLevelType;
  category: LogCategoryType;
  service: string;
  environment: string;
  message: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<ILogDocument>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    level: {
      type: String,
      enum: ["trace", "debug", "info", "warn", "error", "fatal"],
      default: "info",
      index: true,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "http",
        "otel_span",
        "otel_event",
        "system",
        "worker",
        "auth",
        "database",
        "security",
        "billing",
        "email",
        "general",
      ],
      default: "general",
      index: true,
      required: true,
    },
    service: {
      type: String,
      default: () => (process.argv.some((arg) => arg.includes("worker")) ? "linkforge-worker" : "linkforge-api"),
      index: true,
    },
    environment: {
      type: String,
      default: () => process.env.NODE_ENV || "development",
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    requestId: {
      type: String,
      index: true,
      default: null,
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    traceId: {
      type: String,
      index: true,
      default: null,
    },
    spanId: {
      type: String,
      default: null,
    },
    parentSpanId: {
      type: String,
      default: null,
    },
    durationMs: {
      type: Number,
      default: null,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    method: {
      type: String,
      default: null,
    },
    route: {
      type: String,
      default: null,
    },
    clientIp: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: {
        name: { type: String, default: null },
        message: { type: String, default: null },
        stack: { type: String, default: null },
        code: { type: Schema.Types.Mixed, default: null },
      },
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "logs",
  },
);

// Compound indexes for optimal real-time inspection & debugging
LogSchema.index({ timestamp: -1 });
LogSchema.index({ category: 1, timestamp: -1 });
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ traceId: 1, timestamp: -1 });
LogSchema.index({ requestId: 1, timestamp: -1 });
LogSchema.index({ service: 1, timestamp: -1 });
LogSchema.index({ message: "text" });

// Auto-expire logs older than 30 days to keep cluster storage healthy
LogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

export const LogModel: Model<ILogDocument> =
  (mongoose.models.Log as Model<ILogDocument>) ||
  mongoose.model<ILogDocument>("Log", LogSchema);
