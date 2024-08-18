import { Type } from "@sinclair/typebox";
import { UserProviderType } from "../../db/types/user-providers.db-types";

export const UserProviderTypeSchema = Type.String({
  $id: "UserProviderType",
  enum: Object.values(UserProviderType),
  title: "Auth provider type",
  description: "The type of the auth provider",
});
