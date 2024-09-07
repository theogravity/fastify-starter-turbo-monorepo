import type { ColumnType, Generated, GeneratedAlways, Insertable, Selectable, Updateable } from "kysely";

export interface UsersTable {
  id: Generated<string>;
  givenName: string;
  familyName: string;
  createdAt: GeneratedAlways<Date>;
  updatedAt: Generated<ColumnType<Date>>;
}

export type UserDb = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
