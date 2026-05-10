import compression from "compression";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./shared/middlewares/error.middleware.js";

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Nicholas Cook9 API",
      data: {
        version: "1.0.0",
        baseUrl: "/api/v1",
      },
    });
  });

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
