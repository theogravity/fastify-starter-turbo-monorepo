import type { ErrorObject } from "ajv";
import cleanStack from "clean-stack";
import { nanoid } from "nanoid";
import { serializeError } from "serialize-error";
import sprintf from "sprintf-js";
import { BackendErrorCodeDefs, type BackendErrorCodes } from "./error-codes";

const stackFilter = (path) => !/backend-errors/.test(path);

export interface ApiValidationError {
  validation: ErrorObject[];
  validationContext: string;
  message: string;
}

export interface ApiErrorParams {
  /**
   * Error code
   */
  code: BackendErrorCodes;
  /**
   * Error message
   */
  message: string;
  /**
   * HTTP status code
   */
  statusCode: number;
  /**
   * Additional unsafe metadata that won't return to the client
   */
  metadata?: Record<string, any>;
  /**
   * Additional safe metadata that can be returned to the client
   */
  metadataSafe?: Record<string, any>;
  /**
   * AJV-style validation errors
   * @see https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation-messages-with-other-validation-libraries
   */
  validationError?: ApiValidationError;
  /**
   * Error object.
   */
  causedBy?: any;
  /**
   * If set to true, the error will be treated as an internal error on output to the client side, but the original
   * error will still be logged by the fastify error handler.
   */
  isInternalError?: boolean;
  /**
   * Log level to use for the error. Default is "error".
   */
  logLevel?: "error" | "warn" | "info" | "debug" | "trace" | "fatal";
  /**
   * Don't log the error in the error handler as it has been logged elsewhere.
   */
  doNotLog?: boolean;
}

export class ApiError extends Error {
  /**
   * Error code
   */
  code: BackendErrorCodes;
  /**
   * HTTP status code
   */
  statusCode: number;
  /**
   * Additional unsafe metadata that won't return to the client
   */
  metadata?: Record<string, any>;
  /**
   * Additional safe metadata that can be returned to the client
   */
  metadataSafe?: Record<string, any>;
  /**
   * Error ID
   */
  errId: string;
  /**
   * Request ID
   */
  reqId?: string;
  /**
   * Error object
   */
  causedBy?: any;
  /**
   * If set to true, the error will be treated as an internal error on output to the client side, but the original
   * error will still be logged by the fastify error handler.
   */
  isInternalError?: boolean;
  /**
   * Log level to use for the error. Default is "error".
   */
  logLevel?: "error" | "warn" | "info" | "debug" | "trace" | "fatal";
  /**
   * AJV-style validation errors
   * @see https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation-messages-with-other-validation-libraries
   */
  validationError?: ApiValidationError;
  /**
   * Don't log the error in the error handler as it has been logged elsewhere.
   */
  doNotLog?: boolean;

  constructor({
    code,
    message,
    statusCode,
    metadata,
    metadataSafe,
    validationError,
    causedBy,
    isInternalError,
    logLevel,
    doNotLog,
  }: ApiErrorParams) {
    super(message);
    this.errId = nanoid(12);
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.metadataSafe = metadataSafe;
    this.validationError = validationError;
    this.causedBy = causedBy;
    this.isInternalError = isInternalError || false;
    this.logLevel = logLevel || "error";
    this.doNotLog = doNotLog || false;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.stack = cleanStack(this.stack, { pathFilter: stackFilter });
  }

  /**
   * Uses sprintf to format the error message
   */
  formatMessage(...params: any[]) {
    this.message = sprintf.sprintf(this.message, ...params);
    return this;
  }

  toJSON() {
    let causedBy: any = {};

    if (this.causedBy instanceof ApiError) {
      causedBy = this.causedBy.toJSON();
    } else if (this.causedBy instanceof Error) {
      causedBy = serializeError(this.causedBy);
    } else if (this.causedBy) {
      try {
        causedBy = JSON.stringify(this.causedBy);
      } catch (_e) {
        causedBy = this.causedBy;
      }
    }

    let metadata: Record<string, any> = {};

    if (this.metadata || this.metadataSafe) {
      metadata = {
        ...(this.metadata ? { metadata: this.metadata } : {}),
        ...(this.metadataSafe ? { metadataSafe: this.metadataSafe } : {}),
      };
    }

    return {
      ...(this.reqId ? { reqId: this.reqId } : {}),
      errId: this.errId,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...metadata,
      ...(causedBy ? { causedBy } : {}),
      ...(this.validationError ? { validationError: this.validationError } : {}),
      stack: this.stack,
    };
  }

  /**
   * Use to output production-safe values. Omits the following:
   *
   * - Stack trace
   * - Caused by
   * - unsafe metadata
   */
  toJSONSafe() {
    return {
      ...(this.reqId ? { reqId: this.reqId } : {}),
      errId: this.errId,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.metadataSafe ? { metadata: this.metadataSafe } : {}),
      ...(this.validationError ? { validationError: this.validationError } : {}),
    };
  }
}

export type ApiErrorShort = Pick<
  ApiErrorParams,
  "doNotLog" | "metadataSafe" | "logLevel" | "isInternalError" | "code" | "metadata" | "validationError" | "causedBy"
> & {
  message?: string;
};

/**
 * Creates an API error and throws it
 * @throws {ApiError}
 */
export function throwApiError({
  code,
  metadata,
  metadataSafe,
  validationError,
  message,
  causedBy,
  isInternalError,
  logLevel,
  doNotLog,
}: ApiErrorShort) {
  throw createApiError({
    code,
    message,
    metadata,
    metadataSafe,
    validationError,
    causedBy,
    isInternalError,
    logLevel,
    doNotLog,
  });
}

/**
 * Creates an API error
 * @throws {ApiError}
 */
export function createApiError({
  code,
  message,
  metadata,
  metadataSafe,
  validationError,
  causedBy,
  isInternalError,
  logLevel,
  doNotLog,
}: ApiErrorShort) {
  const { message: predefinedMessage, statusCode } = BackendErrorCodeDefs[code];

  return new ApiError({
    code,
    message: message || predefinedMessage,
    statusCode,
    metadata,
    metadataSafe,
    validationError,
    causedBy,
    isInternalError,
    logLevel,
    doNotLog,
  });
}

export function getErrorStatusCode(code: BackendErrorCodes): number {
  return BackendErrorCodeDefs[code].statusCode;
}

export function getErrorMessage(code: BackendErrorCodes): string {
  return BackendErrorCodeDefs[code].message;
}
