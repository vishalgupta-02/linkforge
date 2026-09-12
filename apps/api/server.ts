import "./instrument.ts";
import { config } from "./src/configs/config-v1.ts";
import app from "./main.ts";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} with http://localhost:${PORT}`,
  );
});
