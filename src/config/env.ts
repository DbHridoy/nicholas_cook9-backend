import "dotenv/config";
import { bool, cleanEnv, num, str } from "envalid";

type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  MONGODB_URI: string;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES: number;
  PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES: number;
  SUPER_ADMIN_NAME: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  EMAIL_FROM: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_PUBLIC_BASE_URL: string;
  S3_DOCUMENTS_PREFIX: string;
  S3_MAX_DOCUMENT_SIZE_MB: number;
};

const cleanedEnv = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  PORT: num({ default: 5200 }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    default: "info",
  }),
  MONGODB_URI: str({
    default: "mongodb://127.0.0.1:27017/nicholas_cook9",
  }),
  CORS_ORIGIN: str({ default: "*" }),
  JWT_SECRET: str({ default: "replace-this-with-a-long-random-secret" }),
  JWT_ACCESS_EXPIRES_IN: str({ default: "1d" }),
  JWT_REFRESH_EXPIRES_IN: str({ default: "30d" }),
  PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES: num({ default: 10 }),
  PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES: num({ default: 10 }),
  SUPER_ADMIN_NAME: str({ default: "Super Admin" }),
  SUPER_ADMIN_EMAIL: str({ default: "admin@example.com" }),
  SUPER_ADMIN_PASSWORD: str({ default: "ChangeMe123!" }),
  EMAIL_FROM: str({ default: "Nicholas Cook9 <no-reply@example.com>" }),
  SMTP_HOST: str({ default: "" }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str({ default: "" }),
  SMTP_PASS: str({ default: "" }),
  AWS_REGION: str({ default: "" }),
  AWS_ACCESS_KEY_ID: str({ default: "" }),
  AWS_SECRET_ACCESS_KEY: str({ default: "" }),
  S3_BUCKET_NAME: str({ default: "" }),
  S3_PUBLIC_BASE_URL: str({ default: "" }),
  S3_DOCUMENTS_PREFIX: str({ default: "documents" }),
  S3_MAX_DOCUMENT_SIZE_MB: num({ default: 10 }),
});

export const env: AppEnv = {
  NODE_ENV: cleanedEnv.NODE_ENV,
  PORT: cleanedEnv.PORT,
  LOG_LEVEL: cleanedEnv.LOG_LEVEL,
  MONGODB_URI: cleanedEnv.MONGODB_URI,
  CORS_ORIGIN: cleanedEnv.CORS_ORIGIN,
  JWT_SECRET: cleanedEnv.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: cleanedEnv.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: cleanedEnv.JWT_REFRESH_EXPIRES_IN,
  PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES: cleanedEnv.PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES,
  PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES: cleanedEnv.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES,
  SUPER_ADMIN_NAME: cleanedEnv.SUPER_ADMIN_NAME,
  SUPER_ADMIN_EMAIL: cleanedEnv.SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD: cleanedEnv.SUPER_ADMIN_PASSWORD,
  EMAIL_FROM: cleanedEnv.EMAIL_FROM,
  SMTP_HOST: cleanedEnv.SMTP_HOST,
  SMTP_PORT: cleanedEnv.SMTP_PORT,
  SMTP_SECURE: cleanedEnv.SMTP_SECURE,
  SMTP_USER: cleanedEnv.SMTP_USER,
  SMTP_PASS: cleanedEnv.SMTP_PASS,
  AWS_REGION: cleanedEnv.AWS_REGION,
  AWS_ACCESS_KEY_ID: cleanedEnv.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: cleanedEnv.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: cleanedEnv.S3_BUCKET_NAME,
  S3_PUBLIC_BASE_URL: cleanedEnv.S3_PUBLIC_BASE_URL,
  S3_DOCUMENTS_PREFIX: cleanedEnv.S3_DOCUMENTS_PREFIX,
  S3_MAX_DOCUMENT_SIZE_MB: cleanedEnv.S3_MAX_DOCUMENT_SIZE_MB,
};
