import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard: RequestHandler = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user!);

  res.status(200).json({
    success: true,
    message: "Dashboard retrieved successfully",
    data: { dashboard },
  });
});

export const getAnalytics: RequestHandler = asyncHandler(async (req, res) => {
  const analytics = await dashboardService.getAnalytics(req.user!);

  res.status(200).json({
    success: true,
    message: "Analytics retrieved successfully",
    data: { analytics },
  });
});

export const getProductPerformance: RequestHandler = asyncHandler(async (req, res) => {
  const productPerformance = await dashboardService.getProductPerformance(req.user!);

  res.status(200).json({
    success: true,
    message: "Product performance retrieved successfully",
    data: { productPerformance },
  });
});
