import bcrypt from "bcrypt";
import { model, Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { userRoles, userStatuses, type UserRole, type UserStatus } from "./user.types.js";

export type User = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  address?: string;
  mobile?: string;
  passwordChangedAt?: Date;
  passwordResetOtpHash?: string;
  passwordResetOtpExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

type UserMethods = {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

type UserModel = Model<User, object, UserMethods>;

const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "dealer",
      index: true,
    },
    status: {
      type: String,
      enum: userStatuses,
      default: "active",
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    passwordChangedAt: Date,
    passwordResetOtpHash: {
      type: String,
      select: false,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const user = ret as Partial<User>;
        delete user.password;
        delete user.passwordResetOtpHash;
        delete user.passwordResetOtpExpiresAt;
        delete user.passwordResetTokenHash;
        delete user.passwordResetTokenExpiresAt;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export type UserDocument = HydratedDocument<User, UserMethods> & {
  _id: Types.ObjectId;
};

export const User = model<User, UserModel>("User", userSchema);
