import type { FastifyInstance } from "fastify";
import { contextPlugin } from "./context.plugin";

export async function plugins(fastify: FastifyInstance, _opts) {
  fastify.register(contextPlugin);
}