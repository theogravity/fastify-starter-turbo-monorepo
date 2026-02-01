import { ApiError, BackendErrorCodes, createApiError } from "@internal/backend-errors";
import { IS_PROD } from "@/constants.js";
import { removeQueryParametersFromPath } from "@/utils/remove-query-params.js";

export function errorHandler(error: any, request, reply) {
  if (request.url) {
    request.log.withContext({
      apiPath: removeQueryParametersFromPath(request.url),
    });
  }

  if (error instanceof ApiError) {
    error.reqId = request.id;

    // If the error is not supposed to be logged, don't log it
    // Usually doNotLog = true means that the error has already been logged elsewhere
    if (!error.doNotLog) {
      request.log
        .withContext({
          errId: error.errId,
          reqId: error.reqId,
        })
        .errorOnly(error, {
          logLevel: error.logLevel,
        });
    }

    if (error.isInternalError) {
      const e = createApiError({
        code: BackendErrorCodes.INTERNAL_SERVER_ERROR,
        causedBy: error,
        ...(error?.validationError
          ? {
              validationError: error.validationError,
            }
          : {}),
      });

      e.errId = error.errId;
      e.reqId = request.id;

      reply.status(e.statusCode).send(IS_PROD ? e.toJSONSafe() : e.toJSON());
    } else {
      reply.status(error.statusCode).send(IS_PROD ? error.toJSONSafe() : error.toJSON());
    }
    // https://github.com/fastify/fastify/blob/main/docs/Reference/Errors.md
  } else if (error?.code === "FST_ERR_VALIDATION") {
    const e = createApiError({
      code: BackendErrorCodes.INPUT_VALIDATION_ERROR,
      validationError: {
        validation: error.validation,
        validationContext: error.validationContext,
        message: error.message,
      },
      causedBy: error,
    });

    e.reqId = request.id;

    reply.status(e.statusCode).send(IS_PROD ? e.toJSONSafe() : e.toJSON());
    // https://github.com/fastify/fastify-jwt?tab=readme-ov-file#error-code
  } else {
    const e = createApiError({
      code: BackendErrorCodes.INTERNAL_SERVER_ERROR,
      message: "An internal server error occurred.",
      causedBy: error,
    });

    e.reqId = request.id;

    request.log
      .withContext({
        errId: e.errId,
        reqId: e.reqId,
      })
      .errorOnly(error);

    reply.status(500).send(IS_PROD ? e.toJSONSafe() : e.toJSON());
  }
}
