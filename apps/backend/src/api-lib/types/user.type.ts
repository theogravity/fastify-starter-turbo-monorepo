import { type Static, Type } from "typebox";

export const UserSchema = Type.Object(
  {
    id: Type.String({
      description: "ID of the user",
      format: "uuid",
    }),
    givenName: Type.String({
      description: "Given name of the user",
    }),
    familyName: Type.String({
      description: "Family name of the user",
    }),
  },
  {
    $id: "User",
  },
);

export type User = Static<typeof UserSchema>;
