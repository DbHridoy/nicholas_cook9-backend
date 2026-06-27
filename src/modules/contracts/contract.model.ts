import { model, Schema, type HydratedDocument, type Types } from "mongoose";
import {
  contractTerms,
  coveredProducts,
  type ContractTerm,
  type CoveredProduct,
} from "./contract.types.js";

export type Contract = {
  dealer: Types.ObjectId;
  orderId: string;
  name: string;
  propertyAddress: string;
  saleDate: Date;
  coveredProduct: CoveredProduct;
  term: ContractTerm;
  expiry: Date;
  price: number;
  file: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const contractSchema = new Schema<Contract>(
  {
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    propertyAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    coveredProduct: {
      type: String,
      enum: coveredProducts,
      required: true,
      index: true,
    },
    term: {
      type: String,
      enum: contractTerms,
      required: true,
      index: true,
    },
    expiry: {
      type: Date,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    file: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type ContractDocument = HydratedDocument<Contract> & {
  _id: Types.ObjectId;
};

export const Contract = model<Contract>("Contract", contractSchema);
