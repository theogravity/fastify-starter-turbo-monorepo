import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";
import { type ILogLayer, LogLayer, type PluginShouldSendToLoggerParams } from "loglayer";
import { serializeError } from "serialize-error";
import { IS_TEST } from "@/constants.js";
import { asyncLocalStorage } from "@/utils/async-local-storage.js";

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer {}
}

const ignoreLogs = ["request completed", "incoming request"];

const transport = getSimplePrettyTerminal({ runtime: "node" });

const logger = new LogLayer({
  transport,
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
