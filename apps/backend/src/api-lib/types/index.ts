import { UserProviderTypeSchema } from "@/api-lib/types/enums.type.js";
import { UserProviderSchema } from "@/api-lib/types/user-provider.type.js";
import { UserSchema } from "@/api-lib/types/user.type.js";
import type { FastifyInstance } from "fastify";

export async function apiTypes(fastify: FastifyInstance) {
  fastify.addSchema(UserProviderTypeSchema);
  fastify.addSchema(UserSchema);
  fastify.addSchema(UserProviderSchema);
}
