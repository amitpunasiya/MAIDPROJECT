import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getDatabaseStatus = (): 'connected' | 'disconnected' | 'connecting' | 'disconnecting' => {
  const states: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] ?? 'disconnected';
};

export class HealthController {
  check = asyncHandler(async (_req: Request, res: Response) => {
    const database = getDatabaseStatus();
    const isHealthy = database === 'connected';

    const payload = {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database,
      version: 'v1',
    };

    if (isHealthy) {
      ApiResponse.ok(res, 'API is healthy', payload);
      return;
    }

    ApiResponse.success(res, 503, 'API is degraded', payload);
  });

  liveness = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.ok(res, 'Process alive', {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  readiness = asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      return ApiResponse.ok(res, 'Application ready', {
        status: 'ready',
        database: 'connected',
        memoryUsage: process.memoryUsage(),
      });
    }
    return ApiResponse.success(res, 503, 'Application not ready', {
      status: 'not_ready',
      database: 'disconnected',
    });
  });
}

export const healthController = new HealthController();
