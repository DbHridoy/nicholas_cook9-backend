import { model, Schema, type HydratedDocument, type Types } from "mongoose";
import {
  contractTerms,
  coveredProducts,
  type ContractTerm,
  type CoveredProduct,
} from "./contract.types.js";

export type Contract = {
  dealer: Types.ObjectId;
  name: string;
  propertyAddress: string;
  installationDate: Date;
  coveredProduct: CoveredProduct;
  term: ContractTerm;
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
    installationDate: {
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
