import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function plugin(fastify: FastifyInstance, _opts) {
  fastify.addHook("onRequest", (request, _reply, done) => {
    // Because we're running a server in a test environment, if we want to enable logging
    // we need to set a header to enable it.
    if (request.headers["test-logging-enabled"] === "true") {
      request.ctx.log.enableLogging();
      request.log.enableLogging();
      fastify.log.enableLogging();
    }
    done();
  });
}

export const enableTestLoggerPlugin = fp(plugin);
