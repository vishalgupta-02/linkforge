import "dotenv/config";
import "./workers/click.worker.ts";
import "./workers/email.worker.ts";

import { logger } from "./lib/logger.ts";

logger.info("Workers (Click & Email) started successfully", { event: "worker.startup.success" });
