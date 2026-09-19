import cors from "cors";

export const sanitizeOrigin = (url?: string): string =>
  url
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "") || "";

export const VERCEL_DOMAIN_REGEX = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/i;
export const LOCALHOST_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

export const matchesWildcardPattern = (origin: string, pattern: string): boolean => {
  if (pattern === origin) return true;
  if (!pattern.includes("*")) return false;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const regex = new RegExp(`^${escaped}$`, "i");
  return regex.test(origin);
};

export const getAllowedOrigins = (): string[] => {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://linkforge.vercel.app",
    "https://linkforge-web-iota.vercel.app",
  ]);

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

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true;

  const clean = sanitizeOrigin(origin);
  const allowedList = getAllowedOrigins();

  if (allowedList.includes(clean)) return true;
  if (allowedList.some((pat) => matchesWildcardPattern(clean, pat))) return true;
  if (VERCEL_DOMAIN_REGEX.test(clean)) return true;
  if (LOCALHOST_REGEX.test(clean)) return true;

  return false;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  exposedHeaders: ["X-Request-ID", "Set-Cookie", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
});
