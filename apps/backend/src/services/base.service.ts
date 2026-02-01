import type { Kysely } from "kysely";
import type { ILogLayer } from "loglayer";
import type { Repositories } from "@/db/repositories/index.js";
import type { Database } from "@/db/types/index.js";
import type { Services } from "@/services/index.js";

export interface CommonServiceParams {
  log: ILogLayer;
  db: Kysely<Database>;
  repos: Repositories;
}

export class BaseService {
  log: ILogLayer;
  db: Kysely<Database>;
  repos: Repositories;
  services: Services;

  constructor({ log, db, repos }: CommonServiceParams) {
    this.repos = repos;
    this.log = log;
    this.db = db;
    this.services = {} as Services;
  }

  withServices(services: Services) {
    this.services = services;
  }
}
