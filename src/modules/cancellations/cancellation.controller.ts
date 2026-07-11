import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import type { CreateCancellationInput } from "./cancellation.schemas.js";
import * as cancellationService from "./cancellation.service.js";

export const listMyCancellations: RequestHandler = asyncHandler(async (req, res) => {
  const cancellations = await cancellationService.listMyCancellations(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Cancellations retrieved successfully",
    data: { cancellations },
  });
});

export const createMyCancellation: RequestHandler = asyncHandler(async (req, res) => {
  const cancellation = await cancellationService.createMyCancellation(
    req.user!.id,
    req.body as CreateCancellationInput,
  );

  res.status(201).json({
    success: true,
    message: "Cancellation quote created successfully",
    data: { cancellation },
  });
});

export const processMyCancellation: RequestHandler = asyncHandler(async (req, res) => {
  const cancellation = await cancellationService.processMyCancellation(
    req.user!.id,
    String(req.params.cancellationId),
  );

  res.status(200).json({
    success: true,
    message: "Cancellation processed successfully",
    data: { cancellation },
  });
});
