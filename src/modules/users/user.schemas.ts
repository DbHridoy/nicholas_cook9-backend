import { z } from "zod";
import { manageableUserRoles, userStatuses } from "./user.types.js";

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().toLowerCase(),
    role: z.enum(manageableUserRoles),
  })
  .strict();

export const createDealerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().toLowerCase(),
  })
  .strict();

export const updateMyProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  avatar: z.string().trim().optional(),
  address: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })
  .strict();

export const updateUserStatusSchema = z.object({
  status: z.enum(userStatuses),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateDealerInput = z.infer<typeof createDealerSchema>;
export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
