import type { PlopTypes } from "@turbo/gen";

export function serviceGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("service", {
    description: "Generate a new service",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Service name (in PascalCase, e.g., UserProfiles):",
        validate: (input: string) => {
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return "Service name must be in PascalCase format (e.g., UserProfiles)";
          }
          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/services/{{kebabCase name}}.service.ts",
        templateFile: "templates/service/service.hbs",
      },
      // Update services/index.ts
      {
        type: "modify",
        path: "src/services/index.ts",
        pattern: /export interface Services {/,
        template: "export interface Services {\n  {{kebabCase name}}: {{name}}Service;",
      },
      {
        type: "modify",
        path: "src/services/index.ts",
        pattern: /import type {/,
        template: 'import type { {{name}}Service } from "./{{kebabCase name}}.service.js";\nimport type {',
      },
      // Update context.ts
      {
        type: "modify",
        path: "src/api-lib/context.ts",
        pattern: /\/\/ Do not remove this comment: service-import/,
        template:
          '// Do not remove this comment: service-import\nimport { {{name}}Service } from "@/services/{{kebabCase name}}.service.js";',
      },
      {
        type: "modify",
        path: "src/api-lib/context.ts",
        pattern: /\/\/ Do not remove this comment: service-init/,
        template:
          "// Do not remove this comment: service-init\n      {{kebabCase name}}: new {{name}}Service(serviceParams),",
      },
    ],
  });
}
