import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  ResetPasswordInput,
  VerifyPasswordResetOtpInput,
} from "./auth.schemas.js";
import * as authService from "./auth.service.js";

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body as LoginInput);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data,
  });
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user || !req.token) {
    throw new AppError(401, "Authentication token is required");
  }

  const body = (req.body ?? {}) as LogoutInput;

  await authService.logout({
    userId: req.user.id,
    jti: req.token.jti,
    expiresAt: req.token.expiresAt,
    refreshToken: body.refreshToken,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refreshToken: RequestHandler = asyncHandler(async (req, res) => {
  const data = await authService.refreshToken(req.body as RefreshTokenInput);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data,
  });
});

export const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body as ForgotPasswordInput);

  res.status(200).json({
    success: true,
    message: "If an account exists for this email, a password reset OTP has been sent",
  });
});

export const verifyPasswordResetOtp: RequestHandler = asyncHandler(async (req, res) => {
  const resetToken = await authService.verifyPasswordResetOtp(
    req.body as VerifyPasswordResetOtpInput,
  );

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    data: { resetToken },
  });
});

export const resetPassword: RequestHandler = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body as ResetPasswordInput);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
