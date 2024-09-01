import { type ILogLayer, LogLayer, LoggerType } from "loglayer";
import { type P, pino } from "pino";
import { prettyFactory } from "pino-pretty";
import { serializeError } from "serialize-error";
import { IS_PROD, IS_TEST } from "../constants";
import { asyncLocalStorage } from "./async-local-storage";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer<P.Logger> {}
}

let p: P.Logger;

// Tests require a different logger setup
// because the server "starts" separately from the test runner
if (IS_TEST) {
  const prettify = prettyFactory({ sync: true });
  const ignoreLogs = ["request completed", "incoming request"];

  p = pino(
    {
      level: "debug",
      base: null,
    },
    {
      write(data: unknown) {
        const d = JSON.parse(data as string);

        if (ignoreLogs.includes(d.msg)) {
          return;
        }

        console.log(
          prettify({
            level: d.level,
            time: d.time,
            msg: d.msg,
            context: d.context,
            metadata: d.metadata,
            err: d.err,
          }),
        );
      },
    },
  );
} else if (IS_PROD) {
  p = pino({
    level: "error",
  });
} else {
  p = pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
    base: null,
  });
}

const loggerPortalApi = new LogLayer<P.Logger>({
  logger: {
    instance: p,
    type: LoggerType.PINO,
  },
  context: {
    fieldName: "context",
  },
  metadata: {
    fieldName: "metadata",
  },
  error: {
    fieldName: "err",
    serializer: serializeError,
    copyMsgOnOnlyError: true,
  },
});

if (IS_TEST) {
  // Default is off
  loggerPortalApi.disableLogging();
}

export function getLogger(): ILogLayer<P.Logger> {
  if (IS_TEST) {
    return loggerPortalApi;
  }

  const store = asyncLocalStorage.getStore();

  if (!store) {
    // Use non-request specific logger
    return loggerPortalApi;
  }

  return store.logger;
}
