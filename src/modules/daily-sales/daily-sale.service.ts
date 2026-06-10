import { Types } from "mongoose";
import { AppError } from "../../shared/errors/app-error.js";
import { dailySaleRepository } from "./daily-sale.repository.js";
import type { CreateDailySaleInput, ListDailySalesQuery } from "./daily-sale.schemas.js";

type DailySalesMetrics = {
  totalRevenue: number;
  averageGrossMargin: number;
  salesRecorded: number;
};

type DailySalesSummary = {
  date: string;
  totalRevenue: number;
  averageGrossMargin: number;
  salesRecorded: number;
};

const calculateMetrics = (
  sales: Array<{
    totalRevenue: number;
    grossMargin: number;
  }>,
): DailySalesMetrics => {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const salesRecorded = sales.length;
  const averageGrossMargin =
    salesRecorded === 0
      ? 0
      : sales.reduce((sum, sale) => sum + sale.grossMargin, 0) / salesRecorded;

  return {
    totalRevenue,
    averageGrossMargin,
    salesRecorded,
  };
};

const buildDailySummaries = (
  sales: Array<{
    date: string;
    totalRevenue: number;
    grossMargin: number;
  }>,
): DailySalesSummary[] => {
  const grouped = new Map<string, { totalRevenue: number; marginTotal: number; salesRecorded: number }>();

  sales.forEach((sale) => {
    const current = grouped.get(sale.date) ?? {
      totalRevenue: 0,
      marginTotal: 0,
      salesRecorded: 0,
    };

    current.totalRevenue += sale.totalRevenue;
    current.marginTotal += sale.grossMargin;
    current.salesRecorded += 1;

    grouped.set(sale.date, current);
  });

  return [...grouped.entries()]
    .map(([date, value]) => ({
      date,
      totalRevenue: value.totalRevenue,
      averageGrossMargin: value.salesRecorded === 0 ? 0 : value.marginTotal / value.salesRecorded,
      salesRecorded: value.salesRecorded,
    }))
    .sort((left, right) => right.date.localeCompare(left.date));
};

export const listMyDailySales = async (dealerId: string, query: ListDailySalesQuery) => {
  const filter: Record<string, unknown> = { dealer: dealerId };

  if (query.date) {
    filter.date = query.date;
  }

  if (query.search) {
    filter.customerName = { $regex: query.search, $options: "i" };
  }

  const sales = await dailySaleRepository.findMany(filter);

  return {
    sales,
    metrics: calculateMetrics(sales),
    dailySummaries: buildDailySummaries(sales),
  };
};

export const createMyDailySale = (dealerId: string, payload: CreateDailySaleInput) =>
  dailySaleRepository.create({
    ...payload,
    dealer: dealerId,
  });

export const deleteMyDailySale = async (dealerId: string, saleId: string) => {
  if (!Types.ObjectId.isValid(saleId)) {
    throw new AppError(404, "Daily sale not found");
  }

  const deletedDailySale = await dailySaleRepository.deleteByIdAndDealer(saleId, dealerId);

  if (!deletedDailySale) {
    throw new AppError(404, "Daily sale not found");
  }

  return deletedDailySale;
};
