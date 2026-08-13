import type { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import { UserRole } from '../../../types/auth.types.js';
import type { NotificationQueryInput } from '../validators/notification.validator.js';

export class NotificationController {
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const query = req.query as unknown as NotificationQueryInput;
    const isAdmin = req.user.role === UserRole.ADMIN || (req.user.role as string) === UserRole.SUPER_ADMIN;

    const result = await notificationService.getUserNotifications(req.user.id, query, isAdmin);
    return ApiResponse.ok(res, 'Notifications retrieved successfully', result);
  });

  getUnread = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const result = await notificationService.getUnreadUserNotifications(req.user.id);
    return ApiResponse.ok(res, 'Unread notifications retrieved successfully', result);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const isAdmin = req.user.role === UserRole.ADMIN || (req.user.role as string) === UserRole.SUPER_ADMIN;

    const notification = await notificationService.markAsRead(id, req.user.id, isAdmin);
    return ApiResponse.ok(res, 'Notification marked as read', { notification });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const result = await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.ok(res, 'All notifications marked as read', result);
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const isAdmin = req.user.role === UserRole.ADMIN || (req.user.role as string) === UserRole.SUPER_ADMIN;

    await notificationService.deleteNotification(id, req.user.id, isAdmin);
    return ApiResponse.ok(res, 'Notification deleted successfully');
  });

  clearNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const result = await notificationService.clearNotifications(req.user.id);
    return ApiResponse.ok(res, 'All notifications cleared successfully', result);
  });
}

export const notificationController = new NotificationController();
