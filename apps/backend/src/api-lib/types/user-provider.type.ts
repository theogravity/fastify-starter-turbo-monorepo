import { UserProviderTypeSchema } from "@/api-lib/types/enums.type.js";
import { type Static, Type } from "@sinclair/typebox";

export const UserProviderSchema = Type.Object(
  {
    userId: Type.String({
      description: "ID of the user",
      format: "uuid",
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
