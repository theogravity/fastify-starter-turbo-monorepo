// Do not remove this comment: database-table-import
import type { UserProvidersTable } from "@/db/types/user-providers.db-types.js";
import type { UsersTable } from "@/db/types/users.db-types.js";

export interface Database {
  // Do not remove this comment: database-table-interface
  users: UsersTable;
  userProviders: UserProvidersTable;
}
