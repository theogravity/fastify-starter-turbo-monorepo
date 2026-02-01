import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { type Static, Type } from "typebox";
import { UserSchema } from "@/api-lib/types/user.type.js";
import { UserProviderSchema } from "@/api-lib/types/user-provider.type.js";
import { UserProviderType } from "@/db/types/user-providers.db-types.js";
import { TypeRef } from "@/types.js";

const CreateEMailUserRequestSchema = Type.Object(
  {
    givenName: Type.String({
      minLength: 1,
      maxLength: 50,
    }),
    familyName: Type.String({
      minLength: 1,
      maxLength: 100,
    }),
    email: Type.String({
      minLength: 3,
      maxLength: 255,
      format: "email",
    }),
    password: Type.String({
      minLength: 8,
      maxLength: 64,
    }),
  },
  { $id: "CreateEMailUserRequest" },
);

export type CreateEMailUserRequest = Static<typeof CreateEMailUserRequestSchema>;

const CreateEMailUserResponseSchema = Type.Object(
  {
    user: TypeRef(UserSchema),
    provider: TypeRef(UserProviderSchema),
  },
  { $id: "CreateEMailUserResponse" },
);

export type CreateEMailUserResponse = Static<typeof CreateEMailUserResponseSchema>;

export async function createEMailUserRoute(fastify: FastifyInstance) {
  fastify.addSchema(CreateEMailUserRequestSchema);
  fastify.addSchema(CreateEMailUserResponseSchema);

  fastify.post(
    "/email",
    {
      schema: {
        operationId: "createEMailUser",
        tags: ["user"],
        description: "Create an e-mail-based account",
        body: Type.Ref("CreateEMailUserRequest"),
        response: {
          "200": Type.Ref("CreateEMailUserResponse"),
        },
      },
    },
    createEMailUserController,
  );
}

export async function createEMailUserController(
  request: FastifyRequest<{
    Body: CreateEMailUserRequest;
  }>,
  reply: FastifyReply,
) {
  const { familyName, givenName, password, email } = request.body;

  request.log.info(`Creating e-mail user: ${email}`);

  const user = await request.ctx.services.users.createEMailUser({
    user: {
      givenName,
      familyName,
    },
    email,
    password,
  });

  const response: CreateEMailUserResponse = {
    user: {
      id: user.id,
      givenName: user.givenName,
      familyName: user.familyName,
    },
    provider: {
      userId: user.id,
      providerType: UserProviderType.EMail,
      accountId: email,
    },
  };

  reply.send(response);
}
