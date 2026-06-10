import type { QueryFilter, Types } from "mongoose";
import { DailySale, type DailySale as DailySaleEntity } from "./daily-sale.model.js";

type CreateDailySalePayload = Pick<
  DailySaleEntity,
  "date" | "customerName" | "totalRevenue" | "grossMargin"
> & {
  dealer: string | Types.ObjectId;
};

export const dailySaleRepository = {
  create(payload: CreateDailySalePayload) {
    return DailySale.create(payload);
  },

  findMany(filter: QueryFilter<DailySaleEntity> = {}) {
    return DailySale.find(filter).sort({ date: -1, createdAt: -1 });
  },

  findById(id: string) {
    return DailySale.findById(id);
  },

  deleteByIdAndDealer(id: string, dealer: string | Types.ObjectId) {
    return DailySale.findOneAndDelete({ _id: id, dealer });
  },
};
