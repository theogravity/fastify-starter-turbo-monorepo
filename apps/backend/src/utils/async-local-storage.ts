import { AsyncLocalStorage } from "node:async_hooks";
import type { ILogLayer } from "loglayer";

export const asyncLocalStorage = new AsyncLocalStorage<{ logger: ILogLayer }>();
