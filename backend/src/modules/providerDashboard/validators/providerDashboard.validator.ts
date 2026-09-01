import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional(),
  experienceYears: z.number().min(0).max(60).optional(),
  languages: z.array(z.string().trim()).optional(),
  skills: z.array(z.string().trim()).optional(),
  bio: z.string().trim().max(2000).optional(),
  documents: z
    .object({
      aadhaarNumber: z.string().trim().optional(),
      aadhaarDoc: z.string().trim().optional(),
      panNumber: z.string().trim().optional(),
      panDoc: z.string().trim().optional(),
      profilePhotoDoc: z.string().trim().optional(),
      selfiePhotoDoc: z.string().trim().optional(),
      policeVerificationDoc: z.string().trim().optional(),
    })
    .optional(),
  bankDetails: z
    .object({
      accountName: z.string().trim().optional(),
      accountNumber: z.string().trim().optional(),
      bankName: z.string().trim().optional(),
      ifscCode: z.string().trim().optional(),
      upiId: z.string().trim().optional(),
    })
    .optional(),
});

export const providerBookingQuerySchema = z.object({
  status: z.string().optional(),
  serviceType: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const rejectBookingSchema = z.object({
  rejectionReason: z.string().trim().min(3, 'Rejection reason is required').optional().default('Provider unavailable'),
});

export const completeBookingSchema = z.object({
  completionPhoto: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean().optional(),
  schedule: z
    .array(
      z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        isWorking: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      }),
    )
    .optional(),
  holidaySupport: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  currentAddress: z.string().trim().optional(),
});

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
export type ProviderBookingQueryInput = z.infer<typeof providerBookingQuerySchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
