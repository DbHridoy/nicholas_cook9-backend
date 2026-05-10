import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, "Shutting down server");

  server.close((error) => {
    if (error) {
      logger.error({ error }, "Error while closing server");
      process.exit(1);
    }

    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
