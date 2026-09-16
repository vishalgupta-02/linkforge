// middleware/cors.ts
import cors from "cors";

const getAllowedOrigins = (): string[] => {
  const origins = ["http://localhost:3000"];
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }
  if (process.env.APP_URL) {
    const appUrl = process.env.APP_URL.replace(/\/$/, "");
    if (!origins.includes(appUrl)) origins.push(appUrl);
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    if (!origins.includes(publicUrl)) origins.push(publicUrl);
  }
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((o) => {
      const trimmed = o.trim().replace(/\/$/, "");
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }
  return origins;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow non-browser requests (like curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = getAllowedOrigins();

    // Strict regex matching official LinkForge production or preview deployment URLs on Vercel
    const isOfficialVercelDeployment =
      /^https:\/\/linkforge(?:-[a-zA-Z0-9]+)*\.vercel\.app$/.test(origin) &&
      (process.env.NODE_ENV !== "production" || origin.startsWith("https://linkforge-web-iota.vercel.app"));

    if (allowed.includes(origin) || isOfficialVercelDeployment) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },

  credentials: true, // important for cookies / auth
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "sentry-trace",
    "baggage",
    "x-request-id",
    "X-Request-ID",
  ],
  exposedHeaders: ["X-Request-ID"],
  optionsSuccessStatus: 204,
});
