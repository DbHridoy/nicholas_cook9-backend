import { AppError } from "../../shared/errors/app-error.js";
import { contractRepository } from "./contract.repository.js";
import type { CreateContractInput } from "./contract.schemas.js";
import type { UserRole } from "../users/user.types.js";

type RequestUser = {
  id: string;
  role: UserRole;
};

export const createContract = (payload: CreateContractInput, dealerId: string) =>
  contractRepository.create({
    ...payload,
    dealer: dealerId,
  });

export const listContracts = (user: RequestUser) =>
  contractRepository.findMany(user.role === "dealer" ? { dealer: user.id } : {});

export const getContract = async (contractId: string, user: RequestUser) => {
  const contract = await contractRepository.findById(contractId);

  if (!contract) {
    throw new AppError(404, "Contract not found");
  }

  if (user.role === "dealer" && contract.dealer.toString() !== user.id) {
    throw new AppError(404, "Contract not found");
  }

  return contract;
};
