import type { INotificationDocument } from '../../../models/notification.model.js';

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?:
    | 'booking_created'
    | 'booking_assigned'
    | 'booking_accepted'
    | 'booking_cancelled'
    | 'booking_completed'
    | 'payment_success'
    | 'payment_failed'
    | 'wallet_credited'
    | 'wallet_debited'
    | 'reminder'
    | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channel?: 'push' | 'email' | 'sms' | 'in_app';
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface NotificationQueryDTO {
  isRead?: boolean;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type { INotificationDocument };
