import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { tokenBlacklistRepository } from "./token-blacklist.repository.js";
import { userRepository } from "../users/user.repository.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  ResetPasswordInput,
  VerifyPasswordResetOtpInput,
} from "./auth.schemas.js";
import {
  createOpaqueToken,
  createOtp,
  hashValue,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./auth.utils.js";
import { sendPasswordResetOtp } from "./email.service.js";
import type { UserRole, UserStatus } from "../users/user.types.js";

type TokenUser = {
  _id: { toString(): string };
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const createSession = async (user: TokenUser) => {
  const accessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({ id: user._id.toString() });

  await refreshTokenRepository.create({
    userId: user._id.toString(),
    tokenHash: hashValue(refreshToken.token),
    expiresAt: refreshToken.expiresAt,
  });

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    expiresAt: accessToken.expiresAt,
    refreshTokenExpiresAt: refreshToken.expiresAt,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

export const login = async ({ email, password }: LoginInput) => {
  const user = await userRepository.findByEmailWithPassword(email);

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new AppError(403, "This account is blocked");
  }

  return createSession(user);
};

export const refreshToken = async ({ refreshToken }: RefreshTokenInput) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashValue(refreshToken);
  const storedToken = await refreshTokenRepository.findActiveByHash(tokenHash);

  if (!storedToken || storedToken.user.toString() !== payload.sub) {
    throw new AppError(401, "Refresh token is invalid");
  }

  const user = await userRepository.findById(payload.sub);

  if (!user || user.status !== "active") {
    throw new AppError(401, "Refresh token is invalid");
  }

  await refreshTokenRepository.revokeByHash(tokenHash);

  return createSession(user);
};

export const logout = async (payload: {
  userId: string;
  jti: string;
  expiresAt: Date;
  refreshToken?: string;
}) => {
  await tokenBlacklistRepository.revoke(payload);

  if (payload.refreshToken) {
    await refreshTokenRepository.revokeByHash(hashValue(payload.refreshToken));
  }
};

export const requestPasswordReset = async ({ email }: ForgotPasswordInput) => {
  const user = await userRepository.findByEmailWithPasswordResetOtp(email);

  if (!user) {
    return;
  }

  const otp = createOtp();
  user.passwordResetOtpHash = hashValue(otp);
  user.passwordResetOtpExpiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES * 60 * 1000,
  );
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  await sendPasswordResetOtp(user.email, otp);
};

export const verifyPasswordResetOtp = async ({ email, otp }: VerifyPasswordResetOtpInput) => {
  const user = await userRepository.findByEmailWithPasswordResetSecrets(email);

  if (
    !user ||
    !user.passwordResetOtpHash ||
    !user.passwordResetOtpExpiresAt ||
    user.passwordResetOtpExpiresAt.getTime() < Date.now() ||
    user.passwordResetOtpHash !== hashValue(otp)
  ) {
    throw new AppError(400, "Invalid or expired OTP");
  }

  const resetToken = createOpaqueToken();
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  user.passwordResetTokenHash = hashValue(resetToken);
  user.passwordResetTokenExpiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES * 60 * 1000,
  );
  await user.save();

  return resetToken;
};

export const resetPassword = async ({ email, resetToken, password }: ResetPasswordInput) => {
  const user = await userRepository.findByEmailWithPasswordResetToken(email);

  if (
    !user ||
    !user.passwordResetTokenHash ||
    !user.passwordResetTokenExpiresAt ||
    user.passwordResetTokenExpiresAt.getTime() < Date.now() ||
    user.passwordResetTokenHash !== hashValue(resetToken)
  ) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();
};
