import { PinoTransport } from "@loglayer/transport-pino";
import { getPrettyTerminal } from "@loglayer/transport-pretty-terminal";
import { type ILogLayer, LogLayer, type LogLayerTransport } from "loglayer";
import { pino } from "pino";
import { serializeError } from "serialize-error";
import { BACKEND_LOG_LEVEL, IS_PROD, IS_TEST } from "../constants";
import { asyncLocalStorage } from "./async-local-storage";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer {}
}

const transports: LogLayerTransport[] = [];

if (IS_PROD) {
  transports.push(
    new PinoTransport({
      logger: pino({
        level: BACKEND_LOG_LEVEL,
      }),
    }),
  );
} else if (IS_TEST) {
  transports.push(
    getPrettyTerminal({
      // Disabled since tests themselves are interactive
      disableInteractiveMode: true,
    }),
  );
} else {
  transports.push(
    getPrettyTerminal({
      // Disabled since we tend to run multiple services via turbo watch
      disableInteractiveMode: true,
    }),
  );
}

const logger = new LogLayer({
  transport: transports,
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
