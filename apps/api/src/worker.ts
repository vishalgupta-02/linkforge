import "dotenv/config";
import { clickWorker } from "./workers/click.worker.ts";
import { emailWorker } from "./workers/email.worker.ts";
import { logger } from "./lib/logger.ts";

const environment = process.env.NODE_ENV || "development";

logger.info("BullMQ Worker Process Started", {
  event: "worker_process_started",
  environment,
  workers: [
    {
      worker: "click-tracking",
      queue: "click-tracking",
      concurrency: clickWorker.opts.concurrency || 20,
    },
    {
      worker: "email",
      queue: "email",
      concurrency: emailWorker.opts.concurrency || 10,
    },
  ],
  startupTimestamp: new Date().toISOString(),
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Closing BullMQ workers gracefully...`, {
    event: "worker_process_shutdown_started",
    signal,
  });

  try {
    await Promise.allSettled([clickWorker.close(), emailWorker.close()]);

    logger.info("All BullMQ workers closed gracefully", {
      event: "worker_process_shutdown_completed",
      signal,
    });
    process.exit(0);
  } catch (error) {
    logger.error(
      "Error during BullMQ worker shutdown",
      {
        event: "worker_process_shutdown_error",
        signal,
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
