import compression from "compression";
import cors from "cors";
import express from "express";
import type { Express, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./shared/middlewares/error.middleware.js";

const sensitiveBodyKeys = new Set([
  "accessToken",
  "newPassword",
  "otp",
  "password",
  "refreshToken",
  "resetToken",
]);

const redactRequestBody = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactRequestBody);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Buffer.isBuffer(value)) {
    return "[Buffer]";
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (
    "toHexString" in value &&
    typeof value.toHexString === "function" &&
    value.constructor.name === "ObjectId"
  ) {
    return value.toHexString();
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveBodyKeys.has(key) ? "[Redacted]" : redactRequestBody(nestedValue),
    ]),
  );
};

const getCorsOrigin = (): boolean | string | string[] => {
  if (env.CORS_ORIGIN === "*") {
    return true;
  }

  const origins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0]! : origins;
};

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: getCorsOrigin(),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(((req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      res.locals.responseBody = body;
      return originalJson(body);
    }) as typeof res.json;

    next();
  }) satisfies RequestHandler);
  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
      customProps(req, res) {
        const props: Record<string, unknown> = {};

        if ("body" in req && req.body !== undefined) {
          props.requestBody = redactRequestBody(req.body);
        }

        if (res.locals.responseBody !== undefined) {
          props.responseBody = redactRequestBody(res.locals.responseBody);
        }

        return props;
      },
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
