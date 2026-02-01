import { type Static, type TSchema, Type } from "typebox";

export const TypeRef = <T extends TSchema>(schema: T) =>
  Type.Unsafe<Static<T>>(Type.Ref((schema as { $id?: string }).$id as string));
