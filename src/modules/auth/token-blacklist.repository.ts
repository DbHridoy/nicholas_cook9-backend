import { TokenBlacklist } from "./token-blacklist.model.js";

type RevokeTokenPayload = {
  userId: string;
  jti: string;
  expiresAt: Date;
};

export const tokenBlacklistRepository = {
  existsByJti(jti: string) {
    return TokenBlacklist.exists({ jti });
  },

  revoke({ userId, jti, expiresAt }: RevokeTokenPayload) {
    return TokenBlacklist.updateOne(
      { jti },
      {
        $setOnInsert: {
          jti,
          expiresAt,
          user: userId,
        },
      },
      { upsert: true },
    );
  },
};
