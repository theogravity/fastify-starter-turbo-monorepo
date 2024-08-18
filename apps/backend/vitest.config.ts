import { defineConfig } from "vitest/config";

const apiPath = "src";
export default defineConfig({
    test: {
        name: "api",
        include: [`${apiPath}/**/?(*.)+(spec|test).[jt]s?(x)`],
        environment: "node",
        globalSetup: [`${apiPath}/test-utils/global-setup.ts`, `${apiPath}/test-utils/global-teardown.ts`],
    },
});
