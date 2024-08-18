import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function decorator(fastify: FastifyInstance, _opts) {
  fastify.decorateRequest("userId", null);

  fastify.addHook("preHandler", async (request) => {
    // Items marked test- are not part of our normal headers, and is used
    // purely for mocking purposes.

    // @ts-ignore
    request.userId = request.headers["test-user-id"];
  });
}

export const testHeadersDecorator = fp(decorator);
