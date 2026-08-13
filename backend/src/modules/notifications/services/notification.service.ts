import { notificationRepository } from '../repositories/notification.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import type { CreateNotificationDTO, INotificationDocument, NotificationQueryDTO } from '../interfaces/notification.interface.js';
import type { Types } from 'mongoose';

export class NotificationService {
  async sendNotification(input: CreateNotificationDTO): Promise<INotificationDocument> {
    const notification = await notificationRepository.create({
      userId: input.userId as unknown as Types.ObjectId,
      title: input.title,
      message: input.message,
      type: input.type ?? 'system',
      priority: input.priority ?? 'medium',
      channel: input.channel ?? 'in_app',
      metadata: input.metadata || input.data || {},
      data: input.data || input.metadata || {},
      isRead: false,
    });

    logger.info('Notification sent', {
      notificationId: notification._id,
      userId: input.userId,
      type: notification.type,
      priority: notification.priority,
      channel: notification.channel,
    });

    return notification;
  }

  async getUserNotifications(userId: string, queryDto: NotificationQueryDTO = {}, isAdmin = false) {
    const targetUserId = isAdmin ? undefined : userId;
    return notificationRepository.findUserNotifications(targetUserId, queryDto);
  }

  async getUnreadUserNotifications(userId: string) {
    return notificationRepository.findUnreadUserNotifications(userId);
  }

  async markAsRead(id: string, userId: string, isAdmin = false): Promise<INotificationDocument> {
    const targetUserId = isAdmin ? undefined : userId;
    const updated = await notificationRepository.markAsRead(id, targetUserId);
    if (!updated) {
      throw ApiError.notFound('Notification not found');
    }

    logger.info('Notification marked read', { notificationId: id, userId });
    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const count = await notificationRepository.markAllAsRead(userId);
    logger.info('All notifications marked read', { userId, count });
    return { updatedCount: count };
  }

  async deleteNotification(id: string, userId: string, isAdmin = false): Promise<void> {
    const targetUserId = isAdmin ? undefined : userId;
    const deleted = await notificationRepository.deleteNotification(id, targetUserId);
    if (!deleted) {
      throw ApiError.notFound('Notification not found');
    }

    logger.info('Notification deleted', { notificationId: id, userId });
  }

  async clearNotifications(userId: string): Promise<{ clearedCount: number }> {
    const count = await notificationRepository.clearAllNotifications(userId);
    logger.info('All notifications cleared', { userId, count });
    return { clearedCount: count };
  }

  // Auto Notification Trigger Helper Methods
  async notifyBookingCreated(userId: string, bookingId: string, bookingNumber: string) {
    return this.sendNotification({
      userId,
      title: 'Booking Created',
      message: `Your booking request #${bookingNumber} has been successfully created.`,
      type: 'booking_created',
      priority: 'high',
      metadata: { bookingId, bookingNumber },
    });
  }

  async notifyBookingAccepted(userId: string, bookingId: string, bookingNumber: string) {
    return this.sendNotification({
      userId,
      title: 'Booking Accepted',
      message: `Your booking #${bookingNumber} has been accepted by the provider.`,
      type: 'booking_accepted',
      priority: 'high',
      metadata: { bookingId, bookingNumber },
    });
  }

  async notifyBookingCancelled(userId: string, bookingId: string, bookingNumber: string, reason?: string) {
    return this.sendNotification({
      userId,
      title: 'Booking Cancelled',
      message: `Booking #${bookingNumber} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      type: 'booking_cancelled',
      priority: 'high',
      metadata: { bookingId, bookingNumber, reason },
    });
  }

  async notifyBookingCompleted(userId: string, bookingId: string, bookingNumber: string) {
    return this.sendNotification({
      userId,
      title: 'Booking Completed',
      message: `Service for booking #${bookingNumber} has been marked as completed. Please rate your experience!`,
      type: 'booking_completed',
      priority: 'high',
      metadata: { bookingId, bookingNumber },
    });
  }

  async notifyPaymentSuccess(userId: string, paymentId: string, amount: number) {
    return this.sendNotification({
      userId,
      title: 'Payment Successful',
      message: `Payment of ₹${amount} was successful. Invoice generated.`,
      type: 'payment_success',
      priority: 'high',
      metadata: { paymentId, amount },
    });
  }

  async notifyPaymentFailed(userId: string, paymentId: string, reason?: string) {
    return this.sendNotification({
      userId,
      title: 'Payment Failed',
      message: `Payment attempt failed. ${reason || 'Please try again.'}`,
      type: 'payment_failed',
      priority: 'urgent',
      metadata: { paymentId, reason },
    });
  }

  async notifyWalletCredited(userId: string, amount: number, description: string) {
    return this.sendNotification({
      userId,
      title: 'Wallet Credited',
      message: `₹${amount} has been credited to your wallet. (${description})`,
      type: 'wallet_credited',
      priority: 'medium',
      metadata: { amount, description },
    });
  }

  async notifyWalletDebited(userId: string, amount: number, description: string) {
    return this.sendNotification({
      userId,
      title: 'Wallet Debited',
      message: `₹${amount} has been debited from your wallet. (${description})`,
      type: 'wallet_debited',
      priority: 'medium',
      metadata: { amount, description },
    });
  }
}

export const notificationService = new NotificationService();
