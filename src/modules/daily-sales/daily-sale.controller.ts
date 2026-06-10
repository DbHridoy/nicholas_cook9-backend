import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import {
  createDailySaleSchema,
  listDailySalesQuerySchema,
  type CreateDailySaleInput,
} from "./daily-sale.schemas.js";
import * as dailySaleService from "./daily-sale.service.js";

export const listMyDailySales: RequestHandler = asyncHandler(async (req, res) => {
  const parsedQuery = listDailySalesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    const message = parsedQuery.error.issues.map((issue) => issue.message).join("; ");
    throw new AppError(400, message);
  }

  const dailySalesDashboard = await dailySaleService.listMyDailySales(req.user!.id, parsedQuery.data);

  res.status(200).json({
    success: true,
    message: "Daily sales retrieved successfully",
    data: dailySalesDashboard,
  });
});

export const createMyDailySale: RequestHandler = asyncHandler(async (req, res) => {
  const dailySale = await dailySaleService.createMyDailySale(
    req.user!.id,
    req.body as CreateDailySaleInput,
  );

  res.status(201).json({
    success: true,
    message: "Daily sale created successfully",
    data: { dailySale },
  });
});

export const deleteMyDailySale: RequestHandler = asyncHandler(async (req, res) => {
  await dailySaleService.deleteMyDailySale(req.user!.id, String(req.params.saleId));

  res.status(200).json({
    success: true,
    message: "Daily sale deleted successfully",
  });
});
