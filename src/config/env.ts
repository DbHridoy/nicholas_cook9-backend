import "dotenv/config";
import { cleanEnv, num, str } from "envalid";

type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  MONGODB_URI: string;
  CORS_ORIGIN: string;
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
});

export const env: AppEnv = {
  NODE_ENV: cleanedEnv.NODE_ENV,
  PORT: cleanedEnv.PORT,
  LOG_LEVEL: cleanedEnv.LOG_LEVEL,
  MONGODB_URI: cleanedEnv.MONGODB_URI,
  CORS_ORIGIN: cleanedEnv.CORS_ORIGIN,
};
