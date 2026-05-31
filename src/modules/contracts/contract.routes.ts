import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { createContract, getContract, listContracts } from "./contract.controller.js";
import { createContractSchema } from "./contract.schemas.js";

export const contractRouter: ExpressRouter = Router();

contractRouter.use(authenticate);

contractRouter.get("/", authorize("dealer", "admin", "super_admin"), listContracts);
contractRouter.post("/", authorize("dealer"), validateBody(createContractSchema), createContract);
contractRouter.get("/:contractId", authorize("dealer", "admin", "super_admin"), getContract);
