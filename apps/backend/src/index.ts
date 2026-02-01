import { SERVER_PORT } from "@/constants.js";
import { startServer } from "@/server.js";
import { getLogger } from "@/utils/logger.js";

process.on("unhandledRejection", (reason, promise) => {
  const log = getLogger().withPrefix("[Unhandled Rejection]");
  log
    .withError(reason)
    .withMetadata({
      promise,
    })
    .fatal("Unhandled Rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  const log = getLogger().withPrefix("[Uncaught Exception]");
  log.withError(error).fatal("Uncaught Exception");
  process.exit(1);
});

(async () => {
  await startServer({ port: SERVER_PORT });
})();
