import { type Static, Type } from "@sinclair/typebox";
import { UserProviderTypeSchema } from "./enums.type";

export const UserProviderSchema = Type.Object(
  {
    userId: Type.String({
      description: "ID of the user",
    }),
    providerType: UserProviderTypeSchema,
    accountId: Type.String({
      description: "The account id associated with the provider",
    }),
  },
  {
    $id: "UserProvider",
  },
);

export type UserProvider = Static<typeof UserProviderSchema>;
