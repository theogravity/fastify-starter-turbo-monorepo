import { type Static, Type } from "@sinclair/typebox";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { sanitizeKeyword } from "../../api-lib/keywords/sanitize.keyword";
import { UserProviderSchema } from "../../api-lib/types/user-provider.type";
import { UserSchema } from "../../api-lib/types/user.type";
import { UserProviderType } from "../../db/types/user-providers.db-types";

const CreateEMailUserRequest = Type.Object(
  {
    givenName: Type.String({
      minLength: 1,
      maxLength: 50,
      ...sanitizeKeyword(),
    }),
    familyName: Type.String({
      minLength: 1,
      maxLength: 100,
      ...sanitizeKeyword(),
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

const CreateEMailUserResponse = Type.Object(
  {
    user: Type.Ref(UserSchema),
    provider: Type.Ref(UserProviderSchema),
  },
  { $id: "CreateEMailUserResponse" },
);

export async function createEMailUserRoute(fastify: FastifyInstance) {
  fastify.addSchema(CreateEMailUserRequest);
  fastify.addSchema(CreateEMailUserResponse);

  fastify.post(
    "/email",
    {
      schema: {
        operationId: "createEMailUser",
        tags: ["user"],
        description: "Create an e-mail-based account",
        body: Type.Ref(CreateEMailUserRequest),
        response: {
          "200": Type.Ref(CreateEMailUserResponse),
        },
      },
    },
    createEMailUserController,
  );
}

export async function createEMailUserController(
  request: FastifyRequest<{
    Body: Static<typeof CreateEMailUserRequest>;
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

  const response: Static<typeof CreateEMailUserResponse> = {
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
