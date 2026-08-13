import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ActivityLog } from '../models/activityLog.model.js';

export interface PerformanceMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTimeMs: number;
  activeConnections: number;
}

let requestCount = 0;
let errorCount = 0;
let totalDurationMs = 0;

/**
 * Mongo Query Sanitization Middleware to strip $ and . operators from input params/body
 */
export const mongoSanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Performance metrics tracker middleware
 */
export const performanceMetricsMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  requestCount++;

  const originalWriteHead = res.writeHead;
  res.writeHead = function (this: Response, ...args: any[]) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalWriteHead.apply(this, args as any);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    totalDurationMs += duration;
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });

  next();
};

/**
 * Audit log recording middleware for state-changing HTTP requests
 */
export const auditLogMiddleware = (action: string, moduleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await ActivityLog.create({
            userId: req.user.id,
            action,
            module: moduleName,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: { method: req.method, url: req.originalUrl },
          });
        } catch (err) {
          logger.warn('Failed to record audit log', { err });
        }
      }
    });
    next();
  };
};

export const getSystemMetrics = (): PerformanceMetrics => {
  return {
    totalRequests: requestCount,
    totalErrors: errorCount,
    averageResponseTimeMs: requestCount > 0 ? Math.round(totalDurationMs / requestCount) : 0,
    activeConnections: Math.max(0, requestCount - errorCount),
  };
};
