import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type {
  CreateDealerInput,
  CreateUserInput,
  UpdateMyProfileInput,
  UpdateUserStatusInput,
} from "./user.schemas.js";
import * as userService from "./user.service.js";

export const createUser: RequestHandler = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body as CreateUserInput, req.user!.id);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user },
  });
});

export const createDealer: RequestHandler = asyncHandler(async (req, res) => {
  const user = await userService.createDealer(req.body as CreateDealerInput, req.user!.id);

  res.status(201).json({
    success: true,
    message: "Dealer created successfully. Temporary password was sent by email.",
    data: { user },
  });
});

export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: { user },
  });
});

export const updateMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user!.id, req.body as UpdateMyProfileInput);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

export const listUsers: RequestHandler = asyncHandler(async (_req, res) => {
  const users = await userService.listUsers();

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: { users },
  });
});

export const updateUserStatus: RequestHandler = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(
    String(req.params.userId),
    req.body as UpdateUserStatusInput,
  );

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: { user },
  });
});
