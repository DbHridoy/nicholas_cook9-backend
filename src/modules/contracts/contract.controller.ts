import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type { CreateContractInput } from "./contract.schemas.js";
import * as contractService from "./contract.service.js";

export const createContract: RequestHandler = asyncHandler(async (req, res) => {
  const contract = await contractService.createContract(
    req.body as CreateContractInput,
    req.user!.id,
  );

  res.status(201).json({
    success: true,
    message: "Contract created successfully",
    data: { contract },
  });
});

export const listContracts: RequestHandler = asyncHandler(async (req, res) => {
  const contracts = await contractService.listContracts(req.user!);

  res.status(200).json({
    success: true,
    message: "Contracts retrieved successfully",
    data: { contracts },
  });
});

export const getContract: RequestHandler = asyncHandler(async (req, res) => {
  const contract = await contractService.getContract(String(req.params.contractId), req.user!);

  res.status(200).json({
    success: true,
    message: "Contract retrieved successfully",
    data: { contract },
  });
});
