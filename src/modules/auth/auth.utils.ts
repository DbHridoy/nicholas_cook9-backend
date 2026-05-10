import { createHash, randomInt, randomUUID } from "node:crypto";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JwtPayload, UserRole } from "./auth.types.js";

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

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
