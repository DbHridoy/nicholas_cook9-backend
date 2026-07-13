import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/shared/errors/app-error.js";

const cancellationRepositoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  processByIdAndDealer: vi.fn(),
}));

const contractRepositoryMocks = vi.hoisted(() => ({
  findById: vi.fn(),
  updateStatusByIdAndDealer: vi.fn(),
}));

vi.mock("../src/modules/cancellations/cancellation.repository.js", () => ({
  cancellationRepository: cancellationRepositoryMocks,
}));

vi.mock("../src/modules/contracts/contract.repository.js", () => ({
  contractRepository: contractRepositoryMocks,
}));

const {
  calculateRefundAmount,
  createMyCancellation,
  listMyCancellations,
  processMyCancellation,
} = await import("../src/modules/cancellations/cancellation.service.js");

describe("cancellation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates refund amount from contract values", () => {
    expect(
      calculateRefundAmount({
        originalPurchasePrice: 699,
        remainingCoverageMonths: 26,
        originalCoverageMonths: 36,
      }),
    ).toBe(504.83);
  });

  it("creates a dealer cancellation quote with a calculated refund amount", async () => {
    contractRepositoryMocks.findById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      dealer: { toString: () => "dealer-id" },
    });
    cancellationRepositoryMocks.create.mockResolvedValue({ _id: "cancellation-id" });

    await createMyCancellation("dealer-id", {
      contractId: "507f1f77bcf86cd799439011",
      customerName: "Customer One",
      originalPurchasePrice: 699,
      remainingCoverageMonths: 26,
      originalCoverageMonths: 36,
    });

    expect(cancellationRepositoryMocks.create).toHaveBeenCalledWith({
      contract: "507f1f77bcf86cd799439011",
      customerName: "Customer One",
      dealer: "dealer-id",
      originalPurchasePrice: 699,
      remainingCoverageMonths: 26,
      originalCoverageMonths: 36,
      refundAmount: 504.83,
      status: "draft",
    });
  });

  it("lists dealer cancellations scoped to the dealer", async () => {
    cancellationRepositoryMocks.findMany.mockResolvedValue([]);

    await listMyCancellations("dealer-id");

    expect(cancellationRepositoryMocks.findMany).toHaveBeenCalledWith({ dealer: "dealer-id" });
  });

  it("processes a draft cancellation for the dealer", async () => {
    cancellationRepositoryMocks.findById.mockResolvedValue({
      _id: "cancellation-id",
      contract: { toString: () => "contract-id" },
      dealer: { toString: () => "dealer-id" },
      status: "draft",
    });
    contractRepositoryMocks.updateStatusByIdAndDealer.mockResolvedValue({
      _id: "contract-id",
      status: "cancelled",
    });
    cancellationRepositoryMocks.processByIdAndDealer.mockResolvedValue({
      _id: "cancellation-id",
      status: "processed",
    });

    await expect(processMyCancellation("dealer-id", "507f1f77bcf86cd799439011")).resolves.toEqual({
      _id: "cancellation-id",
      status: "processed",
    });

    expect(cancellationRepositoryMocks.processByIdAndDealer).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "dealer-id",
    );
    expect(contractRepositoryMocks.updateStatusByIdAndDealer).toHaveBeenCalledWith(
      "contract-id",
      "dealer-id",
      "cancelled",
    );
  });

  it("rejects already processed cancellations", async () => {
    cancellationRepositoryMocks.findById.mockResolvedValue({
      _id: "cancellation-id",
      contract: { toString: () => "contract-id" },
      dealer: { toString: () => "dealer-id" },
      status: "processed",
    });

    await expect(
      processMyCancellation("dealer-id", "507f1f77bcf86cd799439011"),
    ).rejects.toMatchObject<AppError>({
      statusCode: 400,
      message: "Cancellation has already been processed",
    });
  });
});
