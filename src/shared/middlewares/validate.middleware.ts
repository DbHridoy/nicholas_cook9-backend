import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/app-error.js";

export const validateBody =
  (schema: ZodSchema): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ");
      next(new AppError(400, message));
      return;
    }

    req.body = parsed.data;
    next();
  };
