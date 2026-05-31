import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import {
  getAnalytics,
  getDashboard,
  getDealerDashboardMetrics,
  getProductPerformance,
} from "./dashboard.controller.js";

export const dashboardRouter: ExpressRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/", authorize("dealer", "admin", "super_admin"), getDashboard);
dashboardRouter.get("/dealer", authorize("dealer"), getDealerDashboardMetrics);
dashboardRouter.get("/analytics", authorize("admin", "super_admin"), getAnalytics);
dashboardRouter.get(
  "/products",
  authorize("dealer", "admin", "super_admin"),
  getProductPerformance,
);
