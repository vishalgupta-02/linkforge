import { EventEmitter } from "node:events";
import "./instrument.ts";
import { config } from "./src/configs/config-v1.ts";
import app from "./main.ts";

import { logger } from "./src/lib/logger.ts";

// Set default max listeners threshold to accommodate observability stack (Sentry, OpenTelemetry, Prometheus, Pino, Better-Auth)
EventEmitter.defaultMaxListeners = 30;


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info("Server started successfully", {
    event: "server.startup.success",
    port: Number(PORT),
    environment: config.NODE_ENV,
    url: `http://localhost:${PORT}`,
  });
});
