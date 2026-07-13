import { z } from "zod";

export const createCancellationSchema = z
  .object({
    contractId: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "A valid contract must be selected"),
    customerName: z.string().trim().min(1, "Customer name is required"),
    originalPurchasePrice: z.number().nonnegative("Original purchase price must be 0 or more"),
    remainingCoverageMonths: z
      .number()
      .int("Remaining coverage months must be a whole number")
      .nonnegative("Remaining coverage months must be 0 or more"),
    originalCoverageMonths: z
      .number()
      .int("Original coverage months must be a whole number")
      .positive("Original coverage months must be greater than 0"),
  })
  .superRefine((value, ctx) => {
    if (value.remainingCoverageMonths > value.originalCoverageMonths) {
      ctx.addIssue({
        code: "custom",
        path: ["remainingCoverageMonths"],
        message: "Remaining coverage months cannot exceed original coverage months",
      });
    }
  });

export type CreateCancellationInput = z.infer<typeof createCancellationSchema>;
