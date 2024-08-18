import { promises as fs } from "node:fs";
import path from "node:path";
import type { Migration, MigrationProvider } from "kysely";
import ts from "ts-node";

ts.register({
  transpileOnly: true,
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
      const { up, down } = await import(importPath);
      const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));

      migrations[migrationKey] = { up, down };
    }

    return migrations;
  }
}
