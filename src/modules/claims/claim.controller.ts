import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type { CreateClaimInput, UpdateClaimStatusInput } from "./claim.schemas.js";
import * as claimService from "./claim.service.js";

export const createClaim: RequestHandler = asyncHandler(async (req, res) => {
  const claim = await claimService.createClaim(req.body as CreateClaimInput);

  res.status(201).json({
    success: true,
    message: "Claim submitted successfully",
    data: { claim },
  });
});

export const listClaims: RequestHandler = asyncHandler(async (_req, res) => {
  const claims = await claimService.listClaims();

  res.status(200).json({
    success: true,
    message: "Claims retrieved successfully",
    data: { claims },
  });
});

export const getClaim: RequestHandler = asyncHandler(async (req, res) => {
  const claim = await claimService.getClaim(String(req.params.claimId));

  res.status(200).json({
    success: true,
    message: "Claim retrieved successfully",
    data: { claim },
  });
});

export const updateClaimStatus: RequestHandler = asyncHandler(async (req, res) => {
  const claim = await claimService.updateClaimStatus(
    String(req.params.claimId),
    req.body as UpdateClaimStatusInput,
  );

  res.status(200).json({
    success: true,
    message: "Claim status updated successfully",
    data: { claim },
  });
});
