import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "@/constants.js";
import type { Database } from "@/db/types/index.js";

export const kyselyDialect = new PostgresDialect({
  pool: new pg.Pool({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    port: DB_PORT,
    password: DB_PASS,
  }),
});

export const kyselyPlugins = [new CamelCasePlugin()];

export const db = new Kysely<Database>({
  dialect: kyselyDialect,
  plugins: kyselyPlugins,
});
