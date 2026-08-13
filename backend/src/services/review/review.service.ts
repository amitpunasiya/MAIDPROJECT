import { Review, type IReviewDocument } from '../../models/review.model.js';
import { Rating, type IRatingDocument } from '../../models/rating.model.js';
import { Cook } from '../../models/cook.model.js';
import { Provider } from '../../models/provider.model.js';
import { Booking } from '../../models/booking.model.js';
import { Customer } from '../../models/customer.model.js';
import { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export interface CreateReviewInput {
  bookingId: string;
  customerId: string;
  comment: string;
  scores: {
    overall: number;
    punctuality: number;
    quality: number;
    professionalism: number;
  };
}

export class ReviewService {
  async createReview(input: CreateReviewInput): Promise<{ review: IReviewDocument; rating: IRatingDocument }> {
    const booking = await Booking.findById(input.bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    const statusLower = (booking.status || '').toLowerCase();
    if (statusLower !== 'completed') {
      throw ApiError.badRequest('Cannot review a booking before job completion');
    }

    let customer = await Customer.findOne({ userId: new Types.ObjectId(input.customerId) });
    if (!customer) {
      customer = await Customer.findById(input.customerId);
    }
    const customerIdObj = customer ? customer._id : new Types.ObjectId(input.customerId);

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      throw ApiError.badRequest('Review has already been submitted for this booking');
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: customerIdObj,
      cookId: booking.cookId,
      comment: input.comment,
      isPublished: true,
      publishedAt: new Date(),
    });

    const rating = await Rating.create({
      bookingId: booking._id,
      customerId: customerIdObj,
      cookId: booking.cookId,
      reviewId: review._id,
      scores: input.scores,
    });

    // Update Cook & Provider average rating & total ratings
    await this.updateCookRatingStats(booking.cookId.toString());

    logger.info('Review and rating created', { bookingId: booking._id, cookId: booking.cookId });

    return { review, rating };
  }

  async getCookReviews(cookId: string) {
    return Review.find({ cookId: new Types.ObjectId(cookId), isPublished: true, isDeleted: false })
      .populate('customerId')
      .sort({ createdAt: -1 });
  }

  async getCookRatings(cookId: string) {
    return Rating.find({ cookId: new Types.ObjectId(cookId), isDeleted: false }).sort({ createdAt: -1 });
  }

  private async updateCookRatingStats(cookId: string) {
    const objId = new Types.ObjectId(cookId);
    const ratings = await Rating.find({ cookId: objId, isDeleted: false });
    if (!ratings.length) return;

    const totalRatings = ratings.length;
    const totalScoreSum = ratings.reduce((sum, r) => sum + r.scores.overall, 0);
    const averageRating = Math.round((totalScoreSum / totalRatings) * 10) / 10;

    await Promise.all([
      Cook.findByIdAndUpdate(cookId, { averageRating, totalRatings }).catch(() => null),
      Provider.findByIdAndUpdate(cookId, { averageRating, totalRatings, totalReviews: totalRatings }).catch(() => null),
      Provider.findOneAndUpdate({ userId: objId }, { averageRating, totalRatings, totalReviews: totalRatings }).catch(() => null),
    ]);
  }
}

export const reviewService = new ReviewService();
