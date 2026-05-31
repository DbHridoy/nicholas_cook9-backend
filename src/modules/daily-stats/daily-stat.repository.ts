import type { QueryFilter, Types } from "mongoose";
import { DailyStat, type DailyStat as DailyStatEntity } from "./daily-stat.model.js";

type UpsertDailyStatPayload = Pick<
  DailyStatEntity,
  "date" | "customers" | "contractsSold" | "avgSaleValue" | "totalSales" | "conversionRate"
> & {
  dealer: string | Types.ObjectId;
};

export const dailyStatRepository = {
  findMany(filter: QueryFilter<DailyStatEntity> = {}) {
    return DailyStat.find(filter).sort({ date: -1 });
  },

  upsert(payload: UpsertDailyStatPayload) {
    return DailyStat.findOneAndUpdate({ dealer: payload.dealer, date: payload.date }, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  },
};
