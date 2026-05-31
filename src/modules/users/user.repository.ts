import type { QueryFilter, Types, UpdateQuery } from "mongoose";
import { User, type User as UserEntity, type UserDocument } from "./user.model.js";
import type { UserRole, UserStatus } from "./user.types.js";

const publicUserProjection = "name email role status avatar address mobile createdAt updatedAt createdBy";

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "super_admin">;
  createdBy: string;
};

type UpdateUserPayload = Partial<Pick<UserEntity, "name" | "status" | "role" | "avatar" | "address" | "mobile">>;

export const userRepository = {
  publicProjection: publicUserProjection,

  existsByEmail(email: string) {
    return User.exists({ email });
  },

  existsByRole(role: UserRole) {
    return User.exists({ role });
  },

  findById(id: string | Types.ObjectId) {
    return User.findById(id).select(publicUserProjection);
  },

  findByIdWithPassword(id: string | Types.ObjectId) {
    return User.findById(id).select("+password");
  },

  findByEmail(email: string) {
    return User.findOne({ email }).select(publicUserProjection);
  },

  findByEmailWithPassword(email: string) {
    return User.findOne({ email }).select("+password");
  },

  findByEmailWithPasswordResetOtp(email: string) {
    return User.findOne({ email }).select("+passwordResetOtpHash +passwordResetOtpExpiresAt");
  },

  findByEmailWithPasswordResetToken(email: string) {
    return User.findOne({ email }).select(
      "+password +passwordResetTokenHash +passwordResetTokenExpiresAt",
    );
  },

  findByEmailWithPasswordResetSecrets(email: string) {
    return User.findOne({ email }).select(
      "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetTokenHash +passwordResetTokenExpiresAt",
    );
  },

  create(payload: CreateUserPayload) {
    return User.create(payload);
  },

  createSuperAdmin(payload: Pick<UserEntity, "name" | "email" | "password">) {
    return User.create({
      ...payload,
      role: "super_admin",
      status: "active",
    });
  },

  findMany(filter: QueryFilter<UserEntity> = {}) {
    return User.find(filter).select(publicUserProjection).sort({ createdAt: -1 });
  },

  updateById(id: string, payload: UpdateUserPayload) {
    return User.findByIdAndUpdate(id, payload as UpdateQuery<UserDocument>, {
      new: true,
      runValidators: true,
    }).select(publicUserProjection);
  },

  updateStatus(id: string, status: UserStatus) {
    return User.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    ).select(publicUserProjection);
  },

  deleteById(id: string | Types.ObjectId) {
    return User.findByIdAndDelete(id);
  },
};
