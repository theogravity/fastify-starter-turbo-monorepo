import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const apiPath = "src";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.on("unhandledRejection", (reason) => {
    console.error("[Unhandled Rejection]");
    console.error(reason);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("[Uncaught Exception]");
    console.error(error);
    process.exit(1);
});

export default defineConfig({
    test: {
        name: "api",
        include: [`${apiPath}/**/?(*.)+(spec|test).[jt]s?(x)`],
        environment: "node",
        globalSetup: [`${apiPath}/test-utils/global-setup.ts`, `${apiPath}/test-utils/global-teardown.ts`],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
