import fastifyCors from "@fastify/cors";
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { nanoid } from "nanoid";
import routes from "@/api/index.js";
import { ajvPlugins } from "@/api-lib/ajv-plugins.js";
import { errorHandler } from "@/api-lib/error-handler.js";
import { plugins } from "@/plugins/index.js";
import { asyncLocalStorage } from "@/utils/async-local-storage.js";
import { getLogger } from "@/utils/logger.js";

export async function startServer({ port }: { port: number }) {
  const logger = getLogger();

  const fastify = Fastify({
    // @ts-expect-error
    loggerInstance: logger,
    disableRequestLogging: true,
    ajv: {
      plugins: ajvPlugins,
    },
    genReqId: () => nanoid(12),
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  fastify.addHook("onRequest", (request, _reply, done) => {
    const logger = fastify.log.withContext({ reqId: request.id });

    asyncLocalStorage.run({ logger }, done);
  });

  fastify.register(fp(plugins));

  fastify.setErrorHandler(errorHandler);

  // Function to validate CORS origin
  const corsOptions = {
    origin: (_origin, cb) => {
      // @todo - Add logic to validate origin this is a secuity risk
      return cb(null, true);
    },
  };

  fastify.register(fastifyCors, corsOptions);
  fastify.register(routes);
  fastify.log.disableLogging();

  fastify.listen({ port }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }

    fastify.log.enableLogging();

    fastify.log.info(`Server: ${address}`);
    fastify.log.info(`Server docs: ${address}/docs`);
  });
}
