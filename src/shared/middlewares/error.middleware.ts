import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../../config/logger.js";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "MulterError"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid document upload",
    });
    return;
  }

  logger.error({ error }, "Unhandled request error");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
