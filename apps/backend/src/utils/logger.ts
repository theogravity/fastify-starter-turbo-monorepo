import chalk from "chalk";
import { type ILogLayer, LogLayer, LoggerType } from "loglayer";
import { type LogDescriptor, type P, pino } from "pino";
import { prettyFactory } from "pino-pretty";
import { serializeError } from "serialize-error";
import { IS_PROD, IS_TEST } from "../constants";
import { asyncLocalStorage } from "./async-local-storage";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer<P.Logger> {}
}

let p: P.Logger;

const ignoreLogs = ["request completed", "incoming request"];

const prettify = prettyFactory({
  sync: true,
  colorize: true,
  messageFormat: (log: LogDescriptor, messageKey: string) => {
    let logMessage = log[messageKey];

    if (log?.metadata?.err) {
      logMessage += `\n${chalk.red("==== error ====\n\n")}${chalk.red(JSON.stringify(log.metadata?.err, null, 2).replace(/^{|}$/g, ""))}`;
      delete log.metadata?.err;
    }

    if (log?.metadata) {
      logMessage += `\n${chalk.blue("==== metadata ===\n")}${chalk.blue(JSON.stringify(log.metadata, null, 2).replace(/^{|}$/g, ""))}`;
      delete log.metadata;
    }

    if (log?.context) {
      logMessage += `\n${chalk.blue("==== context ====\n")}${chalk.blue(JSON.stringify(log.context, null, 2).replace(/^{|}$/g, ""))}`;
      delete log.context;
    }

    if (log.context && Object.keys(log.context).length === 0) {
      delete log.context;
    }

    if (log.metadata && Object.keys(log.metadata).length === 0) {
      delete log.metadata;
    }

    return logMessage;
  },
});

const pinoOpts = {
  write(data: unknown) {
    const d = JSON.parse(data as string);

    if (ignoreLogs.includes(d.msg)) {
      return;
    }

    process.stdout.write(
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
};

// Tests require a different logger setup
// because the server "starts" separately from the test runner
if (IS_TEST) {
  p = pino(
    {
      level: "debug",
      base: null,
    },
    pinoOpts,
  );
} else if (IS_PROD) {
  p = pino({
    level: "error",
  });
} else {
  p = pino(
    {
      level: "debug",
      base: null,
    },
    pinoOpts,
  );
}

const logger = new LogLayer<P.Logger>({
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
  logger.disableLogging();
}

export function getLogger(): ILogLayer<P.Logger> {
  if (IS_TEST) {
    return logger;
  }

  const store = asyncLocalStorage.getStore();

  if (!store) {
    // Use non-request specific logger
    return logger;
  }

  return store.logger;
}
