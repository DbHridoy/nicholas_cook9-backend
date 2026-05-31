import { model, Schema, type HydratedDocument, type Types } from "mongoose";
import { claimStatuses, type ClaimStatus } from "./claim.types.js";

export type Claim = {
  claimId: string;
  dealer: Types.ObjectId;
  name: string;
  email: string;
  orderId: string;
  flooringType: string;
  description: string;
  attachments: string[];
  status: ClaimStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

const claimSchema = new Schema<Claim>(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 120,
    },
    flooringType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: claimStatuses,
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type ClaimDocument = HydratedDocument<Claim> & {
  _id: Types.ObjectId;
};

export const Claim = model<Claim>("Claim", claimSchema);
