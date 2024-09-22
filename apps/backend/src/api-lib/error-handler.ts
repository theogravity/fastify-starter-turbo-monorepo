import { ApiError, BackendErrorCodes, createApiError } from "@internal/backend-errors";
import { IS_PROD } from "../constants";

export function errorHandler(error: any, request, reply) {
  if (error instanceof ApiError) {
    error.reqId = request.id;
    request.log.errorOnly(error, {
      logLevel: error.logLevel,
    });

    if (error.isInternalError) {
      const e = createApiError({
        code: BackendErrorCodes.INTERNAL_SERVER_ERROR,
        validation: error.validation,
        validationContext: error.validationContext,
        causedBy: error,
      });

      e.errId = error.errId;
      e.reqId = request.id;

      reply.status(e.statusCode).send(IS_PROD ? e.toJSONSafe() : e.toJSON());
    } else {
      reply.status(error.statusCode).send(IS_PROD ? error.toJSONSafe() : error.toJSON());
    }
  } else if (error?.code === "FST_ERR_VALIDATION") {
    const e = createApiError({
      code: BackendErrorCodes.INPUT_VALIDATION_ERROR,
      validation: error.validation,
      validationContext: error.validationContext,
      causedBy: error,
    });

    e.reqId = request.id;

    reply.status(500).send(IS_PROD ? e.toJSONSafe() : e.toJSON());
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
