import type { Request, Response } from 'express';
import { cookService } from '../services/cook/cook.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  cookSearchQuerySchema,
  type UpdateCookProfileInput,
  type ToggleAvailabilityInput,
} from '../validators/cook.validator.js';

export class CookController {
  getCooks = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = cookSearchQuerySchema.parse(req.query);
    const result = await cookService.searchCooks(validatedQuery);

    return ApiResponse.ok(res, 'Cooks retrieved successfully', result);
  });

  getCookById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const cook = await cookService.getCookById(id);

    return ApiResponse.ok(res, 'Cook profile retrieved successfully', { cook });
  });

  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const cook = await cookService.getCookByUserId(req.user.id);

    return ApiResponse.ok(res, 'Cook profile retrieved successfully', { cook });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as UpdateCookProfileInput;
    const cook = await cookService.updateCookProfile(req.user.id, input);

    return ApiResponse.ok(res, 'Cook profile updated successfully', { cook });
  });

  toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as ToggleAvailabilityInput;
    const cook = await cookService.toggleAvailability(req.user.id, input.isAvailable);

    return ApiResponse.ok(res, `Availability updated to ${cook.isAvailable ? 'available' : 'unavailable'}`, {
      cook,
    });
  });
}

export const cookController = new CookController();
