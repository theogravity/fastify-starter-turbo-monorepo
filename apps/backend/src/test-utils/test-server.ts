import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { MockLogLayer } from "loglayer";
import { nanoid } from "nanoid";
import { afterAll, beforeAll } from "vitest";
import routes from "../api";
import { ajvPlugins } from "../api-lib/ajv-plugins";
import { errorHandler } from "../api-lib/error-handler";
import { getLogger } from "../utils/logger";
import { testDecorators } from "./decorators";

export function serverTestSetup(routes: any) {
  const logger = getLogger();

  const fastify = Fastify({
    ajv: {
      plugins: ajvPlugins,
    },
    // @ts-ignore
    logger: new MockLogLayer(),
    genReqId: () => nanoid(12),
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  fastify.setErrorHandler(errorHandler);

  fastify.register(fp(testDecorators));
  fastify.register(routes);

  return fastify;
}

export const testFastify = serverTestSetup(routes);

beforeAll(async () => {
  await testFastify.ready();
});

afterAll(async () => {
  await testFastify.close();
});
