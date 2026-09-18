import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  AlwaysOnSampler,
  AlwaysOffSampler,
  TraceIdRatioBasedSampler,
  ParentBasedSampler,
} from "@opentelemetry/sdk-trace-base";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const serviceName = process.env.OTEL_SERVICE_NAME || "linkforge-api";
const environment = process.env.NODE_ENV || "development";
const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  (environment === "production"
    ? "http://tempo:4318/v1/traces"
    : "http://localhost:4318/v1/traces");

function getSampler() {
  const samplerType = (process.env.OTEL_TRACES_SAMPLER || "").toLowerCase();
  const ratioArg = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || "");

  if (samplerType === "always_off") {
    return new AlwaysOffSampler();
  }

  if (samplerType === "always_on") {
    return new AlwaysOnSampler();
  }

  const ratio = !isNaN(ratioArg)
    ? ratioArg
    : environment === "production"
      ? 0.1
      : 1.0;
  return new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(ratio),
  });
}

const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "1.0.0",
    "deployment.environment": environment,
  }),
  traceExporter,
  sampler: getSampler(),
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        const url = req.url || "";

        return (
          url.startsWith("/metrics") ||
          url.startsWith("/health") ||
          url === "/favicon.ico"
        );
      },
    }),
    new ExpressInstrumentation(),
    new IORedisInstrumentation(),
    new PgInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

let isInitialized = false;

export function initTracing(): void {
  if (isInitialized) return;

  try {
    sdk.start();
    isInitialized = true;
    console.log(
      `📡 [OpenTelemetry] Tracing initialized (Service: ${serviceName}, Endpoint: ${otlpEndpoint})`,
    );
  } catch (error) {
    console.error(
      "⚠️ [OpenTelemetry] Failed to initialize tracing SDK:",
      error,
    );
  }
}

export async function shutdownTracing(): Promise<void> {
  if (!isInitialized) return;

  try {
    await sdk.shutdown();
    isInitialized = false;
    console.log("🛑 [OpenTelemetry] Tracing SDK shut down gracefully");
  } catch (error) {
    console.error("❌ [OpenTelemetry] Error shutting down tracing SDK:", error);
  }
}

process.on("SIGTERM", async () => {
  await shutdownTracing();
});

process.on("SIGINT", async () => {
  await shutdownTracing();
});
