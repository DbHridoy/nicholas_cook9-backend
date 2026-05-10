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
});

export const env: AppEnv = {
  NODE_ENV: cleanedEnv.NODE_ENV,
  PORT: cleanedEnv.PORT,
  LOG_LEVEL: cleanedEnv.LOG_LEVEL,
  MONGODB_URI: cleanedEnv.MONGODB_URI,
  CORS_ORIGIN: cleanedEnv.CORS_ORIGIN,
  JWT_SECRET: cleanedEnv.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: cleanedEnv.JWT_ACCESS_EXPIRES_IN,
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
};
