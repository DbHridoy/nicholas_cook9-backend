import { z } from "zod";

export const upsertDailyStatSchema = z.object({
  date: z.coerce.date(),
  customers: z.number().int().nonnegative(),
  contractsSold: z.number().int().nonnegative(),
  avgSaleValue: z.number().nonnegative(),
  totalSales: z.number().nonnegative(),
  conversionRate: z.number().min(0).max(100),
});

export type UpsertDailyStatInput = z.infer<typeof upsertDailyStatSchema>;
