import type { Request, Response } from 'express';
import { maidService } from '../services/maid/maid.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  maidSearchQuerySchema,
  type UpdateMaidProfileInput,
  type ToggleMaidAvailabilityInput,
} from '../validators/maid.validator.js';

export class MaidController {
  getMaids = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = maidSearchQuerySchema.parse(req.query);
    const result = await maidService.searchMaids(validatedQuery);

    return ApiResponse.ok(res, 'Maids retrieved successfully', result);
  });

  getMaidById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const maid = await maidService.getMaidById(id);

    return ApiResponse.ok(res, 'Maid profile retrieved successfully', { maid });
  });

  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const maid = await maidService.getMaidByUserId(req.user.id);

    return ApiResponse.ok(res, 'Maid profile retrieved successfully', { maid });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as UpdateMaidProfileInput;
    const maid = await maidService.updateMaidProfile(req.user.id, input);

    return ApiResponse.ok(res, 'Maid profile updated successfully', { maid });
  });

  toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as ToggleMaidAvailabilityInput;
    const maid = await maidService.toggleAvailability(req.user.id, input.isAvailable);

    return ApiResponse.ok(
      res,
      `Availability updated to ${maid.isAvailable ? 'available' : 'unavailable'}`,
      { maid },
    );
  });
}

export const maidController = new MaidController();
