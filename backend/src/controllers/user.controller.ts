import type { Request, Response } from 'express';
import { userService } from '../services/user/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';

export class UserController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const user = await userService.getProfile(req.user.id);

    return ApiResponse.ok(res, 'Profile retrieved successfully', { user });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as UpdateProfileInput;
    const user = await userService.updateProfile(req.user.id, input);

    return ApiResponse.ok(res, 'Profile updated successfully', { user });
  });

  uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!req.file) {
      throw ApiError.badRequest('Please upload an image file');
    }

    const result = await userService.uploadAvatar(req.user.id, req.file.buffer);

    return ApiResponse.ok(res, 'Avatar uploaded successfully', result);
  });
}

export const userController = new UserController();
