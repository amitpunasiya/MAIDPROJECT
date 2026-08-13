import { z } from 'zod';

const optionalUrl = z.string().url('Invalid URL format').or(z.literal('')).optional();
const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/;

export const updateGlobalSettingsSchema = z.object({
  general: z
    .object({
      appName: z.string().trim().min(1, 'App name is required').optional(),
      companyName: z.string().trim().min(1, 'Company name is required').optional(),
      supportEmail: z.string().email('Invalid email address').optional(),
      supportPhone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
      logoUrl: optionalUrl,
      faviconUrl: optionalUrl,
      defaultLanguage: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),

  booking: z
    .object({
      bookingRadiusKm: z.number().min(1, 'Booking radius must be at least 1 km').optional(),
      cancellationTimeHours: z.number().min(0, 'Cancellation time cannot be negative').optional(),
      rescheduleLimit: z.number().min(0, 'Reschedule limit cannot be negative').optional(),
      autoAssignProvider: z.boolean().optional(),
      bookingExpiryMinutes: z.number().min(1, 'Booking expiry must be at least 1 minute').optional(),
    })
    .optional(),

  payment: z
    .object({
      razorpayKeyId: z.string().optional(),
      razorpayKeySecret: z.string().optional(),
      platformCommissionPercentage: z.number().min(0).max(100, 'Commission must be between 0 and 100%').optional(),
      gstPercentage: z.number().min(0).max(100, 'GST percentage must be between 0 and 100%').optional(),
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
      walletEnabled: z.boolean().optional(),
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

  security: z
    .object({
      jwtExpiry: z.string().optional(),
      refreshTokenExpiry: z.string().optional(),
      otpExpiryMinutes: z.number().min(1, 'OTP expiry must be at least 1 minute').optional(),
      maxLoginAttempts: z.number().min(1, 'Max login attempts must be at least 1').optional(),
    })
    .optional(),

  maintenance: z
    .object({
      maintenanceMode: z.boolean().optional(),
      maintenanceMessage: z.string().optional(),
    })
    .optional(),

  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      youtube: optionalUrl,
      linkedin: optionalUrl,
      twitter: optionalUrl,
    })
    .optional(),
});

export type UpdateGlobalSettingsInput = z.infer<typeof updateGlobalSettingsSchema>;
