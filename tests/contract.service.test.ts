import { beforeEach, describe, expect, it, vi } from "vitest";
import { createContractSchema } from "../src/modules/contracts/contract.schemas.js";

const repositoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  deleteById: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
}));

vi.mock("../src/modules/contracts/contract.repository.js", () => ({
  contractRepository: repositoryMocks,
}));

const { createContract, deleteContract, getContract, listContracts } =
  await import("../src/modules/contracts/contract.service.js");

describe("contract service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a contract with customer, product, term, and file information", async () => {
    const payload = {
      orderId: "ORDER-1001",
      name: "Customer One",
      propertyAddress: "123 Main Street",
      saleDate: new Date("2026-05-30T00:00:00.000Z"),
      coveredProduct: "lvp_laminate" as const,
      term: "Preload 2 year" as const,
      price: 499.99,
      file: "contracts/customer-one.pdf",
    };
    const createdContract = {
      _id: "contract-id",
      ...payload,
      dealer: "dealer-id",
    };

    repositoryMocks.create.mockResolvedValue(createdContract);

    await expect(createContract(payload, "dealer-id")).resolves.toEqual(createdContract);
    expect(repositoryMocks.create).toHaveBeenCalledWith({
      ...payload,
      dealer: "dealer-id",
      expiry: new Date("2028-05-30T00:00:00.000Z"),
    });
  });

  it("returns a not found error when a contract does not exist", async () => {
    repositoryMocks.findById.mockResolvedValue(null);

    await expect(
      getContract("missing-id", { id: "dealer-id", role: "dealer" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Contract not found",
    });
  });

  it("deletes a contract for the owning dealer", async () => {
    repositoryMocks.findById.mockResolvedValue({
      _id: "contract-id",
      dealer: {
        toString: () => "dealer-id",
      },
    });
    repositoryMocks.deleteById.mockResolvedValue({ _id: "contract-id" });

    await expect(
      deleteContract("contract-id", { id: "dealer-id", role: "dealer" }),
    ).resolves.toBeUndefined();
    expect(repositoryMocks.deleteById).toHaveBeenCalledWith("contract-id");
  });

  it("rejects deleting another dealer's contract", async () => {
    repositoryMocks.findById.mockResolvedValue({
      _id: "contract-id",
      dealer: {
        toString: () => "other-dealer-id",
      },
    });

    await expect(
      deleteContract("contract-id", { id: "dealer-id", role: "dealer" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Contract not found",
    });
  });

  it("filters contract lists to the current dealer", async () => {
    repositoryMocks.findMany.mockResolvedValue([]);

    await listContracts({ id: "dealer-id", role: "dealer" });
    expect(repositoryMocks.findMany).toHaveBeenCalledWith({ dealer: "dealer-id" });

    await listContracts({ id: "admin-id", role: "admin" });
    expect(repositoryMocks.findMany).toHaveBeenCalledWith({});
  });

  it("validates contract creation payloads", () => {
    const validResult = createContractSchema.safeParse({
      orderId: "ORDER-1001",
      name: "Customer One",
      propertyAddress: "123 Main Street",
      saleDate: "2026-05-30",
      coveredProduct: "carpet",
      term: "Preload 1 year",
      price: 299.99,
      file: "contracts/customer-one.pdf",
    });

    const invalidResult = createContractSchema.safeParse({
      orderId: "",
      name: "Customer One",
      propertyAddress: "123 Main Street",
      saleDate: "2026-05-30",
      coveredProduct: "vinyl",
      term: "10_year_coverage",
      price: -1,
      file: "contracts/customer-one.pdf",
    });

    expect(validResult.success).toBe(true);
    expect(invalidResult.success).toBe(false);
  });
});
