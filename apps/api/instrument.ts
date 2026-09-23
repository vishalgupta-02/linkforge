import "dotenv/config";
import { initTracing } from "./src/lib/tracing.ts";

// 1. Initialize OpenTelemetry NodeSDK before importing instrumented dependencies
initTracing();

// 2. Initialize Sentry error reporting & profiling
import "./src/lib/sentry.ts";
