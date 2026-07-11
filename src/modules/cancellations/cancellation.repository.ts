import type { QueryFilter, Types } from "mongoose";
import { Cancellation, type Cancellation as CancellationEntity } from "./cancellation.model.js";

type CreateCancellationPayload = Pick<
  CancellationEntity,
  | "customerName"
  | "originalPurchasePrice"
  | "remainingCoverageMonths"
  | "originalCoverageMonths"
  | "refundAmount"
  | "status"
> & {
  dealer: string | Types.ObjectId;
};

export const cancellationRepository = {
  create(payload: CreateCancellationPayload) {
    return Cancellation.create(payload);
  },

  findMany(filter: QueryFilter<CancellationEntity> = {}) {
    return Cancellation.find(filter).sort({ createdAt: -1 });
  },

  findById(id: string) {
    return Cancellation.findById(id);
  },

  processByIdAndDealer(id: string, dealer: string | Types.ObjectId) {
    return Cancellation.findOneAndUpdate(
      {
        _id: id,
        dealer,
        status: "draft",
      },
      {
        $set: {
          status: "processed",
          processedAt: new Date(),
        },
      },
      { new: true },
    );
  },
};
