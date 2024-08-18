import type { FastifyInstance } from "fastify";
import { contextDecorator } from "../../decorators/context.decorator";
import { enableTestLoggerDecorator } from "./enable-test-logger.decorator";
import { testHeadersDecorator } from "./test-headers.decorators";

export async function testDecorators(fastify: FastifyInstance, _opts) {
  fastify.register(enableTestLoggerDecorator);
  fastify.register(contextDecorator);
  fastify.register(testHeadersDecorator);
}
