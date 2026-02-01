import { Type } from "typebox";
import { UserProviderType } from "@/db/types/user-providers.db-types.js";

// Don't use Type.Enum. You won't get proper typescript types in
// the client generation or Swagger UI.
export const UserProviderTypeSchema = Type.String({
  $id: "UserProviderType",
  enum: Object.values(UserProviderType),
  title: "Auth provider type",
  description: "The type of the auth provider",
});
