import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { stringify } from "yaml";
import routes from "../src/api/index.js";
import { ajvPlugins } from "../src/api-lib/ajv-plugins.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const fastifyOptions: any = {
  ajv: {
    plugins: ajvPlugins,
  },
};

const fastify = Fastify(fastifyOptions);

await fastify.register(fp(routes));
await fastify.ready();

if (fastify.swagger === null || fastify.swagger === undefined) {
  throw new Error("@fastify/swagger plugin is not loaded");
}

console.log("Generating backend-client OpenAPI schema...");

const schema = stringify(fastify.swagger());
await writeFile(path.join(__dirname, "..", "..", "..", "packages", "backend-client", "openapi.yml"), schema, {
  flag: "w+",
});

await fastify.close();

console.log("Generation of backend-client OpenAPI schema completed.");
