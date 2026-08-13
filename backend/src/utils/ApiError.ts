// ─── Error Categories ─────────────────────────────────────────────────────────

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

// ─── ApiError ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: Record<string, string[]> | undefined;
  public readonly category: ErrorCategory;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
    isOperational = true,
    category = ErrorCategory.INTERNAL,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.category = category;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string[]>): ApiError {
    return new ApiError(400, message, errors, true, ErrorCategory.VALIDATION);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message, undefined, true, ErrorCategory.AUTHENTICATION);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, undefined, true, ErrorCategory.AUTHORIZATION);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, undefined, true, ErrorCategory.NOT_FOUND);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, undefined, true, ErrorCategory.CONFLICT);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, message, undefined, true, ErrorCategory.RATE_LIMIT);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, undefined, false, ErrorCategory.INTERNAL);
  }
}
