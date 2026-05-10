import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifyPasswordResetOtpSchema,
} from "./auth.schemas.js";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  verifyPasswordResetOtp,
} from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

export const authRouter: ExpressRouter = Router();

authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", authenticate, logout);
authRouter.post("/password/forgot", validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post(
  "/password/verify-otp",
  validateBody(verifyPasswordResetOtpSchema),
  verifyPasswordResetOtp,
);
authRouter.post("/password/reset", validateBody(resetPasswordSchema), resetPassword);
