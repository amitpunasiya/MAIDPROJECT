import { z } from 'zod';

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
  preferences: z
    .object({
      serviceTypes: z.array(z.string()).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      preferredLanguages: z.array(z.string()).optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export const customerBookingQuerySchema = z.object({
  status: z.string().optional(),
  tab: z.enum(['upcoming', 'active', 'history', 'all']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
});

export const rescheduleBookingSchema = z.object({
  startDate: z.string().or(z.date()),
  timeSlot: z.string().trim().optional(),
});

export const repeatBookingSchema = z.object({
  startDate: z.string().or(z.date()),
  timeSlot: z.string().trim().optional(),
});

export const createCustomerReviewSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  rating: z.number().min(1).max(5).optional().default(5),
  comment: z.string().trim().min(5, 'Comment must be at least 5 characters').max(2000),
});

export const updateCustomerReviewSchema = z.object({
  comment: z.string().trim().min(5, 'Comment must be at least 5 characters').max(2000),
});

export const customerAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  mobile: z.string().trim().min(10, 'Mobile is required'),
  houseNo: z.string().trim().min(1, 'House/Flat number is required'),
  floor: z.string().trim().optional().default(''),
  landmark: z.string().trim().optional().default(''),
  addressLine1: z.string().trim().min(3, 'Address Line 1 is required'),
  addressLine2: z.string().trim().optional().default(''),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().optional().default('India'),
  pincode: z.string().trim().min(6, 'Valid 6-digit Pincode is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  addressType: z.enum(['Home', 'Office', 'Other']).optional().default('Home'),
  isDefault: z.boolean().optional().default(false),
});

export const updateCustomerAddressSchema = customerAddressSchema.partial();

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type CustomerBookingQueryInput = z.infer<typeof customerBookingQuerySchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type RepeatBookingInput = z.infer<typeof repeatBookingSchema>;
export type CreateCustomerReviewInput = z.infer<typeof createCustomerReviewSchema>;
export type UpdateCustomerReviewInput = z.infer<typeof updateCustomerReviewSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>;
