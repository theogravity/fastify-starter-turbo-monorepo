import type { ErrorObject } from "ajv";
import cleanStack from "clean-stack";
import { nanoid } from "nanoid";
import { serializeError } from "serialize-error";
import sprintf from "sprintf-js";
import { BackendErrorCodeDefs, type BackendErrorCodes } from "./error-codes";

const stackFilter = (path) => !/backend-errors/.test(path);

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
   */
  validation?: ErrorObject[];
  /**
   * Context of the validation errors
   */
  validationContext?: string;
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
   * AJV-style validation errors
   */
  validation?: ErrorObject[];
  /**
   * Context of the validation errors
   */
  validationContext?: string;
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

  constructor({
    code,
    message,
    statusCode,
    metadata,
    metadataSafe,
    validation,
    validationContext,
    causedBy,
    isInternalError,
    logLevel,
  }: ApiErrorParams) {
    super(message);
    this.errId = nanoid(12);
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.metadataSafe = metadataSafe;
    this.validation = validation;
    this.validationContext = validationContext;
    this.causedBy = causedBy;
    this.isInternalError = isInternalError || false;
    this.logLevel = logLevel || "error";

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
      } catch (e) {
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
      ...(this.validation ? { validation: this.validation } : {}),
      ...(this.validationContext ? { validationContext: this.validationContext } : {}),
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
      ...(this.validation ? { validation: this.validation } : {}),
      ...(this.validationContext ? { validationContext: this.validationContext } : {}),
    };
  }
}

export type ApiErrorShort = Pick<
  ApiErrorParams,
  | "metadataSafe"
  | "logLevel"
  | "isInternalError"
  | "code"
  | "metadata"
  | "validation"
  | "validationContext"
  | "causedBy"
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
  validation,
  validationContext,
  message,
  causedBy,
  isInternalError,
  logLevel,
}: ApiErrorShort) {
  throw createApiError({
    code,
    message,
    metadata,
    metadataSafe,
    validation,
    validationContext,
    causedBy,
    isInternalError,
    logLevel,
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
  validation,
  validationContext,
  causedBy,
  isInternalError,
  logLevel,
}: ApiErrorShort) {
  const { message: predefinedMessage, statusCode } = BackendErrorCodeDefs[code];

  return new ApiError({
    code,
    message: message || predefinedMessage,
    statusCode,
    metadata,
    metadataSafe,
    validation,
    validationContext,
    causedBy,
    isInternalError,
    logLevel,
  });
}

export function getErrorStatusCode(code: BackendErrorCodes): number {
  return BackendErrorCodeDefs[code].statusCode;
}

export function getErrorMessage(code: BackendErrorCodes): string {
  return BackendErrorCodeDefs[code].message;
}
