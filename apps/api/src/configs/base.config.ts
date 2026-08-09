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
  GOOGLE_OAUTH_CLIENT_ID: getEnvVariable("GOOGLE_OAUTH_CLIENT_ID"),
  GOOGLE_OAUTH_CLIENT_SECRET: getEnvVariable("GOOGLE_OAUTH_CLIENT_SECRET"),
  GITHUB_OAUTH_CLIENT_ID: getEnvVariable("GITHUB_OAUTH_CLIENT_ID"),
  GITHUB_OAUTH_CLIENT_SECRET: getEnvVariable("GITHUB_OAUTH_CLIENT_SECRET"),
};
