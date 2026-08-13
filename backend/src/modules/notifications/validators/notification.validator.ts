import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().trim().min(1, 'User ID is required'),
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message is required'),
  type: z
    .enum([
      'booking_created',
      'booking_assigned',
      'booking_accepted',
      'booking_cancelled',
      'booking_completed',
      'payment_success',
      'payment_failed',
      'wallet_credited',
      'wallet_debited',
      'reminder',
      'system',
    ])
    .optional()
    .default('system'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  channel: z.enum(['push', 'email', 'sms', 'in_app']).optional().default('in_app'),
  metadata: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
});

export const notificationQuerySchema = z.object({
  isRead: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'priority', 'type']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
