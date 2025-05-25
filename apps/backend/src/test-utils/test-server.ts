import { ajvPlugins } from "@/api-lib/ajv-plugins.js";
import { errorHandler } from "@/api-lib/error-handler.js";
import routes from "@/api/index.js";
import { testPlugins } from "@/test-utils/plugins/index.js";
import { getLogger } from "@/utils/logger.js";
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import chalk from "chalk";
import Fastify, { type InjectOptions, type LightMyRequestResponse } from "fastify";
import fp from "fastify-plugin";
import { nanoid } from "nanoid";
import { expect } from "vitest";
import { afterAll, beforeAll } from "vitest";

declare module "fastify" {
  interface InjectOptions {
    /**
     * If true, the expected status code check will be disabled.
     */
    disableExpectedStatusCodeCheck?: boolean;
    /**
     * The expected status code of the response.
     * Default is 200.
     * If the response status code does not match this value, the test will fail
     * and log out the request and response.
     */
    expectedStatusCode?: number;
  }
}

export function serverTestSetup(routes: any) {
  const logger = getLogger();

  const fastify = Fastify({
    ajv: {
      plugins: ajvPlugins,
    },
    // @ts-ignore
    loggerInstance: logger,
    genReqId: () => nanoid(12),
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  fastify.setErrorHandler(errorHandler);
  fastify.register(fp(testPlugins));
  fastify.register(routes);

  return fastify;
}

export const testFastify = serverTestSetup(routes);

type InjectFunction = typeof testFastify.inject;

const originalInject: InjectFunction = testFastify.inject.bind(testFastify);

// @ts-ignore
testFastify.inject = async (opts: InjectOptions): Promise<LightMyRequestResponse> => {
  const expectedStatusCode = opts.expectedStatusCode ?? 200;

  const result = await originalInject(opts);
  let responsePayload;

  try {
    responsePayload = result.json();
  } catch {
    responsePayload = result.payload.toString();
  }

  // Log the response if it's not what we expected
  if (!opts.disableExpectedStatusCodeCheck && expectedStatusCode !== result.statusCode) {
    const expectMessage = `

${chalk.red(`Failed request: ${opts.method} ${opts.url}`)}
${chalk.red(`Expected status code: ${expectedStatusCode}, got ${result.statusCode}`)}

${chalk.red("==== response ====")}
${chalk.red(JSON.stringify(responsePayload, null, 2))}

${chalk.blue("==== request ====")}
${chalk.blue(JSON.stringify(opts, null, 2))}
`;

    expect(result.statusCode, expectMessage).toBe(expectedStatusCode);
  }

  return result;
};

beforeAll(async () => {
  await testFastify.ready();
});

afterAll(async () => {
  await testFastify.close();
});
