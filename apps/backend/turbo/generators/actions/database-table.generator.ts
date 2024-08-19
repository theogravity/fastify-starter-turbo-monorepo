import type { PlopTypes } from "@turbo/gen";

const isSingularCamelCase = (input: string): boolean => {
  const camelCaseCheck = /^[a-z][a-zA-Z0-9]*$/;
  // Simple heuristic for singular words: check if the word ends in 's'
  const isSingular = !input.endsWith("s");
  return camelCaseCheck.test(input) && isSingular;
};

export function databaseTableGenerator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("db:table", {
    description: "Generates a database table",
    prompts: [
      {
        type: "input",
        name: "tableName",
        message: "The table name (e.g. user or userAccount). This should be singular and camel-cased.",
        validate: (input) => {
          if (isSingularCamelCase(input)) {
            return true;
          }
          return "Table name must be singular and camel-cased.";
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/repositories/{{dashCase tableName}}s.repository.ts",
        templateFile: "templates/database-table/repository.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/types/{{dashCase tableName}}s.db-types.ts",
        templateFile: "templates/database-table/db-types.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/migrations/{{timestamp}}-create-{{dashCase tableName}}s-table.ts",
        templateFile: "templates/database-table/migration.hbs",
      },
      {
        type: "append",
        pattern: "database-table-import",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/types/index.ts",
        template: `import type { {{properCase tableName}}sTable } from "./{{dashCase tableName}}s.db-types";`,
      },
      {
        type: "append",
        pattern: "database-table-interface",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/types/index.ts",
        template: "  {{ tableName }}s: {{ properCase tableName }}sTable;",
      },
      {
        type: "append",
        pattern: "database-table-import",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/repositories/index.ts",
        template: `import type { {{properCase tableName}}sRepository } from "./{{dashCase tableName}}s.repository";`,
      },
      {
        type: "append",
        pattern: "database-table-repository",
        path: "{{ turbo.paths.root }}/apps/backend/src/db/repositories/index.ts",
        template: "  {{ tableName }}s: {{ properCase tableName }}sRepository;",
      },
      {
        type: "append",
        pattern: "repository-import",
        path: "{{ turbo.paths.root }}/apps/backend/src/api-lib/context.ts",
        template: `import { {{ properCase tableName }}sRepository } from "../db/repositories/{{dashCase tableName}}s.repository";`,
      },
      {
        type: "append",
        pattern: "database-table-repository",
        path: "{{ turbo.paths.root }}/apps/backend/src/api-lib/context.ts",
        template: "        {{ tableName }}s: new {{ properCase tableName }}sRepository(params),",
      },
    ],
  });
}
