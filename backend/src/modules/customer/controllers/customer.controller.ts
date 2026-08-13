import type { Request, Response } from 'express';
import { customerService } from '../services/customer.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  UpdateCustomerProfileInput,
  CustomerBookingQueryInput,
  CancelBookingInput,
  RescheduleBookingInput,
  RepeatBookingInput,
  CreateCustomerReviewInput,
  UpdateCustomerReviewInput,
  CustomerAddressInput,
  UpdateCustomerAddressInput,
} from '../validators/customer.validator.js';

export class CustomerController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const data = await customerService.getDashboardStats(req.user.id);
    return ApiResponse.ok(res, 'Customer dashboard data retrieved successfully', data);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const profile = await customerService.getProfile(req.user.id);
    return ApiResponse.ok(res, 'Customer profile retrieved successfully', profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdateCustomerProfileInput;
    const profile = await customerService.updateProfile(req.user.id, input);
    return ApiResponse.ok(res, 'Customer profile updated successfully', profile);
  });

  getBookings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const query = req.query as unknown as CustomerBookingQueryInput;
    const result = await customerService.getBookings(req.user.id, query);
    return ApiResponse.ok(res, 'Customer bookings retrieved successfully', result);
  });

  getBookingById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const booking = await customerService.getBookingById(req.user.id, id);
    return ApiResponse.ok(res, 'Booking details retrieved successfully', { booking });
  });

  cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as CancelBookingInput;
    const booking = await customerService.cancelBooking(req.user.id, id, input);
    return ApiResponse.ok(res, 'Booking cancelled successfully', { booking });
  });

  rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as RescheduleBookingInput;
    const booking = await customerService.rescheduleBooking(req.user.id, id, input);
    return ApiResponse.ok(res, 'Booking rescheduled successfully', { booking });
  });

  repeatBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as RepeatBookingInput;
    const booking = await customerService.repeatBooking(req.user.id, id, input);
    return ApiResponse.created(res, 'Repeat booking created successfully', { booking });
  });

  getPayments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await customerService.getPayments(req.user.id);
    return ApiResponse.ok(res, 'Payment history retrieved successfully', result);
  });

  getReviews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await customerService.getReviews(req.user.id);
    return ApiResponse.ok(res, 'Customer reviews retrieved successfully', result);
  });

  createReview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as CreateCustomerReviewInput;
    const review = await customerService.createReview(req.user.id, input);
    return ApiResponse.created(res, 'Review submitted successfully', { review });
  });

  updateReview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateCustomerReviewInput;
    const review = await customerService.updateReview(req.user.id, id, input);
    return ApiResponse.ok(res, 'Review updated successfully', { review });
  });

  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await customerService.deleteReview(req.user.id, id);
    return ApiResponse.ok(res, 'Review deleted successfully');
  });

  getAddresses = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const addresses = await customerService.getAddresses(req.user.id);
    return ApiResponse.ok(res, 'Customer addresses retrieved successfully', { items: addresses, count: addresses.length });
  });

  createAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as CustomerAddressInput;
    const address = await customerService.createAddress(req.user.id, input);
    return ApiResponse.created(res, 'Address created successfully', { address });
  });

  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateCustomerAddressInput;
    const address = await customerService.updateAddress(req.user.id, id, input);
    return ApiResponse.ok(res, 'Address updated successfully', { address });
  });

  deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await customerService.deleteAddress(req.user.id, id);
    return ApiResponse.ok(res, 'Address deleted successfully');
  });

  setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const address = await customerService.setDefaultAddress(req.user.id, id);
    return ApiResponse.ok(res, 'Default address set successfully', { address });
  });

  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await customerService.getNotifications(req.user.id);
    return ApiResponse.ok(res, 'Notifications retrieved successfully', result);
  });

  markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const notification = await customerService.markNotificationRead(req.user.id, id);
    return ApiResponse.ok(res, 'Notification marked as read', { notification });
  });

  markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await customerService.markAllNotificationsRead(req.user.id);
    return ApiResponse.ok(res, 'All notifications marked as read');
  });
}

export const customerController = new CustomerController();
