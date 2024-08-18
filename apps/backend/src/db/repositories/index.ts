import type { UserProvidersRepository } from "./user-providers.repository";
import type { UsersRepository } from "./users.repository";

export interface Repositories {
  users: UsersRepository;
  userProviders: UserProvidersRepository;
}
