import "dotenv/config";
import express from "express";
import type { Express } from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./src/lib/auth.ts";
import { errorMiddleware } from "./src/middlewares/error-handler.middleware.ts";
import apiRoutes from "./src/routes/index.ts";
import { AppError } from "./src/utils/api-error.ts";
import { startCleanupJob } from "./src/cron/cleanup.cron.ts";
import { rateLimitMiddleware } from "./src/middlewares/rateLimit.middleware.ts";
import helmet from "helmet";
import { corsMiddleware } from "./src/middlewares/cors.ts";
import { requestIdMiddleware } from "./src/middlewares/request-id.middleware.ts";
import { metricsMiddleware } from "./src/middlewares/metrics.middleware.ts";
import {
  getMetrics,
  getMetricsContentType,
  startBusinessMetricsRefresher,
} from "./src/lib/metrics.ts";
import { serverAdapter } from "./src/lib/bull-board.ts";
import { adminAuthMiddleware } from "./src/middlewares/admin-auth.middleware.ts";
import publicRedirectRoutes from "./src/routes/public-redirect.routes.ts";
import * as Sentry from "@sentry/node";

const app: Express = express();

// 🔐 1. trust proxy (MUST be configured before any IP-dependent middleware)
app.set("trust proxy", 1);
app.disable("x-powered-by");

startCleanupJob();

// 🆔 Attach and propagate unique Request IDs
app.use(requestIdMiddleware);

// 📊 Prometheus HTTP Metrics Middleware
app.use(metricsMiddleware);

// 🌐 CORS Middleware (MUST run before body parsers and route handlers)
app.use(corsMiddleware);

// ⚡ Stripe Webhook requires raw Buffer body for signature verification
app.use("/api/v1/billing/webhook", express.raw({ type: "application/json" }));

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

// 🚦 Global rate limiting
app.use(rateLimitMiddleware);

// 🔐 Helmet (with custom CSP)
app.use(
  helmet({
    // Enable all sensible defaults
    crossOriginEmbedderPolicy: false, // often disabled for APIs
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],

        // API usually doesn’t serve scripts/styles, keep strict
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],

        // allow images if you ever return URLs
        imgSrc: ["'self'", "data:", "https:"],

        // allow API calls
        connectSrc: ["'self'", "https:"],

        // disallow embedding
        frameAncestors: ["'none'"],

        objectSrc: ["'none'"],

        // upgrade http → https
        upgradeInsecureRequests: [],
      },
    },

    // 🔒 HSTS (force HTTPS)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // Optional but recommended
    referrerPolicy: { policy: "no-referrer" },
  }),
);

// Optional: additional headers (nice to have)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Company", "Linkforge");
  next();
});

// Mount Better Auth handler
app.use("/api/auth", toNodeHandler(auth));

// 🔐 Direct OAuth Callback Route (e.g. http://localhost:5000/callback/google -> /api/auth/callback/google)
app.get("/callback/:provider", (req, res) => {
  const provider = req.params.provider;
  const query = req.url.includes("?")
    ? req.url.slice(req.url.indexOf("?"))
    : "";
  res.redirect(`/api/auth/callback/${provider}${query}`);
});

app.get("/", (request, response) => {
  response.json({ message: "API running 🚀" });
});

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.get("/health", (request, response) => {
  response.json({
    success: true,
    message: "Backend server is healthy and running fine",
  });
});

// 📈 Prometheus Metrics Scrape Endpoint
app.get("/metrics", async (req, res) => {
  const metricsToken = process.env.METRICS_TOKEN;
  if (metricsToken) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader;
    if (token !== metricsToken) {
      return res.status(403).send("Forbidden: Invalid metrics token");
    }
  }
  try {
    res.setHeader("Content-Type", getMetricsContentType());
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send("Error collecting metrics");
  }
});

// 🔥 Bull Board UI (Protected by Admin Auth)
app.use("/admin/queues", adminAuthMiddleware, serverAdapter.getRouter());

// 🔗 Public Redirect Route (/r/:publicId)
app.use("/r", publicRedirectRoutes);

app.use("/api", apiRoutes);

app.use("/{*path}", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

Sentry.setupExpressErrorHandler(app);

app.use(errorMiddleware);

export default app;
