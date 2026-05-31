import { beforeEach, describe, expect, it, vi } from "vitest";

const claimRepositoryMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

const contractRepositoryMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

const userRepositoryMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("../src/modules/claims/claim.repository.js", () => ({
  claimRepository: claimRepositoryMocks,
}));

vi.mock("../src/modules/contracts/contract.repository.js", () => ({
  contractRepository: contractRepositoryMocks,
}));

vi.mock("../src/modules/users/user.repository.js", () => ({
  userRepository: userRepositoryMocks,
}));

const { getDashboard, getDealerDashboardMetrics } = await import(
  "../src/modules/dashboard/dashboard.service.js"
);

describe("dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-31T12:00:00.000Z"));
  });

  it("returns all manageable users, contracts, and claims for super admins", async () => {
    contractRepositoryMocks.findMany.mockResolvedValue([
      { _id: "contract-1", createdAt: new Date("2026-05-12T00:00:00.000Z") },
    ]);
    claimRepositoryMocks.findMany.mockResolvedValue([
      {
        _id: "claim-1",
        name: "Customer One",
        email: "customer@example.com",
        orderId: "ORDER-1",
        flooringType: "Hardwood",
        status: "approved",
        createdAt: new Date("2026-05-14T00:00:00.000Z"),
      },
    ]);
    userRepositoryMocks.findMany.mockResolvedValue([
      { _id: "admin-1", role: "admin", status: "active" },
      { _id: "dealer-1", role: "dealer", status: "blocked" },
    ]);

    const dashboard = await getDashboard({ id: "super-admin-id", role: "super_admin" });

    expect(contractRepositoryMocks.findMany).toHaveBeenCalledWith({});
    expect(claimRepositoryMocks.findMany).toHaveBeenCalledWith();
    expect(userRepositoryMocks.findMany).toHaveBeenCalledWith({ role: { $ne: "super_admin" } });
    expect(dashboard.stats.totalContracts.value).toBe(1);
    expect(dashboard.stats.claimsApproved.value).toBe(1);
    expect(dashboard.stats.users).toMatchObject({
      total: 2,
      admins: 1,
      dealers: 1,
      active: 1,
      blocked: 1,
    });
    expect(dashboard.recentClaims).toHaveLength(1);
  });

  it("keeps dealer dashboards scoped to their contracts without returning claims or user counts", async () => {
    contractRepositoryMocks.findMany.mockResolvedValue([]);

    const dashboard = await getDashboard({ id: "dealer-id", role: "dealer" });

    expect(contractRepositoryMocks.findMany).toHaveBeenCalledWith({ dealer: "dealer-id" });
    expect(claimRepositoryMocks.findMany).not.toHaveBeenCalled();
    expect(userRepositoryMocks.findMany).not.toHaveBeenCalled();
    expect(dashboard.claimsOverview.total).toBe(0);
    expect(dashboard.stats.users.total).toBe(0);
  });

  it("returns dealer dashboard metrics scoped to the dealer", async () => {
    contractRepositoryMocks.findMany.mockResolvedValue([
      {
        _id: "contract-1",
        dealer: "dealer-id",
        orderId: "ORDER-1",
        name: "Customer One",
        coveredProduct: "hardwood",
        price: 250,
        expiry: new Date("2027-05-31T00:00:00.000Z"),
        createdAt: new Date("2026-05-10T00:00:00.000Z"),
      },
      {
        _id: "contract-2",
        dealer: "dealer-id",
        orderId: "ORDER-2",
        name: "Customer Two",
        coveredProduct: "tile",
        price: 100,
        expiry: new Date("2026-04-30T00:00:00.000Z"),
        createdAt: new Date("2026-04-10T00:00:00.000Z"),
      },
    ]);
    claimRepositoryMocks.findMany.mockResolvedValue([
      {
        _id: "claim-1",
        claimId: "CLM-123",
        dealer: "dealer-id",
        name: "Customer One",
        email: "customer@example.com",
        orderId: "ORDER-1",
        flooringType: "Hardwood",
        status: "approved",
        createdAt: new Date("2026-05-14T00:00:00.000Z"),
      },
      {
        _id: "claim-2",
        claimId: "CLM-456",
        dealer: "dealer-id",
        name: "Customer Two",
        email: "customer2@example.com",
        orderId: "ORDER-2",
        flooringType: "Tile",
        status: "pending",
        createdAt: new Date("2026-04-14T00:00:00.000Z"),
      },
    ]);

    const dashboard = await getDealerDashboardMetrics({ id: "dealer-id", role: "dealer" });

    expect(contractRepositoryMocks.findMany).toHaveBeenCalledWith({ dealer: "dealer-id" });
    expect(claimRepositoryMocks.findMany).toHaveBeenCalledWith({ dealer: "dealer-id" });
    expect(userRepositoryMocks.findMany).not.toHaveBeenCalled();
    expect(dashboard.stats.totalContracts.value).toBe(2);
    expect(dashboard.stats.activeContracts.value).toBe(1);
    expect(dashboard.stats.totalSales.value).toBe(350);
    expect(dashboard.stats.claimsSubmitted.value).toBe(2);
    expect(dashboard.stats.claimsApproved.value).toBe(1);
    expect(dashboard.claimsOverview.total).toBe(2);
    expect(dashboard.recentClaims[0]).toMatchObject({
      id: "CLM-123",
      mongoId: "claim-1",
      amount: 250,
    });
    expect(dashboard.recentContracts).toHaveLength(2);
  });
});
