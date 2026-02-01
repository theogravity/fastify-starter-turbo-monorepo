import type { Kysely } from "kysely";
import { BaseRepository } from "@/db/repositories/base.repository.js";
import type { Database } from "@/db/types/index.js";
import type { NewUserProvider, UserProviderDb } from "@/db/types/user-providers.db-types.js";

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
