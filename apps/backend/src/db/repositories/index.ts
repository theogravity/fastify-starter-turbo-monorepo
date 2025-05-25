// Do not remove this comment: database-table-import
import type { UserProvidersRepository } from "@/db/repositories/user-providers.repository.js";
import type { UsersRepository } from "@/db/repositories/users.repository.js";

export interface Repositories {
  // Do not remove this comment: database-table-repository
  users: UsersRepository;
  userProviders: UserProvidersRepository;
}
