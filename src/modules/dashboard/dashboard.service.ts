import type { QueryFilter } from "mongoose";
import { claimRepository } from "../claims/claim.repository.js";
import type { Claim } from "../claims/claim.model.js";
import { contractRepository } from "../contracts/contract.repository.js";
import type { Contract } from "../contracts/contract.model.js";
import { userRepository } from "../users/user.repository.js";
import type { UserRole } from "../users/user.types.js";
import type { CoveredProduct } from "../contracts/contract.types.js";

type RequestUser = {
  id: string;
  role: UserRole;
};

const statusMeta = {
  pending: { label: "Pending", color: "#f59e0b" },
  approved: { label: "Approved", color: "#10b981" },
  denied: { label: "Denied", color: "#ef4444" },
} as const;

const getMonthRange = (date = new Date()) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  const previousStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));

  return {
    start,
    end,
    previousStart,
    label: `${start.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} 1 - ${new Date(
      end.getTime() - 1,
    ).toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
    previousLabel: `${previousStart.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    })} 1 - ${new Date(start.getTime() - 1).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })}`,
  };
};

const isInRange = (value: Date | undefined, start: Date, end: Date) =>
  Boolean(value && value >= start && value < end);

const formatTrend = (current: number, previous: number, previousLabel: string) => {
  if (previous === 0) {
    return current === 0 ? `No change vs ${previousLabel}` : `+${current} vs ${previousLabel}`;
  }

  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent >= 0 ? "+" : ""}${percent}% vs ${previousLabel}`;
};

const toRecentClaim = (claim: Claim & { _id?: unknown }) => ({
  id: claim._id ? String(claim._id) : "",
  customer: claim.name,
  email: claim.email,
  orderId: claim.orderId,
  flooringType: claim.flooringType,
  status: claim.status,
  date: claim.createdAt,
  amount: null,
});

export const getDashboard = async (user: RequestUser) => {
  const { start, end, previousStart, label, previousLabel } = getMonthRange();
  const contractFilter: QueryFilter<Contract> = user.role === "dealer" ? { dealer: user.id } : {};

  const [contracts, claims, users] = await Promise.all([
    contractRepository.findMany(contractFilter),
    user.role === "dealer" ? Promise.resolve([]) : claimRepository.findMany(),
    user.role === "dealer"
      ? Promise.resolve([])
      : userRepository.findMany(
          user.role === "super_admin" ? { role: { $ne: "super_admin" } } : { role: "dealer" },
        ),
  ]);

  const currentContracts = contracts.filter((contract) =>
    isInRange(contract.createdAt, start, end),
  );
  const previousContracts = contracts.filter((contract) =>
    isInRange(contract.createdAt, previousStart, start),
  );
  const currentClaims = claims.filter((claim) => isInRange(claim.createdAt, start, end));
  const previousClaims = claims.filter((claim) => isInRange(claim.createdAt, previousStart, start));

  const approvedClaims = claims.filter((claim) => claim.status === "approved");
  const currentApprovedClaims = currentClaims.filter((claim) => claim.status === "approved");
  const previousApprovedClaims = previousClaims.filter((claim) => claim.status === "approved");

  const claimsByStatus = Object.entries(statusMeta).map(([status, meta]) => {
    const count = claims.filter((claim) => claim.status === status).length;

    return {
      status,
      label: meta.label,
      color: meta.color,
      count,
      pct: claims.length ? Math.round((count / claims.length) * 100) : 0,
    };
  });

  const userSummary = {
    total: users.length,
    admins: users.filter((dashboardUser) => dashboardUser.role === "admin").length,
    dealers: users.filter((dashboardUser) => dashboardUser.role === "dealer").length,
    active: users.filter((dashboardUser) => dashboardUser.status === "active").length,
    blocked: users.filter((dashboardUser) => dashboardUser.status === "blocked").length,
  };

  return {
    period: {
      label,
      start: start.toISOString(),
      end: end.toISOString(),
      previousLabel,
    },
    stats: {
      totalContracts: {
        value: contracts.length,
        trend: formatTrend(currentContracts.length, previousContracts.length, previousLabel),
      },
      claimsSubmitted: {
        value: claims.length,
        trend: formatTrend(currentClaims.length, previousClaims.length, previousLabel),
      },
      claimsApproved: {
        value: approvedClaims.length,
        trend: formatTrend(
          currentApprovedClaims.length,
          previousApprovedClaims.length,
          previousLabel,
        ),
      },
      users: userSummary,
    },
    claimsOverview: {
      total: claims.length,
      byStatus: claimsByStatus,
    },
    recentClaims: claims.slice(0, 5).map(toRecentClaim),
  };
};

const getScopedData = async (user: RequestUser) => {
  const contractFilter: QueryFilter<Contract> = user.role === "dealer" ? { dealer: user.id } : {};
  const contracts = await contractRepository.findMany(contractFilter);

  if (user.role === "dealer") {
    const orderIds = contracts.map((contract) => contract.orderId).filter(Boolean);
    const claims = orderIds.length
      ? await claimRepository.findMany({ orderId: { $in: orderIds } })
      : [];

    return { contracts, claims };
  }

  const claims = await claimRepository.findMany();
  return { contracts, claims };
};

export const getAnalytics = async (user: RequestUser) => {
  const [{ contracts, claims }, users] = await Promise.all([
    getScopedData(user),
    user.role === "dealer" ? Promise.resolve([]) : userRepository.findMany({ role: "dealer" }),
  ]);
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const current = new Date();
    const monthStart = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - (5 - index), 1),
    );
    const nextMonthStart = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );

    return {
      month: monthStart.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      contracts: contracts.filter(
        (contract) =>
          contract.createdAt &&
          contract.createdAt >= monthStart &&
          contract.createdAt < nextMonthStart,
      ).length,
      claims: claims.filter(
        (claim) =>
          claim.createdAt && claim.createdAt >= monthStart && claim.createdAt < nextMonthStart,
      ).length,
    };
  });

  return {
    totalContracts: contracts.length,
    totalSales: contracts.reduce((sum, contract) => sum + contract.price, 0),
    activeDealers: users.filter((dashboardUser) => dashboardUser.status === "active").length,
    avgContractsPerDealer: users.length ? Math.round(contracts.length / users.length) : 0,
    chartData,
  };
};

const productLabels: Record<CoveredProduct, string> = {
  carpet: "Carpet",
  lvp_laminate: "LVP / Laminate",
  hardwood: "Hardwood",
  tile: "Tile",
};

export const getProductPerformance = async (user: RequestUser) => {
  const { contracts, claims } = await getScopedData(user);
  const products = (Object.keys(productLabels) as CoveredProduct[]).map((product) => {
    const productContracts = contracts.filter((contract) => contract.coveredProduct === product);
    const productClaims = claims.filter(
      (claim) => claim.flooringType.toLowerCase() === productLabels[product].toLowerCase(),
    );
    const claimRate = productContracts.length
      ? (productClaims.length / productContracts.length) * 100
      : 0;

    return {
      id: product,
      name: productLabels[product],
      category: "Flooring",
      sold: productContracts.length,
      claims: productClaims.length,
      claimRate,
      performanceScore: Math.max(0, Math.round(100 - claimRate * 5)),
    };
  });
  const averageReliability = products.length
    ? Math.round(
        (products.reduce((sum, product) => sum + product.performanceScore, 0) / products.length) *
          10,
      ) / 10
    : 0;

  return {
    averageReliability,
    totalProducts: products.length,
    atRiskProducts: products.filter((product) => product.performanceScore < 70).length,
    products,
  };
};
