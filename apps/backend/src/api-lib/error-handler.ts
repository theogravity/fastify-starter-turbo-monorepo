import { ApiError, BackendErrorCodes, createApiError } from "@internal/backend-errors";

export function errorHandler(error: any, request, reply) {
  if (error instanceof ApiError) {
    error.reqId = request.id;
    request.log.errorOnly(error);
    reply.status(error.statusCode).send(error.toJSON());
  } else if (error?.code === "FST_ERR_VALIDATION") {
    const e = createApiError({
      code: BackendErrorCodes.INPUT_VALIDATION_ERROR,
      validation: error.validation,
      validationContext: error.validationContext,
    });

    e.reqId = request.id;

    reply.status(e.statusCode).send(e.toJSON());
  } else {
    reply.send(error);
    request.log.errorOnly(error);
  }
}
