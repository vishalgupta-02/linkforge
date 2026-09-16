// middleware/cors.ts
import cors from "cors";

/**
 * Clean and normalize origin strings by trimming whitespace,
 * stripping surrounding quotes, and removing trailing slashes.
 */
export const sanitizeOrigin = (url?: string): string =>
  url?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "";

/**
 * Regex matching any LinkForge Vercel domain (production & preview deployments)
 * Examples:
 * - https://linkforge.vercel.app
 * - https://linkforge-web-iota.vercel.app
 * - https://linkforge-git-feature-xxx.vercel.app
 */
export const VERCEL_LINKFORGE_REGEX = /^https:\/\/linkforge[a-zA-Z0-9_-]*\.vercel\.app$/;

/**
 * Returns a consolidated, sanitized list of allowed origin strings.
 */
export const getAllowedOrigins = (): string[] => {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://linkforge.vercel.app",
    "https://linkforge-web-iota.vercel.app",
  ]);

  // Environment-provided frontend URLs
  const envUrls = [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];

  envUrls.forEach((url) => {
    const sanitized = sanitizeOrigin(url);
    if (sanitized) origins.add(sanitized);
  });

  // Comma-separated CORS_ORIGIN list if defined
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((item) => {
      const sanitized = sanitizeOrigin(item);
      if (sanitized) origins.add(sanitized);
    });
  }

  return Array.from(origins);
};

/**
 * Evaluates whether an incoming origin header is authorized.
 */
export const isOriginAllowed = (origin?: string): boolean => {
  // Allow requests without Origin (e.g. server-to-server, curl, Postman, native apps)
  if (!origin) return true;

  const clean = sanitizeOrigin(origin);
  const allowedList = getAllowedOrigins();

  // 1. Direct match with configured origins
  if (allowedList.includes(clean)) return true;

  // 2. Match any LinkForge Vercel preview or production deployment
  if (VERCEL_LINKFORGE_REGEX.test(clean)) return true;

  // 3. In non-production, allow any localhost port (e.g. Vite, Next, Storybook)
  if (
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)
  ) {
    return true;
  }

  return false;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Reject gracefully without throwing an unhandled Express 500 exception
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "sentry-trace",
    "baggage",
    "x-request-id",
    "X-Request-ID",
    "x-better-auth-session-token",
    "x-requested-with",
    "Cookie",
    "Accept",
  ],
  exposedHeaders: ["X-Request-ID", "Set-Cookie"],
  optionsSuccessStatus: 204,
});
