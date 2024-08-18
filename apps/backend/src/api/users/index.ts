import type { FastifyInstance } from "fastify";
import { createEMailUserRoute } from "./create-email-user.route";

// Do not remove this comment: route-imports

export async function registerUserRoutes(fastify: FastifyInstance, _opts) {
  fastify.register(userRoutes, { prefix: "/users" });
}

async function userRoutes(fastify: FastifyInstance) {
  // Do not remove this comment: route-register

  fastify.register(createEMailUserRoute);
}
