import type { ErrorObject } from "ajv";
import { nanoid } from "nanoid";
import sprintf from "sprintf-js";
import { BackendErrorCodeDefs, type BackendErrorCodes } from "./error-codes";

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
   * Additional metadata
   */
  metadata?: Record<string, any>;
  /**
   * AJV-style validation errors
   */
  validation?: ErrorObject[];
  /**
   * Context of the validation errors
   */
  validationContext?: string;
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
   * Additional metadata
   */
  metadata?: Record<string, any>;
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

  constructor({ code, message, statusCode, metadata, validation, validationContext }: ApiErrorParams) {
    super(message);
    this.errId = nanoid(12);
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.validation = validation;
    this.validationContext = validationContext;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Uses sprintf to format the error message
   */
  formatMessage(...params: any[]) {
    this.message = sprintf.sprintf(this.message, ...params);
    return this;
  }

  toJSON() {
    return {
      ...(this.reqId ? { reqId: this.reqId } : {}),
      errId: this.errId,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.metadata ? { metadata: this.metadata } : {}),
      ...(this.validation ? { validation: this.validation } : {}),
      ...(this.validationContext ? { validationContext: this.validationContext } : {}),
    };
  }
}

export type ApiErrorShort = Pick<ApiErrorParams, "code" | "metadata" | "validation" | "validationContext"> & {
  message?: string;
};

/**
 * Creates an API error and throws it
 */
export function throwApiError({ code, metadata, validation, validationContext, message }: ApiErrorShort) {
  throw createApiError({ code, message, metadata, validation, validationContext });
}

/**
 * Creates an API error
 */
export function createApiError({ code, message, metadata, validation, validationContext }: ApiErrorShort) {
  const { message: predefinedMessage, statusCode } = BackendErrorCodeDefs[code];

  return new ApiError({
    code,
    message: message || predefinedMessage,
    statusCode,
    metadata,
    validation,
    validationContext,
  });
}
