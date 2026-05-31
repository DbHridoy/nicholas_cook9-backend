import type { QueryFilter } from "mongoose";
import { Claim, type Claim as ClaimEntity } from "./claim.model.js";
import type { ClaimStatus } from "./claim.types.js";

type CreateClaimPayload = Pick<
  ClaimEntity,
  "name" | "email" | "orderId" | "flooringType" | "description"
>;

export const claimRepository = {
  create(payload: CreateClaimPayload) {
    return Claim.create(payload);
  },

  findById(id: string) {
    return Claim.findById(id);
  },

  findMany(filter: QueryFilter<ClaimEntity> = {}) {
    return Claim.find(filter).sort({ createdAt: -1 });
  },

  updateStatus(id: string, status: Exclude<ClaimStatus, "pending">) {
    return Claim.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    );
  },
};
