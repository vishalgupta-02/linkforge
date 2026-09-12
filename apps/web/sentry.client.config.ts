import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development",

  release:
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
    (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
      ? `linkforge-web@${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`
      : undefined),

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Distributed Tracing: Propagate sentry-trace & baggage to backend
  tracePropagationTargets: [
    "localhost",
    /^\/api/,
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  ],

  // Session Replay: Conservative production sampling with strict privacy masking
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 0.1 : 0.05,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: false,
  enableLogs: true,

  beforeSend(event) {
    // 🛡️ Privacy filter: Strip sensitive headers, cookies, and tokens
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

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],
});

