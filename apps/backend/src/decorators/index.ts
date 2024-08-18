import type { FastifyInstance } from "fastify";
import { contextDecorator } from "./context.decorator";

export async function decorators(fastify: FastifyInstance, _opts) {
  fastify.register(contextDecorator);
}
