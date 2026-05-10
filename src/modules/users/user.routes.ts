import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createUser,
  getMyProfile,
  listUsers,
  updateMyProfile,
  updateUserStatus,
} from "./user.controller.js";
import { createUserSchema, updateMyProfileSchema, updateUserStatusSchema } from "./user.schemas.js";

export const userRouter: ExpressRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", getMyProfile);
userRouter.patch("/me", validateBody(updateMyProfileSchema), updateMyProfile);

userRouter.get("/", authorize("super_admin"), listUsers);
userRouter.post("/", authorize("super_admin"), validateBody(createUserSchema), createUser);
userRouter.patch(
  "/:userId/status",
  authorize("super_admin"),
  validateBody(updateUserStatusSchema),
  updateUserStatus,
);
