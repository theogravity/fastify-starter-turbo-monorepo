
import { defineConfig } from "kysely-ctl";
import { kyselyDialect, kyselyPlugins } from "./src/db";

export default defineConfig({
  dialect: kyselyDialect,
  migrations: {
    migrationFolder: "src/db/migrations",
  },
  plugins: kyselyPlugins,
  seeds: {
    seedFolder: "src/db/seeds"
  }
});
