import { PinoTransport } from "@loglayer/transport-pino";
import chalk from "chalk";
import { type ILogLayer, LogLayer } from "loglayer";
import { type LogDescriptor, type P, pino } from "pino";
import { prettyFactory } from "pino-pretty";
import { serializeError } from "serialize-error";
import { BACKEND_LOG_LEVEL, IS_PROD, IS_TEST } from "../constants";
import { asyncLocalStorage } from "./async-local-storage";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer {}
}

let p: P.Logger;

const ignoreLogs = ["request completed", "incoming request"];

const prettify = prettyFactory({
  sync: true,
  colorize: true,
  messageFormat: (log: LogDescriptor, messageKey: string) => {
    let logMessage = log[messageKey];

    if (log.err) {
      logMessage += `\n${chalk.red("==== error ====\n")}${chalk.red(JSON.stringify(serializeError(log.err), null, 2).replace(/^{|}$/g, ""))}\n`;
      delete log.err;
    }

    if (log?.metadata?.err) {
      logMessage += `\n${chalk.red("==== error ====\n")}${chalk.red(JSON.stringify(serializeError(log.metadata?.err), null, 2).replace(/^{|}$/g, ""))}\n`;
      delete log.metadata?.err;
    }

    if (log?.metadata) {
      logMessage += `\n${chalk.blue("==== metadata ===\n")}${chalk.blue(JSON.stringify(log.metadata, null, 2).replace(/^{|}$/g, ""))}\n`;
      delete log.metadata;
    }

    if (log?.context) {
      logMessage += `\n${chalk.blue("==== context ====\n")}${chalk.blue(JSON.stringify(log.context, null, 2).replace(/^{|}$/g, ""))}\n`;
      delete log.context;
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

    if (IS_TEST) {
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
    } else {
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
    }
  },
};

// Tests require a different logger setup
// because the server "starts" separately from the test runner
if (IS_TEST) {
  p = pino(
    {
      level: BACKEND_LOG_LEVEL,
      base: null,
    },
    pinoOpts,
  );
} else if (IS_PROD) {
  p = pino({
    level: BACKEND_LOG_LEVEL,
  });
} else {
  p = pino(
    {
      level: BACKEND_LOG_LEVEL,
      base: null,
    },
    pinoOpts,
  );
}

const logger = new LogLayer({
  transport: new PinoTransport({
    logger: p,
  }),
  contextFieldName: "context",
  metadataFieldName: "metadata",
  errorFieldName: "err",
  errorSerializer: serializeError,
  copyMsgOnOnlyError: true,
  plugins: [
    {
      onBeforeMessageOut: ({ messages }) => {
        // Check for fastify request / response logs sent to the logger
        // and remove them from the log output
        // The first message is an object from fastify containing
        // the request and response objects
        // The second message is the actual log message
        if (messages[0]?.res && messages[1]) {
          return [messages[1]];
        }

        return messages;
      },
    },
  ],
});

if (IS_TEST) {
  logger.disableLogging();
}

export function getLogger(): ILogLayer {
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
