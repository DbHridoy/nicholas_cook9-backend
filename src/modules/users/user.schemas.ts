import { z } from "zod";
import { manageableUserRoles, userStatuses } from "./user.types.js";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  password: passwordSchema,
  role: z.enum(manageableUserRoles).default("dealer"),
});

export const createDealerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().toLowerCase(),
  })
  .strict();

export const updateMyProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(userStatuses),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateDealerInput = z.infer<typeof createDealerSchema>;
export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
