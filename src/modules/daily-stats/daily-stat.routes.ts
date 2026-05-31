import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { listMyDailyStats, upsertMyDailyStat } from "./daily-stat.controller.js";
import { upsertDailyStatSchema } from "./daily-stat.schemas.js";

export const dailyStatRouter: ExpressRouter = Router();

dailyStatRouter.use(authenticate);
dailyStatRouter.use(authorize("dealer"));

dailyStatRouter.get("/", listMyDailyStats);
dailyStatRouter.post("/", validateBody(upsertDailyStatSchema), upsertMyDailyStat);
