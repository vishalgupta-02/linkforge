// apps/api/src/configs

import { getEnvVariable } from "../utils/helper.ts";

export const FREE_LINK_LIMIT = 8;

export const baseConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
  BETTER_AUTH_SECRET: getEnvVariable("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnvVariable("BETTER_AUTH_URL"),
  REDIS_URL: getEnvVariable("REDIS_URL"),
  // CORS_ORIGIN: getEnvVariable("CORS_ORIGIN"),
  GOOGLE_OAUTH_CLIENT_ID:
    process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_OAUTH_CLIENT_SECRET:
    process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    "http://localhost:5000/callback/google",
  GITHUB_OAUTH_CLIENT_ID:
    process.env.GITHUB_OAUTH_CLIENT_ID || process.env.GITHUB_CLIENT_ID || "",
  GITHUB_OAUTH_CLIENT_SECRET:
    process.env.GITHUB_OAUTH_CLIENT_SECRET ||
    process.env.GITHUB_CLIENT_SECRET ||
    "",
  GITHUB_CALLBACK_URL:
    process.env.GITHUB_CALLBACK_URL ||
    process.env.GITHUB_OAUTH_REDIRECT_URI ||
    "http://localhost:5000/callback/github",
};
