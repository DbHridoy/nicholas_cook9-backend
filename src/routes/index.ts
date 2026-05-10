import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { healthRouter } from "../modules/health/health.routes.js";

export const apiRouter: ExpressRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Nicholas Cook9 API v1",
    data: {
      health: "/api/v1/health",
    },
  });
});

apiRouter.use("/health", healthRouter);
