import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createMyDailySale,
  deleteMyDailySale,
  listMyDailySales,
} from "./daily-sale.controller.js";
import { createDailySaleSchema } from "./daily-sale.schemas.js";

export const dailySaleRouter: ExpressRouter = Router();

dailySaleRouter.use(authenticate);
dailySaleRouter.use(authorize("dealer"));

dailySaleRouter.get("/", listMyDailySales);
dailySaleRouter.post("/", validateBody(createDailySaleSchema), createMyDailySale);
dailySaleRouter.delete("/:saleId", deleteMyDailySale);
