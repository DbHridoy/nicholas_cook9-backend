import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../../config/logger.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ error }, "Unhandled request error");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
