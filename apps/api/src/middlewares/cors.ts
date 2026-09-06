// middleware/cors.ts
import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://linkforge-web-iota.vercel.app",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow non-browser requests (like curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true, // important for cookies / auth
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
});
