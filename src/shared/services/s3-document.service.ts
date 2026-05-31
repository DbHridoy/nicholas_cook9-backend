import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

type UploadedDocument = {
  key: string;
  url: string;
};

let s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new AppError(500, "S3 storage is not configured");
  }

  s3Client ??= new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return s3Client;
};

const sanitizeFileName = (fileName: string) =>
  path
    .basename(fileName)
    .replaceAll(/[^a-zA-Z0-9._-]/g, "-")
    .replaceAll(/-+/g, "-")
    .slice(0, 120);

const buildPublicUrl = (key: string) => {
  if (env.S3_PUBLIC_BASE_URL) {
    return `${env.S3_PUBLIC_BASE_URL.replace(/\/+$/u, "")}/${key}`;
  }

  return `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

const getAwsErrorStatusCode = (error: unknown) => {
  if (!error || typeof error !== "object" || !("$metadata" in error)) {
    return undefined;
  }

  const metadata = error.$metadata;
  if (!metadata || typeof metadata !== "object" || !("httpStatusCode" in metadata)) {
    return undefined;
  }

  return typeof metadata.httpStatusCode === "number" ? metadata.httpStatusCode : undefined;
};

export const uploadDocumentToS3 = async (file: Express.Multer.File): Promise<UploadedDocument> => {
  if (!env.S3_BUCKET_NAME) {
    throw new AppError(500, "S3 bucket is not configured");
  }

  const prefix = env.S3_DOCUMENTS_PREFIX.replace(/^\/+|\/+$/gu, "") || "documents";
  const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${sanitizeFileName(
    file.originalname,
  )}`;

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );
  } catch (error) {
    const statusCode = getAwsErrorStatusCode(error);

    logger.error({ error, bucket: env.S3_BUCKET_NAME, region: env.AWS_REGION }, "S3 upload failed");

    if (statusCode === 301) {
      throw new AppError(502, "Document upload failed because the S3 bucket region is incorrect");
    }

    if (statusCode === 403) {
      throw new AppError(502, "Document upload failed because S3 access was denied");
    }

    throw new AppError(502, "Document upload failed");
  }

  return {
    key,
    url: buildPublicUrl(key),
  };
};

export const uploadDocumentsToS3 = async (
  files: Express.Multer.File[],
): Promise<UploadedDocument[]> => Promise.all(files.map(uploadDocumentToS3));
