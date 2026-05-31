import { AppError } from "../../shared/errors/app-error.js";
import type {
  CreateDealerInput,
  CreateUserInput,
  UpdateMyProfileInput,
  UpdateUserStatusInput,
  ChangePasswordInput,
} from "./user.schemas.js";
import type { UserRole } from "./user.types.js";
import { sendDealerWelcomePassword, sendUserWelcomePassword } from "./dealer-email.service.js";
import { createTemporaryPassword } from "./password-generator.js";
import { userRepository } from "./user.repository.js";
import { contractRepository } from "../contracts/contract.repository.js";
import { claimRepository } from "../claims/claim.repository.js";

type RequestUser = {
  id: string;
  role: UserRole;
};

export const createUser = async (payload: CreateUserInput, creatorId: string) => {
  const existingUser = await userRepository.existsByEmail(payload.email);

  if (existingUser) {
    throw new AppError(409, "A user with this email already exists");
  }

  const temporaryPassword = createTemporaryPassword();
  const user = await userRepository.create({
    ...payload,
    password: temporaryPassword,
    createdBy: creatorId,
  });

  try {
    await sendUserWelcomePassword({
      email: payload.email,
      name: payload.name,
      role: payload.role,
      temporaryPassword,
    });
  } catch {
    await userRepository.deleteById(user._id);
    throw new AppError(
      502,
      "User account could not be created because the welcome email could not be sent. Verify SMTP configuration and try again.",
    );
  }

  return userRepository.findById(user._id);
};

export const createDealer = async (payload: CreateDealerInput, creatorId: string) => {
  const existingUser = await userRepository.existsByEmail(payload.email);

  if (existingUser) {
    throw new AppError(409, "A user with this email already exists");
  }

  const temporaryPassword = createTemporaryPassword();
  const user = await userRepository.create({
    ...payload,
    password: temporaryPassword,
    role: "dealer",
    createdBy: creatorId,
  });

  try {
    await sendDealerWelcomePassword({
      email: payload.email,
      name: payload.name,
      temporaryPassword,
    });
  } catch {
    await userRepository.deleteById(user._id);
    throw new AppError(
      502,
      "Dealer account could not be created because the welcome email could not be sent. Verify SMTP configuration and try again.",
    );
  }

  return userRepository.findById(user._id);
};

export const getMyProfile = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const getUserDetails = async (userId: string, requester: RequestUser) => {
  const user = await userRepository.findById(userId);

  if (!user || user.role === "super_admin") {
    throw new AppError(404, "User not found");
  }

  if (requester.role === "admin" && user.role !== "dealer") {
    throw new AppError(404, "User not found");
  }

  const contracts =
    user.role === "dealer" ? await contractRepository.findMany({ dealer: userId }) : [];
  const orderIds = contracts.map((contract) => contract.orderId).filter(Boolean);
  const claims = orderIds.length
    ? await claimRepository.findMany({ orderId: { $in: orderIds } })
    : [];
  const monthlyPerformance = Array.from({ length: 6 }, (_, index) => {
    const current = new Date();
    const monthStart = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - (5 - index), 1),
    );
    const nextMonthStart = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );

    return {
      month: monthStart.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      contracts: contracts.filter(
        (contract) =>
          contract.createdAt &&
          contract.createdAt >= monthStart &&
          contract.createdAt < nextMonthStart,
      ).length,
      claims: claims.filter(
        (claim) =>
          claim.createdAt && claim.createdAt >= monthStart && claim.createdAt < nextMonthStart,
      ).length,
    };
  });

  return {
    ...user.toObject(),
    stats: {
      totalContracts: contracts.length,
      totalSales: contracts.reduce((sum, contract) => sum + contract.price, 0),
      approvedClaims: claims.filter((claim) => claim.status === "approved").length,
      pendingClaims: claims.filter((claim) => claim.status === "pending").length,
      deniedClaims: claims.filter((claim) => claim.status === "denied").length,
    },
    performance: monthlyPerformance,
  };
};

export const updateMyProfile = async (userId: string, payload: UpdateMyProfileInput) => {
  const user = await userRepository.updateById(userId, payload);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const listUsers = (requesterRole: UserRole) => {
  if (requesterRole === "super_admin") {
    return userRepository.findMany({ role: { $ne: "super_admin" } });
  }

  return userRepository.findMany({ role: "dealer" });
};

export const updateUserStatus = async (userId: string, payload: UpdateUserStatusInput) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === "super_admin") {
    throw new AppError(403, "Super admin status cannot be changed from this endpoint");
  }

  return userRepository.updateStatus(userId, payload.status);
};

export const changeMyPassword = async (userId: string, payload: ChangePasswordInput) => {
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.password) {
    throw new AppError(400, "Password is not set for this account");
  }

  let isCurrentPasswordCorrect;
  try {
    isCurrentPasswordCorrect = await user.comparePassword(payload.currentPassword);
  } catch {
    throw new AppError(400, "Incorrect current password");
  }

  if (!isCurrentPasswordCorrect) {
    throw new AppError(400, "Incorrect current password");
  }

  user.password = payload.newPassword;
  await user.save();
};
