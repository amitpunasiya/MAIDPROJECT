import type { Request, Response } from 'express';
import { settingsService } from '../services/settings.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type { UpdateGlobalSettingsInput } from '../validators/settings.validator.js';

export class SettingsController {
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    return ApiResponse.ok(res, 'Global platform settings retrieved successfully', { settings });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdateGlobalSettingsInput;
    const settings = await settingsService.updateSettings(input, req.user.id);
    return ApiResponse.ok(res, 'Global platform settings updated successfully', { settings });
  });
}

export const settingsController = new SettingsController();
