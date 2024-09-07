import type { FastifyInstance } from "fastify";
import { contextPlugin } from "../../plugins/context.plugin";
import { testHeadersPlugin } from "./test-headers.plugin";

export async function testPlugins(fastify: FastifyInstance, _opts) {
  fastify.register(contextPlugin);
  fastify.register(testHeadersPlugin);
}
