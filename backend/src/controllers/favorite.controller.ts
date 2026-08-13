import type { Request, Response } from 'express';
import { favoriteService } from '../services/favorite/favorite.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class FavoriteController {
  add = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const { itemType, targetId } = req.body;
    if (!itemType || !targetId) throw ApiError.badRequest('itemType and targetId are required');

    const favorite = await favoriteService.addFavorite(req.user.id, itemType, String(targetId));
    return ApiResponse.created(res, 'Item saved to favorites', favorite);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const { itemType, targetId } = req.body;
    if (!itemType || !targetId) throw ApiError.badRequest('itemType and targetId are required');

    await favoriteService.removeFavorite(req.user.id, itemType, String(targetId));
    return ApiResponse.ok(res, 'Item removed from favorites');
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const favorites = await favoriteService.getFavorites(req.user.id);
    return ApiResponse.ok(res, 'Saved favorites retrieved successfully', favorites);
  });
}

export const favoriteController = new FavoriteController();
