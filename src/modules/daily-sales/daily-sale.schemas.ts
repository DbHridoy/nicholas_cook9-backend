import { z } from "zod";

const dailySaleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createDailySaleSchema = z.object({
  date: dailySaleDateSchema,
  customerName: z.string().trim().min(1, "Customer name is required"),
  totalRevenue: z.number().nonnegative(),
  grossMargin: z.number().min(0).max(100),
});

export const listDailySalesQuerySchema = z.object({
  date: dailySaleDateSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreateDailySaleInput = z.infer<typeof createDailySaleSchema>;
export type ListDailySalesQuery = z.infer<typeof listDailySalesQuerySchema>;
