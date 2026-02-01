import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { LogLayer } from "loglayer";
import { ApiContext } from "@/api-lib/context.js";
import { db } from "@/db/index.js";
import { removeQueryParametersFromPath } from "@/utils/remove-query-params.js";

declare module "fastify" {
  interface FastifyRequest {
    ctx: ApiContext;
    userId: string;
  }
}

async function plugin(fastify: FastifyInstance, _opts) {
  fastify.addHook("onRequest", async (request) => {
    if (request.url) {
      // @ts-expect-error
      request.log = request.log.withContext({
        apiPath: removeQueryParametersFromPath(request.url),
      });
    }

    request.ctx = new ApiContext({
      db,
      log: request.log as unknown as LogLayer,
    });
  });
}

export const contextPlugin = fp(plugin);
