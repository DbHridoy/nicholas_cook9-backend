import { model, Schema, type Types } from "mongoose";

type RefreshToken = {
  tokenHash: string;
  user: Types.ObjectId;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const refreshTokenSchema = new Schema<RefreshToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const RefreshToken = model<RefreshToken>("RefreshToken", refreshTokenSchema);
