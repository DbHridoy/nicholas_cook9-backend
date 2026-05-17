import { RefreshToken } from "./refresh-token.model.js";

type CreateRefreshTokenPayload = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export const refreshTokenRepository = {
  create({ userId, tokenHash, expiresAt }: CreateRefreshTokenPayload) {
    return RefreshToken.create({
      tokenHash,
      user: userId,
      expiresAt,
    });
  },

  findActiveByHash(tokenHash: string) {
    return RefreshToken.findOne({
      tokenHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
  },

  revokeByHash(tokenHash: string) {
    return RefreshToken.updateOne(
      {
        tokenHash,
        revokedAt: { $exists: false },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  },
};
