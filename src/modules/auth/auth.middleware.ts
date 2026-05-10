import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { tokenBlacklistRepository } from "./token-blacklist.repository.js";
import { verifyAccessToken } from "./auth.utils.js";
import { userRepository } from "../users/user.repository.js";
import type { UserRole } from "../users/user.types.js";

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    throw new AppError(401, "Authentication token is required");
  }

  const payload = verifyAccessToken(token);
  const isBlacklisted = await tokenBlacklistRepository.existsByJti(payload.jti);

  if (isBlacklisted) {
    throw new AppError(401, "Authentication token has been revoked");
  }

  const user = await userRepository.findById(payload.sub);

  if (!user || user.status !== "active") {
    throw new AppError(401, "Authentication token is invalid");
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  req.token = {
    jti: payload.jti,
    expiresAt: new Date(payload.exp * 1000),
  };

  next();
});

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
