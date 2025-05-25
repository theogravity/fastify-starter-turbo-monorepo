import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import { defineConfig } from 'kysely-ctl';

const moduleFileUrl = import.meta.url;

// Use `jiti` to dynamically import the Kysely configuration
// This allows us to use ES modules and TypeScript without needing to compile them beforehand
const jiti = createJiti(fileURLToPath(moduleFileUrl), {
  interopDefault: true,
  alias: { '@': fileURLToPath(new URL('./src', moduleFileUrl)) },
});

const { kyselyDialect, kyselyPlugins, db } = jiti('./src/db/index.js');

export default defineConfig({
  kysely: db,
  dialect: kyselyDialect,
  migrations: {
    migrationFolder: "src/db/migrations",
  },
  plugins: kyselyPlugins,
  seeds: {
    seedFolder: "src/db/seeds"
  }
});
