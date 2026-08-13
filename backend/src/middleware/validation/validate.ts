import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../../utils/ApiError.js';

type RequestPart = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[part] = result.data;
    next();
  };

export const validateMultiple =
  (schemas: Partial<Record<RequestPart, ZodSchema>>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    for (const [part, schema] of Object.entries(schemas) as [RequestPart, ZodSchema][]) {
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        next(result.error);
        return;
      }
      req[part] = result.data;
    }
    next();
  };

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(ApiError.unauthorized());
    return;
  }
  next();
};
