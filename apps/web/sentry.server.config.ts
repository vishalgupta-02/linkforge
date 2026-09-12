import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.SENTRY_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    process.env.NODE_ENV ??
    "development",

  release:
    process.env.SENTRY_RELEASE ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
    (process.env.VERCEL_GIT_COMMIT_SHA
      ? `linkforge-web@${process.env.VERCEL_GIT_COMMIT_SHA}`
      : undefined),

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  tracePropagationTargets: [
    "localhost",
    /^\/api/,
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  ],

  sendDefaultPii: false,

  beforeSend(event) {
    if (event.request) {
      if (event.request.headers) {
        const sensitiveHeaders = [
          "authorization",
          "cookie",
          "set-cookie",
          "proxy-authorization",
          "x-api-key",
          "stripe-signature",
        ];
        for (const header of sensitiveHeaders) {
          delete event.request.headers[header];
        }
      }
      if (event.request.cookies) {
        delete event.request.cookies;
      }
    }
    return event;
  },
});

