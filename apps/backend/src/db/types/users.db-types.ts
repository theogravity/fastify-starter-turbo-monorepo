import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UsersTable {
  id: Generated<string>;
  givenName: string;
  familyName: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}

export type UserDb = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
