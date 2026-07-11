import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createMyCancellation,
  listMyCancellations,
  processMyCancellation,
} from "./cancellation.controller.js";
import { createCancellationSchema } from "./cancellation.schemas.js";

export const cancellationRouter: ExpressRouter = Router();

cancellationRouter.use(authenticate);
cancellationRouter.use(authorize("dealer"));

cancellationRouter.get("/", listMyCancellations);
cancellationRouter.post("/", validateBody(createCancellationSchema), createMyCancellation);
cancellationRouter.patch("/:cancellationId/process", processMyCancellation);
