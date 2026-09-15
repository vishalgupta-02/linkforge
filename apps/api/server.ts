import "./instrument.ts";
import { config } from "./src/configs/config-v1.ts";
import app from "./main.ts";

import { logger } from "./src/lib/logger.ts";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info("Server started successfully", {
    event: "server.startup.success",
    port: Number(PORT),
    environment: config.NODE_ENV,
    url: `http://localhost:${PORT}`,
  });
});
