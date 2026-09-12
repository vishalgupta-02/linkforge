// middleware/cors.ts
import cors from "cors";

const getAllowedOrigins = (): string[] => {
  const origins = ["http://localhost:3000"];
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
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
    // allow non-browser requests (like curl, Postman)
    if (!origin) return callback(null, true);

    const allowed = getAllowedOrigins();
    if (
      allowed.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
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
