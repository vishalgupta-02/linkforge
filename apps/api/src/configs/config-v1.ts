// apps/api/src/config.ts

type EnvConfig = {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  DATABASE_URL: string;
};

function getEnvVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}
      Add it to your .env file before starting the server.`,
    );
  }

  return value;
}

export const config: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
};
