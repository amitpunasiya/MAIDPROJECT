import type { Request, Response } from 'express';
import { activityLogService } from '../services/activityLog.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type { ActivityFilterDTO } from '../interfaces/activityLog.interface.js';

export class ActivityLogController {
  getLogs = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const filter = req.query as unknown as ActivityFilterDTO;
    // If not admin, restrict to own logs
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }

    const result = await activityLogService.getLogs(filter);
    return ApiResponse.ok(res, 'Activity logs retrieved successfully', result);
  });
}

export const activityLogController = new ActivityLogController();
