import { randomUUID } from "node:crypto";
import { isValidObjectId } from "mongoose";
import { AppError } from "../../shared/errors/app-error.js";
import { contractRepository } from "../contracts/contract.repository.js";
import { notificationRepository } from "../notifications/notification.repository.js";
import { userRepository } from "../users/user.repository.js";
import type { UserRole } from "../users/user.types.js";
import { claimRepository } from "./claim.repository.js";
import type { CreateClaimInput, UpdateClaimStatusInput } from "./claim.schemas.js";

type RequestUser = {
  id: string;
  role: UserRole;
};

const flooringTypeFromProduct = {
  carpet: "Carpet",
  lvp_laminate: "LVP / Laminate",
  hardwood: "Hardwood",
  tile: "Tile",
} as const;

const generateClaimId = () => `CLM-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

const findClaimByIdentifier = async (identifier: string) => {
  const claimByClaimId = await claimRepository.findByClaimId(identifier);

  if (claimByClaimId || !isValidObjectId(identifier)) {
    return claimByClaimId;
  }

  return claimRepository.findById(identifier);
};

const updateClaimStatusByIdentifier = async (
  identifier: string,
  status: UpdateClaimStatusInput["status"],
) => {
  const claimByClaimId = await claimRepository.updateStatusByClaimId(identifier, status);

  if (claimByClaimId || !isValidObjectId(identifier)) {
    return claimByClaimId;
  }

  return claimRepository.updateStatusById(identifier, status);
};

const createClaimNotifications = async (
  claim: Awaited<ReturnType<typeof claimRepository.create>>,
  dealerId: string,
) => {
  const admins = await userRepository.findMany({ role: { $in: ["admin", "super_admin"] } });
  const recipientIds = Array.from(new Set([dealerId, ...admins.map((user) => user._id.toString())]));

  await notificationRepository.createMany(
    recipientIds.map((recipient) => ({
      recipient,
      claim: claim._id,
      type: "claim_created" as const,
      title: "New claim submitted",
      message: `A new claim ${claim.claimId} was submitted for order ${claim.orderId} by ${claim.name}.`,
    })),
  );
};

export const createClaim = async (payload: CreateClaimInput, attachments: string[] = []) => {
  const contract = await contractRepository.findOne({ orderId: payload.orderId });

  if (!contract) {
    throw new AppError(404, "Order not found");
  }

  const claim = await claimRepository.create({
    claimId: generateClaimId(),
    ...payload,
    dealer: contract.dealer,
    flooringType: flooringTypeFromProduct[contract.coveredProduct],
    attachments,
  });

  await createClaimNotifications(claim, contract.dealer.toString());

  return claim;
};

export const listClaims = async (user: RequestUser) => {
  if (user.role !== "dealer") {
    return claimRepository.findMany();
  }

  return claimRepository.findMany({ dealer: user.id });
};

export const getClaim = async (claimId: string, user: RequestUser) => {
  const claim = await findClaimByIdentifier(claimId);

  if (!claim) {
    throw new AppError(404, "Claim not found");
  }

  if (user.role === "dealer") {
    if (claim.dealer.toString() !== user.id) {
      throw new AppError(404, "Claim not found");
    }
  }

  return claim;
};

export const updateClaimStatus = async (
  claimId: string,
  payload: UpdateClaimStatusInput,
  user: RequestUser,
) => {
  if (user.role === "dealer") {
    const existingClaim = await findClaimByIdentifier(claimId);

    if (!existingClaim || existingClaim.dealer.toString() !== user.id) {
      throw new AppError(404, "Claim not found");
    }
  }

  const claim = await updateClaimStatusByIdentifier(claimId, payload.status);

  if (!claim) {
    throw new AppError(404, "Claim not found");
  }

  return claim;
};
