import type { Request, Response } from 'express';
import { searchService } from '../services/search/search.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class SearchController {
  search = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const type = (req.query.type as string) || 'all';
    const providerType = req.query.providerType as string;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (!q || q.trim().length < 2) {
      return ApiResponse.ok(res, 'Search query must be at least 2 characters', {
        providers: [],
        services: [],
        tasks: [],
        locations: [],
      });
    }

    const results = await searchService.globalSearch({
      q,
      type,
      providerType,
      minRating,
      lat,
      lng,
      limit,
    });

    return ApiResponse.ok(res, 'Global search results retrieved', results);
  });
}

export const searchController = new SearchController();
