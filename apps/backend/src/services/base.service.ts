import type { Kysely } from "kysely";
import type { ILogLayer } from "loglayer";
import type { Repositories } from "../db/repositories";
import type { Database } from "../db/types";
import type { Services } from "./index";

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
