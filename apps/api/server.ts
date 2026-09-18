import { EventEmitter } from "node:events";
import { config } from "./src/configs/config-v1.ts";
import app from "./main.ts";

import { logger } from "./src/lib/logger.ts";

// Set default max listeners threshold to accommodate observability stack (Sentry, OpenTelemetry, Prometheus, Pino, Better-Auth)
EventEmitter.defaultMaxListeners = 30;

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   logger.info("Server started successfully", {
//     event: "server.startup.success",
//     port: Number(PORT),
//     environment: config.NODE_ENV,
//     url: `http://localhost:${PORT}`,
//   });

//   // Automatically start background queue workers (BullMQ for clicks & emails)
//   // Can be disabled by setting RUN_WORKER=false if running dedicated worker containers
//   if (process.env.RUN_WORKER !== "false") {
//     import("./src/worker.ts")
//       .then(() => {
//         logger.info("Embedded BullMQ queue workers started successfully", { event: "worker.embedded.started" });
//       })
//       .catch((err) => {
//         logger.error("Failed to start embedded workers", { error: err });
//       });
//   }
// });

app.listen(PORT || "0.0.0.0", () => {
  logger.info("Server started successfully", {
    event: "server.startup.success",
    port: Number(PORT),
    environment: config.NODE_ENV,
    url: `http://0.0.0.0:${PORT}`,
  });

  if (process.env.RUN_WORKER !== "false") {
    import("./src/worker.ts")
      .then(() => {
        logger.info("Embedded BullMQ queue workers started successfully", {
          event: "worker.embedded.started",
        });
      })
      .catch((err) => {
        logger.error("Failed to start embedded workers", { error: err });
      });
  }
});
