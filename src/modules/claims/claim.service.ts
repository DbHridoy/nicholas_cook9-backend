import { AppError } from "../../shared/errors/app-error.js";
import { claimRepository } from "./claim.repository.js";
import type { CreateClaimInput, UpdateClaimStatusInput } from "./claim.schemas.js";

export const createClaim = (payload: CreateClaimInput) => claimRepository.create(payload);

export const listClaims = () => claimRepository.findMany();

export const getClaim = async (claimId: string) => {
  const claim = await claimRepository.findById(claimId);

  if (!claim) {
    throw new AppError(404, "Claim not found");
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
