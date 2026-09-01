import type { Request, Response } from 'express';
import { bookingService } from '../services/booking.service.js';
import { providerMatchingService } from '../../../services/booking/providerMatching.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import {
  checkAvailabilityQuerySchema,
  bookingListQuerySchema,
  type CreateBookingInput,
  type UpdateBookingInput,
  type CancelBookingInput,
  type RejectBookingInput,
} from '../validators/booking.validator.js';
import { UserRole } from '../../../types/auth.types.js';

export class BookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : '000000000000000000000001';
    const input = req.body as CreateBookingInput;

    const booking = await bookingService.createBooking(userId, input);

    return ApiResponse.created(res, 'Booking created successfully', { booking });
  });

  matchProviders = asyncHandler(async (req: Request, res: Response) => {
    const { city, latitude, longitude, serviceType, branchId, isEmergency } = req.body;
    const providers = await providerMatchingService.findBestMatchingProviders({
      city: city || 'Bengaluru',
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      serviceType,
      branchId,
      isEmergency: Boolean(isEmergency),
    });

    return ApiResponse.ok(res, 'Best matching providers found', providers);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'guest';
    const userRole = req.user ? req.user.role : 'customer';

    const id = req.params.id as string;
    const input = req.body as UpdateBookingInput;
    const booking = await bookingService.updateBooking(userId, userRole, id, input);

    return ApiResponse.ok(res, 'Booking updated successfully', { booking });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'guest';
    const userRole = req.user ? req.user.role : 'customer';

    const id = req.params.id as string;
    const result = await bookingService.deleteBooking(userId, userRole, id);

    return ApiResponse.ok(res, result.message, result);
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const booking = await bookingService.acceptBooking(req.user.id, id);

    return ApiResponse.ok(res, 'Booking accepted successfully', { booking });
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const input = req.body as RejectBookingInput;
    const booking = await bookingService.rejectBooking(req.user.id, id, input);

    return ApiResponse.ok(res, 'Booking rejected successfully', { booking });
  });

  start = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const booking = await bookingService.startService(req.user.id, id);

    return ApiResponse.ok(res, 'Service started successfully', { booking });
  });

  complete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const booking = await bookingService.completeBooking(req.user.id, id);

    return ApiResponse.ok(res, 'Booking completed successfully', { booking });
  });

  onTheWay = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'provider';
    const id = req.params.id as string;
    const booking = await bookingService.markOnTheWay(userId, id);

    return ApiResponse.ok(res, 'Provider status updated to ON_THE_WAY', { booking });
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'guest';
    const id = req.params.id as string;
    const input = req.body as CancelBookingInput;
    const booking = await bookingService.cancelBooking(
      userId,
      id,
      input.cancellationReason || 'Cancelled by user',
    );

    return ApiResponse.ok(res, 'Booking cancelled successfully', { booking });
  });

  checkAvailability = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = checkAvailabilityQuerySchema.parse(req.query);
    const result = await bookingService.checkAvailability(
      validatedQuery.cookId,
      validatedQuery.date,
      validatedQuery.startTime,
      validatedQuery.endTime,
      validatedQuery.durationHours,
    );

    return ApiResponse.ok(res, result.message, result);
  });

  getUpcoming = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const isProvider = req.user.role === UserRole.COOK || req.user.role === UserRole.MAID;
    const bookings = await bookingService.getUpcomingBookings(req.user.id, isProvider);

    return ApiResponse.ok(res, 'Upcoming bookings retrieved successfully', { bookings });
  });

  getCustomerHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const validatedQuery = bookingListQuerySchema.parse(req.query);
    const result = await bookingService.getCustomerHistory(req.user.id, validatedQuery);

    return ApiResponse.ok(res, 'Customer booking history retrieved successfully', result);
  });

  getCookHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const validatedQuery = bookingListQuerySchema.parse(req.query);
    const result = await bookingService.getCookHistory(req.user.id, validatedQuery);

    return ApiResponse.ok(res, 'Cook booking history retrieved successfully', result);
  });

  getMaidHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const validatedQuery = bookingListQuerySchema.parse(req.query);
    const result = await bookingService.getMaidHistory(req.user.id, validatedQuery);

    return ApiResponse.ok(res, 'Maid booking history retrieved successfully', result);
  });

  search = asyncHandler(async (req: Request, res: Response) => {
    logger.info('[GET /bookings] Route hit & controller entered', { query: req.query, user: req.user });
    const validatedQuery = bookingListQuerySchema.parse(req.query);
    const userRole = req.user ? req.user.role : undefined;
    const userId = req.user ? req.user.id : undefined;

    const isAdmin = userRole === UserRole.ADMIN;
    const isProvider = userRole === UserRole.COOK || userRole === UserRole.MAID || userRole === UserRole.PROVIDER;

    const result = await bookingService.searchBookings(validatedQuery, userId, isProvider, isAdmin);

    logger.info('[GET /bookings] Response returned successfully', { total: result.total, count: result.bookings.length });
    return ApiResponse.ok(res, 'Bookings retrieved successfully', result);
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const validatedQuery = bookingListQuerySchema.parse(req.query);
    const isProvider = req.user.role === UserRole.COOK || req.user.role === UserRole.MAID;
    const result = await bookingService.getBookingHistory(
      req.user.id,
      isProvider,
      validatedQuery,
    );

    return ApiResponse.ok(res, 'Booking history retrieved successfully', result);
  });

  getTimeline = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'guest';
    const userRole = req.user ? req.user.role : undefined;
    const id = req.params.id as string;
    const timeline = await bookingService.getBookingTimeline(id, userId, userRole);

    return ApiResponse.ok(res, 'Booking status timeline retrieved successfully', { timeline });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'guest';
    const userRole = req.user ? req.user.role : undefined;

    const id = req.params.id as string;
    const booking = await bookingService.getBookingById(id, userId, userRole);

    return ApiResponse.ok(res, 'Booking details retrieved successfully', { booking });
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.user ? req.user.id : 'admin';
    const id = req.params.id as string;
    const { providerId, cookId } = req.body;
    const targetProviderId = providerId || cookId;

    if (!targetProviderId) {
      throw ApiError.badRequest('Provider ID (providerId or cookId) is required');
    }

    const booking = await bookingService.assignProvider(adminId, id, targetProviderId);

    return ApiResponse.ok(res, 'Provider assigned successfully to booking', { booking });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'admin';
    const userRole = req.user ? req.user.role : 'admin';

    const id = req.params.id as string;
    const { status, notes, reason } = req.body;

    if (!status) {
      throw ApiError.badRequest('Booking status is required');
    }

    const booking = await bookingService.updateBookingStatus(
      userId,
      userRole,
      id,
      status,
      notes || reason,
    );

    return ApiResponse.ok(res, `Booking status updated to ${status} successfully`, { booking });
  });

  createRecurring = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await bookingService.createRecurringBooking(req.user.id, req.body);
    return ApiResponse.created(res, 'Recurring booking schedule created', result);
  });

  getRecurring = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user ? req.user.id : undefined;
    const result = await bookingService.getRecurringBookings(customerId);
    return ApiResponse.ok(res, 'Recurring booking schedules retrieved', result);
  });

  pauseRecurring = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const result = await bookingService.pauseRecurringBooking(id, req.user.id);
    return ApiResponse.ok(res, 'Recurring booking paused', result);
  });

  resumeRecurring = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const result = await bookingService.resumeRecurringBooking(id, req.user.id);
    return ApiResponse.ok(res, 'Recurring booking resumed', result);
  });

  cancelRecurring = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const result = await bookingService.cancelRecurringBooking(id, req.user.id);
    return ApiResponse.ok(res, 'Recurring booking cancelled', result);
  });

  markArrived = asyncHandler(async (req: Request, res: Response) => {
    const providerId = req.user ? req.user.id : 'provider';
    const id = req.params.id as string;
    const booking = await bookingService.markArrived(providerId, id);
    return ApiResponse.ok(res, 'Marked arrival successfully. Waiting for customer OTP.', { booking });
  });

  verifyStartOtp = asyncHandler(async (req: Request, res: Response) => {
    const providerId = req.user ? req.user.id : 'provider';
    const id = req.params.id as string;
    const { otp } = req.body;
    const booking = await bookingService.verifyStartOtp(providerId, id, otp);
    return ApiResponse.ok(res, 'OTP verified successfully. Job started.', { booking });
  });

  updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const providerId = req.user ? req.user.id : 'provider';
    const id = req.params.id as string;
    const { latitude, longitude } = req.body;
    const booking = await bookingService.updateProviderLocation(providerId, id, Number(latitude), Number(longitude));
    return ApiResponse.ok(res, 'Provider location and ETA updated successfully', { booking });
  });

  getStartOtp = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user.id : 'admin';
    const id = req.params.id as string;
    const otpData = await bookingService.getStartOtpForCustomer(id, userId);
    return ApiResponse.ok(res, 'Start OTP retrieved successfully', otpData);
  });
}

export const bookingController = new BookingController();
