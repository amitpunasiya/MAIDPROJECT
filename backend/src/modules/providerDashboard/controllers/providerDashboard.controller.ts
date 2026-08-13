import type { Request, Response } from 'express';
import { providerDashboardService } from '../services/providerDashboard.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  UpdateProviderProfileInput,
  ProviderBookingQueryInput,
  RejectBookingInput,
  CompleteBookingInput,
  UpdateAvailabilityInput,
  UpdateLocationInput,
} from '../validators/providerDashboard.validator.js';

export class ProviderDashboardController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const data = await providerDashboardService.getDashboard(req.user.id);
    return ApiResponse.ok(res, 'Provider dashboard data retrieved successfully', data);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await providerDashboardService.getProfile(req.user.id);
    return ApiResponse.ok(res, 'Provider profile retrieved successfully', profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdateProviderProfileInput;
    const provider = await providerDashboardService.updateProfile(req.user.id, input);
    return ApiResponse.ok(res, 'Provider profile updated successfully', { provider });
  });

  getBookings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const query = req.query as unknown as ProviderBookingQueryInput;
    const result = await providerDashboardService.getBookings(req.user.id, query);
    return ApiResponse.ok(res, 'Provider bookings retrieved successfully', result);
  });

  getTodayBookings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await providerDashboardService.getTodayBookings(req.user.id);
    return ApiResponse.ok(res, "Today's bookings retrieved successfully", result);
  });

  getUpcomingBookings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await providerDashboardService.getUpcomingBookings(req.user.id);
    return ApiResponse.ok(res, 'Upcoming bookings retrieved successfully', result);
  });

  acceptBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const booking = await providerDashboardService.acceptBooking(req.user.id, id);
    return ApiResponse.ok(res, 'Booking accepted successfully', { booking });
  });

  rejectBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as RejectBookingInput;
    const booking = await providerDashboardService.rejectBooking(req.user.id, id, input);
    return ApiResponse.ok(res, 'Booking rejected successfully', { booking });
  });

  markOnTheWay = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const booking = await providerDashboardService.markOnTheWay(req.user.id, id);
    return ApiResponse.ok(res, 'Provider marked as on the way', { booking });
  });

  markReached = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const booking = await providerDashboardService.markReached(req.user.id, id);
    return ApiResponse.ok(res, 'Provider reached location', { booking });
  });

  startService = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const booking = await providerDashboardService.startService(req.user.id, id);
    return ApiResponse.ok(res, 'Service started successfully', { booking });
  });

  completeService = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as CompleteBookingInput;
    const booking = await providerDashboardService.completeService(req.user.id, id, input);
    return ApiResponse.ok(res, 'Service completed successfully', { booking });
  });

  getEarnings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const earnings = await providerDashboardService.getEarnings(req.user.id);
    return ApiResponse.ok(res, 'Provider earnings retrieved successfully', earnings);
  });

  getReviews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await providerDashboardService.getReviews(req.user.id);
    return ApiResponse.ok(res, 'Provider reviews retrieved successfully', result);
  });

  updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdateAvailabilityInput;
    const provider = await providerDashboardService.updateAvailability(req.user.id, input);
    return ApiResponse.ok(res, 'Provider availability updated successfully', { provider });
  });

  updateLocation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdateLocationInput;
    const location = await providerDashboardService.updateLocation(req.user.id, input);
    return ApiResponse.ok(res, 'Provider live location updated successfully', { location });
  });

  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const stats = await providerDashboardService.getStatistics(req.user.id);
    return ApiResponse.ok(res, 'Provider statistics retrieved successfully', { statistics: stats });
  });
}

export const providerDashboardController = new ProviderDashboardController();
