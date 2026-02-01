import bcrypt from "bcryptjs";
import { PasswordAlgo, UserProviderType } from "@/db/types/user-providers.db-types.js";
import type { NewUser, UserDb } from "@/db/types/users.db-types.js";
import { BaseService } from "@/services/base.service.js";

export class UsersService extends BaseService {
  async createEMailUser({
    user,
    email,
    password,
  }: {
    user: NewUser;
    email: string;
    password: string;
  }): Promise<UserDb> {
    const pass = await bcrypt.hash(password, 12);

    let u;

    await this.db.transaction().execute(async (db) => {
      u = await this.repos.users.createUser({
        db,
        user,
      });

      await this.repos.userProviders.createUserProvider({
        db,
        userProvider: {
          providerType: UserProviderType.EMail,
          providerAccountId: email,
          passwordAlgo: PasswordAlgo.BCrypt12,
          passwordHash: pass,
          userId: u.id,
        },
      });
    });

    return u;
  }
}
