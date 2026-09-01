import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import type { JwtAccessPayload } from '../../types/auth.types.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Access token is required'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      roles: decoded.roles || [decoded.role],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Access token expired'));
      return;
    }
    next(ApiError.unauthorized('Invalid access token'));
  }
};

export const authenticateOptional = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      roles: decoded.roles || [decoded.role],
    };
  } catch {
    // Ignore invalid token for optional auth
  }
  next();
};
