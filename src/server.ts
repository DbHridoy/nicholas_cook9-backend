import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { seedSuperAdmin } from "./modules/auth/auth.bootstrap.js";

const app = createApp();
const server = createServer(app);

const startServer = async () => {
  await connectDatabase();
  await seedSuperAdmin();

  server.listen(env.PORT, () => {
    logger.info(`Server is running on http://localhost:${env.PORT}`);
  });
};

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, "Shutting down server");

  server.close(async (error) => {
    if (error) {
      logger.error({ error }, "Error while closing server");
      process.exit(1);
    }

    await disconnectDatabase();
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

void startServer().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
