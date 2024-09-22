import type { Kysely } from "kysely";
import type { Database } from "../types";
import type { NewUserProvider, UserProviderDb } from "../types/user-providers.db-types";
import { BaseRepository } from "./base.repository";

/**
 * Stores user authentication provider information. Allows usage of multiple
 * authentication providers per user.
 */
export class UserProvidersRepository extends BaseRepository {
  async createUserProvider({
    db,
    userProvider,
  }: {
    db: Kysely<Database>;
    userProvider: NewUserProvider;
  }): Promise<UserProviderDb> {
    return db.insertInto("userProviders").values(userProvider).returningAll().executeTakeFirstOrThrow();
  }
}
