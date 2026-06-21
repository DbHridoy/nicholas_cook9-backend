import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createDealer,
  createUser,
  deleteUser,
  getMyProfile,
  getUserDetails,
  listUsers,
  updateMyProfile,
  updateUserStatus,
  changeMyPassword,
} from "./user.controller.js";
import {
  createDealerSchema,
  createUserSchema,
  updateMyProfileSchema,
  updateUserStatusSchema,
  changePasswordSchema,
} from "./user.schemas.js";

export const userRouter: ExpressRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", getMyProfile);
userRouter.patch("/me", validateBody(updateMyProfileSchema), updateMyProfile);
userRouter.patch("/me/password", validateBody(changePasswordSchema), changeMyPassword);

userRouter.get("/", authorize("admin", "super_admin"), listUsers);
userRouter.post("/", authorize("super_admin"), validateBody(createUserSchema), createUser);
userRouter.post(
  "/dealers",
  authorize("admin", "super_admin"),
  validateBody(createDealerSchema),
  createDealer,
);
userRouter.patch(
  "/:userId/status",
  authorize("super_admin"),
  validateBody(updateUserStatusSchema),
  updateUserStatus,
);
userRouter.get("/:userId", authorize("admin", "super_admin"), getUserDetails);
userRouter.delete("/:userId", authorize("admin", "super_admin"), deleteUser);
