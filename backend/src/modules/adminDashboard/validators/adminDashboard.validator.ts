import { z } from 'zod';

export const adminQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.string().optional(),
  role: z.string().optional(),
  city: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const assignProviderSchema = z.object({
  providerId: z.string().trim().min(1, 'Provider ID (cookId/maidId) is required'),
});

export const updateBookingStatusSchema = z.object({
  status: z.string().trim().min(1, 'Status is required'),
  note: z.string().trim().optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason is required'),
});

export const refundBookingSchema = z.object({
  refundAmount: z.number().min(0, 'Refund amount must be non-negative'),
  reason: z.string().trim().min(3, 'Refund reason is required'),
});

export const updateUserSettingsSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updatePlatformSettingsSchema = z.object({
  platformName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
  platformCommissionPercentage: z.number().min(0).max(100).optional(),
  cancellationFee: z.number().min(0).optional(),
  autoAssignProviders: z.boolean().optional(),
  maxSearchRadiusKm: z.number().min(1).max(200).optional(),
  paymentGateways: z
    .object({
      razorpayEnabled: z.boolean().optional(),
      stripeEnabled: z.boolean().optional(),
      codEnabled: z.boolean().optional(),
    })
    .optional(),
  notifications: z
    .object({
      emailEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      whatsappEnabled: z.boolean().optional(),
    })
    .optional(),
});

export const broadcastNotificationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  body: z.string().trim().min(1, 'Body is required'),
  targetRole: z.enum(['all', 'customer', 'cook', 'maid', 'provider']).optional().default('all'),
});

export type AdminQueryInput = z.infer<typeof adminQuerySchema>;
export type AssignProviderInput = z.infer<typeof assignProviderSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RefundBookingInput = z.infer<typeof refundBookingSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;
export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
