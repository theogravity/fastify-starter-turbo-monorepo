import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import type { Migration, MigrationProvider } from "kysely";

const moduleFileUrl = import.meta.url;

// Create a jiti instance that can resolve path aliases
const jitiInstance = createJiti(fileURLToPath(moduleFileUrl), {
  interopDefault: true,
  alias: { "@": fileURLToPath(new URL("./src", moduleFileUrl)) },
});

export class TypeScriptFileMigrationProvider implements MigrationProvider {
  constructor(private absolutePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await fs.readdir(this.absolutePath);

    for (const fileName of files) {
      if (!fileName.endsWith(".ts")) {
        continue;
      }

      const importPath = path.join(this.absolutePath, fileName).replaceAll("\\", "/");
      // Use jiti to resolve and import the migration file
      const { up, down } = jitiInstance(importPath);
      const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));

      migrations[migrationKey] = { up, down };
    }

    return migrations;
  }
}
