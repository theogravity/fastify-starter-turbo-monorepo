import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { registerResourceRoutes } from "@/api/routes.js";
import { apiTypes } from "@/api-lib/types/index.js";

export default async function routes(fastify: FastifyInstance, _opts) {
  fastify.register(fastifySwagger, {
    mode: "dynamic",
    refResolver: {
      // This assigns the component name in the OpenAPI generated schema
      buildLocalReference(json, _baseUri, _fragment, i) {
        // Fallback if no title is present
        if (!json.title && json.$id) {
          json.title = json.$id;
        }
        // Fallback if no $id is present
        if (!json.$id) {
          return `def-${i}`;
        }

        return `${json.$id}`;
      },
    },
    openapi: {
      info: {
        title: "Backend API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, req, _reply) => {
      // @ts-expect-error
      swaggerObject.host = req.hostname;
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  fastify.get("/", async (_, reply) => {
    reply.send("OK");
  });

  fastify.register(fp(apiTypes));
  fastify.register(fp(registerResourceRoutes));
}
