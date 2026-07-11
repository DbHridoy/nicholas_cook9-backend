import { model, Schema, type HydratedDocument, type Types } from "mongoose";
import { cancellationStatuses, type CancellationStatus } from "./cancellation.types.js";

export type Cancellation = {
  dealer: Types.ObjectId;
  customerName: string;
  originalPurchasePrice: number;
  remainingCoverageMonths: number;
  originalCoverageMonths: number;
  refundAmount: number;
  status: CancellationStatus;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const cancellationSchema = new Schema<Cancellation>(
  {
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    originalPurchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingCoverageMonths: {
      type: Number,
      required: true,
      min: 0,
    },
    originalCoverageMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: cancellationStatuses,
      default: "draft",
      index: true,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

cancellationSchema.index({ dealer: 1, createdAt: -1 });
cancellationSchema.index({ dealer: 1, status: 1, createdAt: -1 });

export type CancellationDocument = HydratedDocument<Cancellation> & {
  _id: Types.ObjectId;
};

export const Cancellation = model<Cancellation>("Cancellation", cancellationSchema);
