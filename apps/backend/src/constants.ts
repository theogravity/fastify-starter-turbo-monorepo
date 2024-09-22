import { config } from "@dotenvx/dotenvx";
import { default as envVar } from "env-var";

config({
  quiet: true,
});

const env = envVar.from(process.env, {}, () => {});

export const SERVER_PORT = env.get("SERVER_PORT").default("3080").asPortNumber();
export const DB_HOST = env.get("DB_HOST").required().asString();
export const DB_PORT = env.get("DB_PORT").default("5432").asPortNumber();
export const DB_NAME = env.get("DB_NAME").required().asString();
export const DB_USER = env.get("DB_USER").required().asString();
export const DB_PASS = env.get("DB_PASS").required().asString();

export const IS_GENERATING_CLIENT = env.get("IS_GENERATING_CLIENT").default("false").asBoolStrict();
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";
export const BACKEND_LOG_LEVEL = env.get("BACKEND_LOG_LEVEL").default("debug").asString();
