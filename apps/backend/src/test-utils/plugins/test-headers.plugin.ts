import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function plugin(fastify: FastifyInstance, _opts) {
  fastify.decorateRequest("userId");

  fastify.addHook("preHandler", async (request) => {
    // Items marked test- are not part of our normal headers, and is used
    // purely for mocking purposes.

    // @ts-expect-error
    request.userId = request.headers["test-user-id"];
  });
}

export const testHeadersPlugin = fp(plugin);
