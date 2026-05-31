import type { QueryFilter, Types } from "mongoose";
import { Contract, type Contract as ContractEntity } from "./contract.model.js";

type CreateContractPayload = Pick<
  ContractEntity,
  "name" | "propertyAddress" | "installationDate" | "coveredProduct" | "term" | "price" | "file"
> & {
  dealer: string | Types.ObjectId;
};

export const contractRepository = {
  create(payload: CreateContractPayload) {
    return Contract.create(payload);
  },

  findById(id: string) {
    return Contract.findById(id);
  },

  findMany(filter: QueryFilter<ContractEntity> = {}) {
    return Contract.find(filter).sort({ createdAt: -1 });
  },
};
