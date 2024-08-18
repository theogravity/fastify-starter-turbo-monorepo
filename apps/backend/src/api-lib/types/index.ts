import type { FastifyInstance } from "fastify";
import { UserProviderTypeSchema } from "./enums.type";
import { UserProviderSchema } from "./user-provider.type";
import { UserSchema } from "./user.type";

export async function apiTypes(fastify: FastifyInstance) {
  fastify.addSchema(UserProviderTypeSchema);
  fastify.addSchema(UserSchema);
  fastify.addSchema(UserProviderSchema);
}
