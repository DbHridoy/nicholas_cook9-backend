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

const { getDashboard } = await import("../src/modules/dashboard/dashboard.service.js");

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
});
