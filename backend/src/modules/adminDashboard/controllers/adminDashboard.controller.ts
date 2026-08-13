import type { Request, Response } from 'express';
import { adminDashboardService } from '../services/adminDashboard.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  AdminQueryInput,
  AssignProviderInput,
  UpdateBookingStatusInput,
  CancelBookingInput,
  RefundBookingInput,
  UpdateUserSettingsInput,
  UpdatePlatformSettingsInput,
  BroadcastNotificationInput,
} from '../validators/adminDashboard.validator.js';

export class AdminDashboardController {
  getOverview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminDashboardService.getDashboardOverview();
    return ApiResponse.ok(res, 'Admin dashboard overview retrieved successfully', data);
  });

  getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminDashboardService.getAnalytics();
    return ApiResponse.ok(res, 'Admin analytics data retrieved successfully', data);
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminQueryInput;
    const result = await adminDashboardService.getUsers(query);
    return ApiResponse.ok(res, 'Users retrieved successfully', result);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateUserSettingsInput;
    const user = await adminDashboardService.updateUser(id, input, req.user.id);
    return ApiResponse.ok(res, 'User updated successfully', { user });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await adminDashboardService.deleteUser(id, req.user.id);
    return ApiResponse.ok(res, 'User deleted successfully');
  });

  getBookings = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AdminQueryInput;
    const result = await adminDashboardService.getBookings(query);
    return ApiResponse.ok(res, 'Bookings retrieved successfully', result);
  });

  getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const booking = await adminDashboardService.getBookingById(id);
    return ApiResponse.ok(res, 'Booking details retrieved successfully', { booking });
  });

  assignProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as AssignProviderInput;
    const booking = await adminDashboardService.assignProvider(id, input, req.user.id);
    return ApiResponse.ok(res, 'Provider assigned to booking successfully', { booking });
  });

  updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateBookingStatusInput;
    const booking = await adminDashboardService.updateBookingStatus(id, input, req.user.id);
    return ApiResponse.ok(res, 'Booking status updated successfully', { booking });
  });

  cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as CancelBookingInput;
    const booking = await adminDashboardService.cancelBooking(id, input, req.user.id);
    return ApiResponse.ok(res, 'Booking cancelled successfully', { booking });
  });

  refundBooking = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as RefundBookingInput;
    const result = await adminDashboardService.refundBooking(id, input, req.user.id);
    return ApiResponse.ok(res, 'Booking refund issued successfully', result);
  });

  broadcastNotification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as BroadcastNotificationInput;
    const result = await adminDashboardService.broadcastNotification(input, req.user.id);
    return ApiResponse.ok(res, 'Broadcast notification dispatched successfully', result);
  });

  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await adminDashboardService.getPlatformSettings();
    return ApiResponse.ok(res, 'Platform settings retrieved successfully', { settings });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as UpdatePlatformSettingsInput;
    const settings = await adminDashboardService.updatePlatformSettings(input, req.user.id);
    return ApiResponse.ok(res, 'Platform settings updated successfully', { settings });
  });

  exportReportCsv = asyncHandler(async (req: Request, res: Response) => {
    const reportType = (req.query.type as string) || 'revenue';
    const csv = await adminDashboardService.exportCsvReport(reportType);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
    return res.status(200).send(csv);
  });
}

export const adminDashboardController = new AdminDashboardController();
