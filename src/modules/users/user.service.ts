import { AppError } from "../../shared/errors/app-error.js";
import type {
  CreateDealerInput,
  CreateUserInput,
  UpdateMyProfileInput,
  UpdateUserStatusInput,
} from "./user.schemas.js";
import { sendDealerWelcomePassword } from "./dealer-email.service.js";
import { createTemporaryPassword } from "./password-generator.js";
import { userRepository } from "./user.repository.js";

export const createUser = async (payload: CreateUserInput, creatorId: string) => {
  const existingUser = await userRepository.existsByEmail(payload.email);

  if (existingUser) {
    throw new AppError(409, "A user with this email already exists");
  }

  const user = await userRepository.create({
    ...payload,
    createdBy: creatorId,
  });

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

export const updateMyProfile = async (userId: string, payload: UpdateMyProfileInput) => {
  const user = await userRepository.updateById(userId, payload);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const listUsers = () => userRepository.findMany({ role: { $ne: "super_admin" } });

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
