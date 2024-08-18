import type { PlopTypes } from "@turbo/gen";

export function apiRouteGenerator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("api:route", {
    description: "Generates an API route",
    prompts: [
      {
        type: "input",
        name: "routeResource",
        message: "The resource folder name (e.g. users). This should be plural.",
      },
      {
        type: "list",
        name: "methodType",
        message: "HTTP method type",
        choices: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      },
      {
        type: "input",
        name: "routePath",
        message: "Route path (e.g. /noun or /:id)",
      },
      {
        type: "input",
        name: "operationName",
        message: "Operation name (e.g. createUser)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/{{routeResource}}/{{ dashCase operationName }}.ts",
        templateFile: "templates/api-route/operation.hbs",
      },
      {
        type: "add",
        // apps/backend/src/api/users/index.ts
        path: "{{ turbo.paths.root }}/apps/backend/src/api/{{routeResource}}/index.ts",
        templateFile: "templates/api-route/resource-registration.hbs",
        skipIfExists: true,
      },
      {
        type: "append",
        pattern: "route-imports",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/{{routeResource}}/index.ts",
        template: `import { {{ operationName }}Route } from "./{{ dashCase operationName }}";`,
      },
      {
        type: "append",
        pattern: "route-register",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/{{routeResource}}/index.ts",
        template: "  fastify.register({{ operationName }}Route);",
      },
      {
        type: "append",
        pattern: "resource-imports",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/routes.ts",
        template: 'import { register{{ properCase routeResource }}Routes } from "./{{routeResource}}";',
        unique: true,
      },
      // There's some kind of bug where unique: true
      // isn't working as expected, so we have to manually make sure to not
      // add in a duplicate line
      {
        type: "modify",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/routes.ts",
        transform: (fileContent, data) => {
          const templateString = `  fastify.register(register${plop.renderString("{{ properCase routeResource }}", data)}Routes);`;
          if (fileContent.includes(templateString)) {
            return fileContent; // If template string already exists, return unchanged content
          }
          const lines = fileContent.split("\n");
          const patternIndex = lines.findIndex((line) => line.includes("resource-register"));
          if (patternIndex !== -1) {
            lines.splice(patternIndex + 1, 0, templateString);
            return lines.join("\n");
          }
          return fileContent; // If pattern not found, return unchanged content
        },
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/backend/src/api/{{routeResource}}/__tests__/{{ dashCase operationName }}.test.ts",
        templateFile: "templates/api-route/api-test.hbs",
      },
    ],
  });
}
