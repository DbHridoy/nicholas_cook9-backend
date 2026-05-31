import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClaimSchema, updateClaimStatusSchema } from "../src/modules/claims/claim.schemas.js";

const repositoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock("../src/modules/claims/claim.repository.js", () => ({
  claimRepository: repositoryMocks,
}));

const { createClaim, updateClaimStatus } = await import("../src/modules/claims/claim.service.js");

describe("claim service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a claim and lets the model default status to pending", async () => {
    const payload = {
      name: "Customer One",
      email: "customer@example.com",
      orderId: "ORDER-1001",
      flooringType: "Hardwood",
      description: "The order arrived with a damaged item.",
    };
    const createdClaim = {
      _id: "claim-id",
      ...payload,
      status: "pending",
    };

    repositoryMocks.create.mockResolvedValue(createdClaim);

    await expect(createClaim(payload)).resolves.toEqual(createdClaim);
    expect(repositoryMocks.create).toHaveBeenCalledWith(payload);
  });

  it("updates claim status to approved or denied only", async () => {
    repositoryMocks.updateStatus.mockResolvedValue({
      _id: "claim-id",
      status: "approved",
    });

    await expect(updateClaimStatus("claim-id", { status: "approved" })).resolves.toMatchObject({
      status: "approved",
    });

    expect(updateClaimStatusSchema.safeParse({ status: "pending" }).success).toBe(false);
    expect(updateClaimStatusSchema.safeParse({ status: "denied" }).success).toBe(true);
    expect(repositoryMocks.updateStatus).toHaveBeenCalledWith("claim-id", "approved");
  });

  it("validates claim creation payloads", () => {
    const result = createClaimSchema.safeParse({
      name: "Customer One",
      email: "customer@example.com",
      orderId: "ORDER-1001",
      flooringType: "Hardwood",
      description: "The order arrived with a damaged item.",
      status: "approved",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes legacy policy number payloads to order ID", () => {
    const result = createClaimSchema.safeParse({
      name: "Customer One",
      email: "customer@example.com",
      policyNumber: "ORDER-1001",
      flooringType: "Hardwood",
      description: "The order arrived with a damaged item.",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      orderId: "ORDER-1001",
    });
    expect("policyNumber" in result.data).toBe(false);
  });
});
