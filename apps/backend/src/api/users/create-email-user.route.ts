import { type Static, Type } from "@sinclair/typebox";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserProviderSchema } from "../../api-lib/types/user-provider.type";
import { UserSchema } from "../../api-lib/types/user.type";
import { UserProviderType } from "../../db/types/user-providers.db-types";

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
    user: Type.Ref(UserSchema),
    provider: Type.Ref(UserProviderSchema),
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
        body: Type.Ref(CreateEMailUserRequestSchema),
        response: {
          "200": Type.Ref(CreateEMailUserResponseSchema),
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
