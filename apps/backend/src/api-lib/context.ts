import type { Kysely } from "kysely";
import type { ILogLayer } from "loglayer";
import { db } from "../db";
import { UserProvidersRepository } from "../db/repositories/user-providers.repository";
import { UsersRepository } from "../db/repositories/users.repository";
import type { Database } from "../db/types";
import type { Services } from "../services";
import { UsersService } from "../services/users.service";
import { getLogger } from "../utils/logger";

export type ApiContextParams = {
  db: Kysely<Database>;
  log: ILogLayer;
};

export class ApiContext {
  readonly log: ILogLayer;
  services: Services;
  private readonly params: ApiContextParams;

  constructor(params: ApiContextParams) {
    this.params = params;
    this.log = params.log;
    this.services = {} as Services;
    this.init();
  }

  private init() {
    const params = this.params;

    const serviceParams = {
      log: params.log,
      db: params.db,
      repos: {
        users: new UsersRepository(params),
        userProviders: new UserProvidersRepository(params),
      },
    };

    this.services = {
      users: new UsersService(serviceParams),
    };

    for (const service of Object.values(this.services)) {
      service.withServices(this.services);
    }
  }
}

let requestlessContext: ApiContext;

/**
 * This is a singleton context that can be used outside of a request.
 * It will not have anything request-specific attached to it.
 */
export function getRequestlessContext(): ApiContext {
  if (!requestlessContext) {
    requestlessContext = new ApiContext({
      db,
      log: getLogger(),
    });
  }

  return requestlessContext;
}
