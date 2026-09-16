// middleware/cors.ts
import cors from "cors";

/**
 * Clean and normalize origin strings by trimming whitespace,
 * stripping surrounding quotes, and removing trailing slashes.
 */
export const sanitizeOrigin = (url?: string): string =>
  url
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "") || "";

/**
 * Flexible domain regex matchers for Vercel, Railway, and localhost environments
 */
export const VERCEL_DOMAIN_REGEX = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/i;
export const RAILWAY_DOMAIN_REGEX = /^https:\/\/[a-zA-Z0-9_-]+(\.up)?\.railway\.app$/i;
export const LOCALHOST_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/**
 * Checks if an origin matches a wildcard pattern (e.g. "https://*.vercel.app" or "*.railway.app")
 */
export const matchesWildcardPattern = (origin: string, pattern: string): boolean => {
  if (pattern === origin) return true;
  if (!pattern.includes("*")) return false;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const regex = new RegExp(`^${escaped}$`, "i");
  return regex.test(origin);
};

/**
 * Returns a consolidated, sanitized list of allowed origin strings and patterns.
 */
export const getAllowedOrigins = (): string[] => {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://linkforge.vercel.app",
    "https://linkforge-web-iota.vercel.app",
  ]);

  // Environment-provided URLs
  const envUrls = [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined,
  ];

  envUrls.forEach((url) => {
    const sanitized = sanitizeOrigin(url);
    if (sanitized) origins.add(sanitized);
  });

  // Comma-separated or whitespace-separated CORS_ORIGIN / BETTER_AUTH_TRUSTED_ORIGINS
  const corsEnvs = [
    process.env.CORS_ORIGIN,
    process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  ];

  corsEnvs.forEach((envVal) => {
    if (envVal) {
      envVal.split(/[\s,]+/).forEach((item) => {
        const sanitized = sanitizeOrigin(item);
        if (sanitized) origins.add(sanitized);
      });
    }
  });

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

  // 2. Wildcard pattern match with configured origins
  if (allowedList.some((pat) => matchesWildcardPattern(clean, pat))) return true;

  // 3. Match any Vercel domain (production & preview deployments)
  if (VERCEL_DOMAIN_REGEX.test(clean)) return true;

  // 4. Match any Railway deployment domain
  if (RAILWAY_DOMAIN_REGEX.test(clean)) return true;

  // 5. Allow localhost on any port
  if (LOCALHOST_REGEX.test(clean)) return true;

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
  // Reflect Access-Control-Request-Headers dynamically for robust preflight
  exposedHeaders: ["X-Request-ID", "Set-Cookie", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
});

