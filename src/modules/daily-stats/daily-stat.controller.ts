import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type { UpsertDailyStatInput } from "./daily-stat.schemas.js";
import * as dailyStatService from "./daily-stat.service.js";

export const listMyDailyStats: RequestHandler = asyncHandler(async (req, res) => {
  const dailyStats = await dailyStatService.listMyDailyStats(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Daily stats retrieved successfully",
    data: { dailyStats },
  });
});

export const upsertMyDailyStat: RequestHandler = asyncHandler(async (req, res) => {
  const dailyStat = await dailyStatService.upsertMyDailyStat(
    req.user!.id,
    req.body as UpsertDailyStatInput,
  );

  res.status(200).json({
    success: true,
    message: "Daily stat saved successfully",
    data: { dailyStat },
  });
});
