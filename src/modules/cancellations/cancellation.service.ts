import { Types } from "mongoose";
import { AppError } from "../../shared/errors/app-error.js";
import { contractRepository } from "../contracts/contract.repository.js";
import { cancellationRepository } from "./cancellation.repository.js";
import type { CreateCancellationInput } from "./cancellation.schemas.js";

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const calculateRefundAmount = ({
  originalPurchasePrice,
  remainingCoverageMonths,
  originalCoverageMonths,
}: Pick<
  CreateCancellationInput,
  "originalPurchasePrice" | "remainingCoverageMonths" | "originalCoverageMonths"
>) => roundCurrency((originalPurchasePrice * remainingCoverageMonths) / originalCoverageMonths);

export const listMyCancellations = (dealerId: string) =>
  cancellationRepository.findMany({ dealer: dealerId });

export const createMyCancellation = async (dealerId: string, payload: CreateCancellationInput) => {
  const contract = await contractRepository.findById(payload.contractId);

  if (!contract || contract.dealer.toString() !== dealerId) {
    throw new AppError(404, "Contract not found");
  }

  return cancellationRepository.create({
    contract: payload.contractId,
    customerName: payload.customerName,
    dealer: dealerId,
    originalPurchasePrice: payload.originalPurchasePrice,
    remainingCoverageMonths: payload.remainingCoverageMonths,
    originalCoverageMonths: payload.originalCoverageMonths,
    refundAmount: calculateRefundAmount(payload),
    status: "draft",
  });
};

export const processMyCancellation = async (dealerId: string, cancellationId: string) => {
  if (!Types.ObjectId.isValid(cancellationId)) {
    throw new AppError(404, "Cancellation not found");
  }

  const existingCancellation = await cancellationRepository.findById(cancellationId);

  if (!existingCancellation || existingCancellation.dealer.toString() !== dealerId) {
    throw new AppError(404, "Cancellation not found");
  }

  if (existingCancellation.status === "processed") {
    throw new AppError(400, "Cancellation has already been processed");
  }

  const contract = await contractRepository.updateStatusByIdAndDealer(
    existingCancellation.contract.toString(),
    dealerId,
    "cancelled",
  );

  if (!contract) {
    throw new AppError(404, "Contract not found");
  }

  const processedCancellation = await cancellationRepository.processByIdAndDealer(
    cancellationId,
    dealerId,
  );

  if (!processedCancellation) {
    throw new AppError(404, "Cancellation not found");
  }

  return processedCancellation;
};
