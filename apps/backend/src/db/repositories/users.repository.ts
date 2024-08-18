import type { DeleteResult, Kysely } from "kysely";
import type { Database } from "../types";
import type { NewUser, UserDb, UserUpdate } from "../types/users.db-types";
import { BaseRepository } from "./base.repository";

export class UsersRepository extends BaseRepository {
  async createUser({
    db,
    user,
  }: {
    db: Kysely<Database>;
    user: NewUser;
  }): Promise<UserDb> {
    return db.insertInto("users").values(user).returningAll().executeTakeFirstOrThrow();
  }

  async getUserById({
    db,
    userId,
  }: {
    db: Kysely<Database>;
    userId: string;
  }): Promise<UserDb | null> {
    return db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  }

  async removeUserById({
    db,
    userId,
  }: {
    db: Kysely<Database>;
    userId: string;
  }): Promise<DeleteResult[]> {
    return db.deleteFrom("users").where("id", "=", userId).execute();
  }

  async updateUser({
    db,
    user,
  }: {
    db: Kysely<Database>;
    user: UserUpdate;
  }): Promise<UserDb> {
    return db.updateTable("users").set(user).where("id", "=", user.id).returningAll().executeTakeFirstOrThrow();
  }
}
