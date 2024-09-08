import type { FastifyInstance } from "fastify";
import { contextPlugin } from "../../plugins/context.plugin";
import { enableTestLoggerPlugin } from "./enable-test-logger.plugin";
import { testHeadersPlugin } from "./test-headers.plugin";

export async function testPlugins(fastify: FastifyInstance, _opts) {
  fastify.register(enableTestLoggerPlugin);
  fastify.register(contextPlugin);
  fastify.register(testHeadersPlugin);
}
