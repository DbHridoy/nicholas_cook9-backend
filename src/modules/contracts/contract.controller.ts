import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error.js";
import { uploadDocumentToS3 } from "../../shared/services/s3-document.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type { CreateContractInput } from "./contract.schemas.js";
import * as contractService from "./contract.service.js";

export const createContract: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as CreateContractInput;

  if (req.file) {
    const uploadedDocument = await uploadDocumentToS3(req.file);
    payload.file = uploadedDocument.url;
  }

  if (!payload.file) {
    throw new AppError(400, "Contract document is required");
  }

  const contract = await contractService.createContract(
    payload as CreateContractInput & { file: string },
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
