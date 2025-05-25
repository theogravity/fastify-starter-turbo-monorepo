import { type Static, type TSchema, Type } from "@sinclair/typebox";

// biome-ignore lint/style/noNonNullAssertion:
export const TypeRef = <T extends TSchema>(schema: T) => Type.Unsafe<Static<T>>(Type.Ref(schema.$id!));
