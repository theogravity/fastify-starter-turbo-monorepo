import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { LogLayer } from "loglayer";
import type { P } from "pino";
import { ApiContext } from "../api-lib/context";
import { db } from "../db";
import { removeQueryParametersFromPath } from "../utils/remove-query-params";

declare module "fastify" {
  interface FastifyRequest {
    ctx: ApiContext;
    userId: string;
  }
}

async function plugin(fastify: FastifyInstance, _opts) {
  fastify.addHook("onRequest", async (request) => {
    if (request.url) {
      // @ts-ignore
      request.log = request.log.withContext({
        apiPath: removeQueryParametersFromPath(request.url),
      });
    }

    request.ctx = new ApiContext({
      db,
      log: request.log as unknown as LogLayer<P.Logger>,
    });
  });
}

export const contextPlugin = fp(plugin);
