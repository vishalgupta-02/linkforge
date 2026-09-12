import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profileSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profileLifecycle: "trace",
    sendDefaultPii: false,
    beforeSend(event) {
      // 🛡️ Privacy filter: Strip sensitive headers, cookies, and tokens from request data
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
}

export { Sentry };
