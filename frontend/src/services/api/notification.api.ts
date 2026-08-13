import { get, patch, del, put } from './helpers';
import { ApiResponse, PaginatedData } from './types';

export interface INotificationData {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'booking' | 'payment' | 'promo' | 'system';
}

export interface INotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  bookingUpdates: boolean;
  promotionalOffers: boolean;
}

export const notificationApi = {
  /**
   * Get user notifications
   * GET /notifications
   */
  getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<PaginatedData<INotificationData>>> {
    return get<PaginatedData<INotificationData>>('/notifications', params);
  },

  /**
   * Mark a notification as read
   * PATCH /notifications/:id/read
   */
  markAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return patch<{ success: boolean }>(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  markAllAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return patch<{ success: boolean }>('/notifications/read-all', {});
  },

  /**
   * Delete a notification
   * DELETE /notifications/:id
   */
  deleteNotification(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return del<{ success: boolean }>(`/notifications/${id}`);
  },

  /**
   * Get user notification preferences
   * GET /notifications/preferences
   */
  getNotificationPreferences(): Promise<ApiResponse<INotificationPreferences>> {
    return get<INotificationPreferences>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   * PUT /notifications/preferences
   */
  updateNotificationPreferences(prefs: Partial<INotificationPreferences>): Promise<ApiResponse<INotificationPreferences>> {
    return put<INotificationPreferences>('/notifications/preferences', prefs);
  },
};

export default notificationApi;
