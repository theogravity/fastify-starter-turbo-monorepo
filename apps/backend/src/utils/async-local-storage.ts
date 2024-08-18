import { AsyncLocalStorage } from "node:async_hooks";
import type { ILogLayer } from "loglayer";
import type { P } from "pino";

export const asyncLocalStorage = new AsyncLocalStorage<{ logger: ILogLayer<P.Logger> }>();
