import "dotenv/config";
import { config } from "./src/configs/config-v1.ts";
import app from "./main.ts";

import { logger } from "./src/lib/logger.ts";

const PORT = process.env.PORT || 5000;

app.listen(PORT || "0.0.0.0", () => {
  logger.info("Server started successfully", {
    event: "server.startup.success",
    port: Number(PORT),
    environment: config.NODE_ENV,
    url: `http://0.0.0.0:${PORT}`,
  });
});
