// Do not remove this comment: database-table-import
import type { UserProvidersTable } from "./user-providers.db-types";
import type { UsersTable } from "./users.db-types";

export interface Database {
  // Do not remove this comment: database-table-interface
  users: UsersTable;
  userProviders: UserProvidersTable;
}
