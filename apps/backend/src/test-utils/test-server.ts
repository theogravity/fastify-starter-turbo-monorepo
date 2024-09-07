import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import Fastify, { type InjectOptions, type LightMyRequestResponse } from "fastify";
import fp from "fastify-plugin";
import { nanoid } from "nanoid";
import { expect } from "vitest";
import { afterAll, beforeAll } from "vitest";
import routes from "../api";
import { ajvPlugins } from "../api-lib/ajv-plugins";
import { errorHandler } from "../api-lib/error-handler";
import { getLogger } from "../utils/logger";
import { testPlugins } from "./plugins";

declare module "fastify" {
  interface InjectOptions {
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
    logger,
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

const logger = getLogger().withPrefix("[test-result]");

// @ts-ignore
testFastify.inject = async (opts: InjectOptions, cb): Promise<LightMyRequestResponse> => {
  const result = await originalInject(opts);
  const expectedStatusCode = opts.expectedStatusCode ?? 200;

  // Log the response if it's not what we expected
  if (expectedStatusCode !== result.statusCode) {
    let responsePayload;

    try {
      responsePayload = result.json();
    } catch {
      responsePayload = result.payload.toString();
    }

    logger
      .withMetadata({
        request: opts,
        response: {
          statusCode: result.statusCode,
          payload: responsePayload,
        },
      })
      .error(`Failed request: ${opts.method} ${opts.url}`);

    expect(result.statusCode).toBe(expectedStatusCode);
  }

  return result;
};

beforeAll(async () => {
  await testFastify.ready();
});

afterAll(async () => {
  await testFastify.close();
});
