import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.SENTRY_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    process.env.NODE_ENV ??
    "development",

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  tracePropagationTargets: [
    "localhost",
    /^\/api/,
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  ],

  sendDefaultPii: false,
});

