import type { Request, Response } from 'express';
import { reviewService } from '../services/review/review.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class ReviewController {
  createReview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { bookingId, comment, scores } = req.body;

    if (!bookingId || !comment || !scores || scores.overall === undefined) {
      throw ApiError.badRequest('bookingId, comment, and scores object are required');
    }

    const result = await reviewService.createReview({
      bookingId,
      customerId: req.user.id,
      comment,
      scores,
    });

    return ApiResponse.created(res, 'Review submitted successfully', result);
  });

  getCookReviews = asyncHandler(async (req: Request, res: Response) => {
    const cookId = String(req.params.cookId || '');
    if (!cookId) throw ApiError.badRequest('cookId parameter is required');

    const reviews = await reviewService.getCookReviews(cookId);
    return ApiResponse.ok(res, 'Cook reviews retrieved', reviews);
  });
}

export const reviewController = new ReviewController();
