import { AppError } from "../../shared/errors/app-error.js";
import { contractRepository } from "../contracts/contract.repository.js";
import type { UserRole } from "../users/user.types.js";
import { claimRepository } from "./claim.repository.js";
import type { CreateClaimInput, UpdateClaimStatusInput } from "./claim.schemas.js";

type RequestUser = {
  id: string;
  role: UserRole;
};

export const createClaim = (payload: CreateClaimInput) => claimRepository.create(payload);

export const listClaims = async (user: RequestUser) => {
  if (user.role !== "dealer") {
    return claimRepository.findMany();
  }

  const contracts = await contractRepository.findMany({ dealer: user.id });
  const orderIds = contracts.map((contract) => contract.orderId).filter(Boolean);

  if (orderIds.length === 0) {
    return [];
  }

  return claimRepository.findMany({ orderId: { $in: orderIds } });
};

export const getClaim = async (claimId: string, user: RequestUser) => {
  const claim = await claimRepository.findById(claimId);

  if (!claim) {
    throw new AppError(404, "Claim not found");
  }

  if (user.role === "dealer") {
    const contract = await contractRepository.findOne({ dealer: user.id, orderId: claim.orderId });

    if (!contract) {
      throw new AppError(404, "Claim not found");
    }
  }

  return claim;
};

export const updateClaimStatus = async (claimId: string, payload: UpdateClaimStatusInput) => {
  const claim = await claimRepository.updateStatus(claimId, payload.status);

  if (!claim) {
    throw new AppError(404, "Claim not found");
  }

  return claim;
};
