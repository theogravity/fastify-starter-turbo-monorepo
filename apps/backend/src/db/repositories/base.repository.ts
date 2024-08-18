import type { ILogLayer } from "loglayer";

export class BaseRepository {
  log: ILogLayer;

  constructor({ log }: { log: ILogLayer }) {
    this.log = log;
  }
}
