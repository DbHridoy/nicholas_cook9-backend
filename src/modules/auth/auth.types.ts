import type { UserRole } from "../users/user.types.js";

export type { UserRole };

export type JwtPayload = {
  sub: string;
  email?: string;
  role?: UserRole;
  tokenUse: "access" | "refresh";
  jti: string;
  iat: number;
  exp: number;
};
