import { z } from "zod";
import { manageableClaimStatuses } from "./claim.types.js";

const orderIdentifierSchema = z.string().trim().min(1).max(120);

export const createClaimSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().toLowerCase(),
    orderId: orderIdentifierSchema.optional(),
    policyNumber: orderIdentifierSchema.optional(),
    flooringType: z.string().trim().min(1).max(80),
    description: z.string().trim().min(10).max(2000),
  })
  .strict()
  .superRefine((payload, context) => {
    if (!payload.orderId && !payload.policyNumber) {
      context.addIssue({
        code: "custom",
        path: ["orderId"],
        message: "Order ID is required",
      });
    }
  })
  .transform(({ policyNumber: _policyNumber, ...payload }) => ({
    ...payload,
    orderId: payload.orderId ?? _policyNumber ?? "",
  }));

export const updateClaimStatusSchema = z.object({
  status: z.enum(manageableClaimStatuses),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
