import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

const formatZodError = (error: ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'body';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  return errors;
};

const handleMongooseError = (error: mongoose.Error): ApiError => {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [field, err] of Object.entries(error.errors)) {
      errors[field] = [err.message];
    }
    return ApiError.badRequest('Validation failed', errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  }

  return ApiError.internal('Database error');
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    return _next(err);
  }

  let error = err;

  if (error instanceof ZodError) {
    error = ApiError.badRequest('Validation failed', formatZodError(error));
  } else if (error instanceof mongoose.Error) {
    error = handleMongooseError(error);
  } else if ((error as { code?: number }).code === 11000) {
    const duplicateField = Object.keys(
      (error as { keyValue?: Record<string, unknown> }).keyValue ?? {},
    )[0];
    error = ApiError.conflict(`${duplicateField ?? 'Field'} already exists`);
  } else if (!(error instanceof ApiError)) {
    logger.error('Unhandled error', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      requestId: req.requestId,
    });
    error = ApiError.internal(
      env.NODE_ENV === 'production' ? 'Internal server error' : (error as Error).message,
    );
  }

  const apiError = error as ApiError;

  if (!apiError.isOperational) {
    logger.error('Non-operational error', {
      statusCode: apiError.statusCode,
      category: apiError.category,
      message: apiError.message,
      requestId: req.requestId,
      stack: apiError.stack,
    });
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    category: apiError.category,
    requestId: req.requestId,
    ...(apiError.errors && { errors: apiError.errors }),
    ...(env.NODE_ENV === 'development' && { stack: apiError.stack }),
  });
};
