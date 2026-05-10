import type { UserRole } from "../modules/users/user.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      token?: {
        jti: string;
        expiresAt: Date;
      };
    }
  }
}

export {};
