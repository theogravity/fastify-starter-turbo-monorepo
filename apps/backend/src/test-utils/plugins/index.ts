import type { FastifyInstance } from "fastify";
import { contextPlugin } from "@/plugins/context.plugin.js";
import { enableTestLoggerPlugin } from "./enable-test-logger.plugin.js";
import { testHeadersPlugin } from "./test-headers.plugin.js";

export async function testPlugins(fastify: FastifyInstance, _opts) {
  fastify.register(contextPlugin);
  fastify.register(enableTestLoggerPlugin);
  fastify.register(testHeadersPlugin);
}
