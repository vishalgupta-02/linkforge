import { baseConfig } from "./base.config.ts";
import { developmentConfig } from "./development.config.ts";
import { productionConfig } from "./production.config.ts";

const environmentConfigs = {
  development: developmentConfig,
  production: productionConfig,
  test: { LOG_LEVEL: "silent", SHOW_STACK_TRACES: false },
};

const env = process.env.NODE_ENV || "development";

export const config = {
  ...baseConfig,
  ...environmentConfigs[env as keyof typeof environmentConfigs],
};
