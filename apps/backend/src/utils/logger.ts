import { BACKEND_LOG_LEVEL, IS_PROD, IS_TEST } from "@/constants.js";
import { asyncLocalStorage } from "@/utils/async-local-storage.js";
import { PinoTransport } from "@loglayer/transport-pino";
import { getPrettyTerminal } from "@loglayer/transport-pretty-terminal";
import { type ILogLayer, LogLayer, type LogLayerTransport, type PluginShouldSendToLoggerParams } from "loglayer";
import { pino } from "pino";
import { serializeError } from "serialize-error";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer {}
}

const ignoreLogs = ["request completed", "incoming request"];

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
      shouldSendToLogger(params: PluginShouldSendToLoggerParams): boolean {
        if (params.messages?.[1] && ignoreLogs.some((log) => params.messages[1].includes(log))) {
          // Ignore logs that match the ignore list
          return false;
        }

        return true;
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
