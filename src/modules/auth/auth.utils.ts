import { createHash, randomInt, randomUUID } from "node:crypto";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JwtPayload, UserRole } from "./auth.types.js";
import { AppError } from "../../shared/errors/app-error.js";

export const hashValue = (value: string) => createHash("sha256").update(value).digest("hex");

export const createOtp = () => String(randomInt(100000, 1000000));

export const createOpaqueToken = () =>
  randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "");

export const signAccessToken = (payload: { id: string; email: string; role: UserRole }) => {
  const jti = randomUUID();

  const token = jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      tokenUse: "access",
      jti,
    },
    env.JWT_SECRET as Secret,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    },
  );

  const decoded = jwt.decode(token) as JwtPayload;

  return {
    token,
    jti,
    expiresAt: new Date(decoded.exp * 1000),
  };
};

export const signRefreshToken = (payload: { id: string }) => {
  const jti = randomUUID();

  const token = jwt.sign(
    {
      sub: payload.id,
      tokenUse: "refresh",
      jti,
    },
    env.JWT_SECRET as Secret,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    },
  );

  const decoded = jwt.decode(token) as JwtPayload;

  return {
    token,
    jti,
    expiresAt: new Date(decoded.exp * 1000),
  };
};

export const verifyAccessToken = (token: string) => {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
  } catch {
    throw new AppError(401, "Authentication token is invalid");
  }

  if (payload.tokenUse !== "access" || !payload.email || !payload.role) {
    throw new AppError(401, "Authentication token is invalid");
  }

  return payload;
};

export const verifyRefreshToken = (token: string) => {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
  } catch {
    throw new AppError(401, "Refresh token is invalid");
  }

  if (payload.tokenUse !== "refresh") {
    throw new AppError(401, "Refresh token is invalid");
  }

  return payload;
};
