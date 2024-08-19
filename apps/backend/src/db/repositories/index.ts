// Do not remove this comment: database-table-import
import type { UserProvidersRepository } from "./user-providers.repository";
import type { UsersRepository } from "./users.repository";

export interface Repositories {
  // Do not remove this comment: database-table-repository
  users: UsersRepository;
  userProviders: UserProvidersRepository;
}
