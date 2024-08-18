import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export enum UserProviderType {
  EMail = "EMail",
}

export enum PasswordAlgo {
  BCrypt12 = "BCrypt12",
}

export interface UserProvidersTable {
  id: Generated<string>;
  userId: string;
  providerType: UserProviderType;
  providerAccountId: string;
  passwordAlgo?: PasswordAlgo;
  passwordHash?: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type UserProviderDb = Selectable<UserProvidersTable>;
export type NewUserProvider = Insertable<UserProvidersTable>;
export type UserProviderUpdate = Updateable<UserProvidersTable>;
