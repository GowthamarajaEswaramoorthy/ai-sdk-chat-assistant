import * as dotenv from "dotenv";
dotenv.config();

import { logger } from "./utils/logger.utils";
import app from "./app";

const PORT = Number(process.env.PORT) || 8080;

const server = app.listen(PORT, () => {
  logger.info(`⚡️ Service application listening on port ${PORT}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error(`Error during server shutdown: ${err}`);
      process.exit(1);
    }

    logger.info("Server closed. All connections terminated gracefully.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
