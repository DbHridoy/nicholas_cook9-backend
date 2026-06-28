import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClaimSchema, updateClaimStatusSchema } from "../src/modules/claims/claim.schemas.js";

const repositoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  findByClaimId: vi.fn(),
  findOne: vi.fn(),
  updateStatusById: vi.fn(),
  updateStatusByClaimId: vi.fn(),
}));

const contractRepositoryMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findOne: vi.fn(),
}));

const userRepositoryMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

const notificationRepositoryMocks = vi.hoisted(() => ({
  createMany: vi.fn(),
}));

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "abcdef1234567890abcdef1234567890"),
}));

vi.mock("../src/modules/claims/claim.repository.js", () => ({
  claimRepository: repositoryMocks,
}));

vi.mock("../src/modules/contracts/contract.repository.js", () => ({
  contractRepository: contractRepositoryMocks,
}));

vi.mock("../src/modules/users/user.repository.js", () => ({
  userRepository: userRepositoryMocks,
}));

vi.mock("../src/modules/notifications/notification.repository.js", () => ({
  notificationRepository: notificationRepositoryMocks,
}));

const { createClaim, getClaim, updateClaimStatus } = await import("../src/modules/claims/claim.service.js");

describe("claim service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a claim and lets the model default status to pending", async () => {
    const payload = {
      name: "Customer One",
      email: "customer@example.com",
      orderId: "ORDER-1001",
      description: "The order arrived with a damaged item.",
    };
    const createdClaim = {
      _id: "claim-id",
      claimId: "CLM-ABCDEF123456",
      ...payload,
      dealer: "dealer-id",
      flooringType: "Hardwood",
      attachments: ["https://s3.example.com/doc-1.pdf", "https://s3.example.com/doc-2.png"],
      status: "pending",
    };

    contractRepositoryMocks.findOne.mockResolvedValue({
      _id: "contract-id",
      orderId: "ORDER-1001",
      dealer: "dealer-id",
      coveredProduct: "hardwood",
    });
    repositoryMocks.create.mockResolvedValue(createdClaim);
    userRepositoryMocks.findMany.mockResolvedValue([
      { _id: "admin-id", role: "admin" },
      { _id: "super-admin-id", role: "super_admin" },
    ]);
    notificationRepositoryMocks.createMany.mockResolvedValue([]);

    await expect(createClaim(payload)).resolves.toEqual(createdClaim);
    expect(contractRepositoryMocks.findOne).toHaveBeenCalledWith({ orderId: "ORDER-1001" });
    expect(repositoryMocks.create).toHaveBeenCalledWith({
      claimId: "CLM-ABCDEF123456",
      ...payload,
      dealer: "dealer-id",
      flooringType: "Hardwood",
      attachments: [],
    });
    expect(notificationRepositoryMocks.createMany).toHaveBeenCalledWith([
      {
        recipient: "dealer-id",
        claim: "claim-id",
        type: "claim_created",
        title: "New claim submitted",
        message: "A new claim CLM-ABCDEF123456 was submitted for order ORDER-1001 by Customer One.",
      },
      {
        recipient: "admin-id",
        claim: "claim-id",
        type: "claim_created",
        title: "New claim submitted",
        message: "A new claim CLM-ABCDEF123456 was submitted for order ORDER-1001 by Customer One.",
      },
      {
        recipient: "super-admin-id",
        claim: "claim-id",
        type: "claim_created",
        title: "New claim submitted",
        message: "A new claim CLM-ABCDEF123456 was submitted for order ORDER-1001 by Customer One.",
      },
    ]);
  });

  it("returns a clear error when the order id does not exist", async () => {
    contractRepositoryMocks.findOne.mockResolvedValue(null);

    await expect(
      createClaim({
        name: "Customer One",
        email: "customer@example.com",
        orderId: "INVALID-ORDER",
        description: "The order arrived with a damaged item.",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Order not found",
    });

    expect(repositoryMocks.create).not.toHaveBeenCalled();
    expect(notificationRepositoryMocks.createMany).not.toHaveBeenCalled();
  });

  it("updates claim status to approved or denied only", async () => {
    repositoryMocks.updateStatusByClaimId.mockResolvedValue({
      _id: "claim-id",
      claimId: "CLM-ABCDEF123456",
      status: "approved",
    });

    await expect(
      updateClaimStatus(
        "CLM-ABCDEF123456",
        { status: "approved" },
        { id: "admin-id", role: "admin" },
      ),
    ).resolves.toMatchObject({
      status: "approved",
    });

    expect(updateClaimStatusSchema.safeParse({ status: "pending" }).success).toBe(false);
    expect(updateClaimStatusSchema.safeParse({ status: "denied" }).success).toBe(true);
    expect(repositoryMocks.updateStatusByClaimId).toHaveBeenCalledWith(
      "CLM-ABCDEF123456",
      "approved",
    );
  });

  it("retrieves claims by claim ID or Mongo ID", async () => {
    const claim = {
      _id: "6a1ca7830ac3eb315a4201ec",
      claimId: "CLM-ABCDEF123456",
      dealer: { toString: () => "dealer-id" },
    };

    repositoryMocks.findByClaimId.mockResolvedValueOnce(claim);

    await expect(
      getClaim("clm-abcdef123456", { id: "dealer-id", role: "dealer" }),
    ).resolves.toEqual(claim);
    expect(repositoryMocks.findByClaimId).toHaveBeenCalledWith("clm-abcdef123456");
    expect(repositoryMocks.findById).not.toHaveBeenCalled();

    repositoryMocks.findByClaimId.mockResolvedValueOnce(null);
    repositoryMocks.findById.mockResolvedValueOnce(claim);

    await expect(
      getClaim("6a1ca7830ac3eb315a4201ec", { id: "dealer-id", role: "dealer" }),
    ).resolves.toEqual(claim);
    expect(repositoryMocks.findById).toHaveBeenCalledWith("6a1ca7830ac3eb315a4201ec");
  });

  it("updates claim status by Mongo ID when the claim ID lookup misses", async () => {
    repositoryMocks.updateStatusByClaimId.mockResolvedValue(null);
    repositoryMocks.updateStatusById.mockResolvedValue({
      _id: "6a1ca7830ac3eb315a4201ec",
      claimId: "CLM-ABCDEF123456",
      status: "denied",
    });

    await expect(
      updateClaimStatus(
        "6a1ca7830ac3eb315a4201ec",
        { status: "denied" },
        { id: "super-admin-id", role: "super_admin" },
      ),
    ).resolves.toMatchObject({
      status: "denied",
    });

    expect(repositoryMocks.updateStatusByClaimId).toHaveBeenCalledWith(
      "6a1ca7830ac3eb315a4201ec",
      "denied",
    );
    expect(repositoryMocks.updateStatusById).toHaveBeenCalledWith(
      "6a1ca7830ac3eb315a4201ec",
      "denied",
    );
  });

  it("allows dealers to update their own claims", async () => {
    repositoryMocks.findByClaimId.mockResolvedValueOnce({
      _id: "claim-id",
      claimId: "CLM-ABCDEF123456",
      dealer: { toString: () => "dealer-id" },
      status: "pending",
    });
    repositoryMocks.updateStatusByClaimId.mockResolvedValueOnce({
      _id: "claim-id",
      claimId: "CLM-ABCDEF123456",
      dealer: { toString: () => "dealer-id" },
      status: "approved",
    });

    await expect(
      updateClaimStatus(
        "CLM-ABCDEF123456",
        { status: "approved" },
        { id: "dealer-id", role: "dealer" },
      ),
    ).resolves.toMatchObject({
      status: "approved",
    });
  });

  it("rejects dealers updating other dealers' claims", async () => {
    repositoryMocks.findByClaimId.mockResolvedValueOnce({
      _id: "claim-id",
      claimId: "CLM-ABCDEF123456",
      dealer: { toString: () => "other-dealer-id" },
      status: "pending",
    });

    await expect(
      updateClaimStatus(
        "CLM-ABCDEF123456",
        { status: "denied" },
        { id: "dealer-id", role: "dealer" },
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Claim not found",
    });

    expect(repositoryMocks.updateStatusByClaimId).not.toHaveBeenCalled();
    expect(repositoryMocks.updateStatusById).not.toHaveBeenCalled();
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
      description: "The order arrived with a damaged item.",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      orderId: "ORDER-1001",
    });
    expect("policyNumber" in result.data).toBe(false);
  });
});
