import type { FastifyInstance } from "fastify";

// Do not remove this comment: resource-imports

import { registerUserRoutes } from "@/api/users/index.js";

export async function registerResourceRoutes(fastify: FastifyInstance, _opts) {
  fastify.register(routes, { prefix: "/" });
}

async function routes(fastify: FastifyInstance) {
  // Do not remove this comment: resource-register

  fastify.register(registerUserRoutes);
}
