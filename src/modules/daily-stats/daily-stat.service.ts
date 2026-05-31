import { dailyStatRepository } from "./daily-stat.repository.js";
import type { UpsertDailyStatInput } from "./daily-stat.schemas.js";

export const listMyDailyStats = (dealerId: string) =>
  dailyStatRepository.findMany({ dealer: dealerId });

export const upsertMyDailyStat = (dealerId: string, payload: UpsertDailyStatInput) =>
  dailyStatRepository.upsert({
    ...payload,
    dealer: dealerId,
  });
