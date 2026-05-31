import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { createClaim, getClaim, listClaims, updateClaimStatus } from "./claim.controller.js";
import { createClaimSchema, updateClaimStatusSchema } from "./claim.schemas.js";

export const claimRouter: ExpressRouter = Router();

claimRouter.post("/", validateBody(createClaimSchema), createClaim);

claimRouter.use(authenticate);

claimRouter.get("/", authorize("admin", "super_admin"), listClaims);
claimRouter.get("/:claimId", authorize("admin", "super_admin"), getClaim);
claimRouter.patch(
  "/:claimId/status",
  authorize("admin", "super_admin"),
  validateBody(updateClaimStatusSchema),
  updateClaimStatus,
);
