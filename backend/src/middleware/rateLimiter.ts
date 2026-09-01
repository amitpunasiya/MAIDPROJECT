import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const rateLimitHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.tooManyRequests('Too many requests, please try again later'));
};

const isDev = env.NODE_ENV === 'development';

// In development mode, use a higher ceiling (min 1000 for global, 100 for auth) to accommodate Admin UI & HMR
const globalMax = isDev ? Math.max(env.RATE_LIMIT_MAX_REQUESTS, 1000) : env.RATE_LIMIT_MAX_REQUESTS;
const authMax = isDev ? Math.max(env.AUTH_RATE_LIMIT_MAX_REQUESTS, 100) : env.AUTH_RATE_LIMIT_MAX_REQUESTS;

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

