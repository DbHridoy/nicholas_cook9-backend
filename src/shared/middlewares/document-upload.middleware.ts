import multer from "multer";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

const allowedDocumentMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.S3_MAX_DOCUMENT_SIZE_MB * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedDocumentMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, "Only PDF, Word, JPG, PNG, and WebP documents are allowed"));
      return;
    }

    callback(null, true);
  },
});
