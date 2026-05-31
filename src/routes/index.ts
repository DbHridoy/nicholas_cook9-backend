import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { claimRouter } from "../modules/claims/claim.routes.js";
import { contractRouter } from "../modules/contracts/contract.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { userRouter } from "../modules/users/user.routes.js";

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
apiRouter.use("/auth", authRouter);
apiRouter.use("/claims", claimRouter);
apiRouter.use("/contracts", contractRouter);
apiRouter.use("/users", userRouter);
