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
import { serverAdapter } from "./src/lib/bull-board.ts";

const app: Express = express();

startCleanupJob();

// Parse JSON and URL-encoded bodies BEFORE auth handler
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware);

app.disable("x-powered-by");

// 🔐 trust proxy (needed for correct IP + HSTS behind proxies)
app.set("trust proxy", 1);

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

// error handler
// app.use((err, req, res, next) => {
//   if (err.message === "Not allowed by CORS") {
//     return res.status(403).json({
//       success: false,
//       message: "CORS policy: origin not allowed",
//     });
//   }

//   next(err);
// });

// Mount Better Auth handler
app.use("/api/auth", toNodeHandler(auth));

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

// 🔥 Bull Board UI
app.use("/admin/queues", serverAdapter.getRouter());

app.use("/api", apiRoutes);

app.use("/{*path}", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

export default app;
