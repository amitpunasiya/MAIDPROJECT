import { z } from 'zod';

export const providerServiceItemSchema = z.object({
  serviceName: z.string().trim().min(1, 'Service name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.string().trim().optional().default('1 hour'),
  category: z.string().trim().optional().default('General'),
  description: z.string().trim().optional().default(''),
});

export const dayScheduleSchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorking: z.boolean().optional().default(true),
  startTime: z.string().trim().optional().default('08:00'),
  endTime: z.string().trim().optional().default('18:00'),
  breakStartTime: z.string().trim().optional().default('13:00'),
  breakEndTime: z.string().trim().optional().default('14:00'),
});

export const providerLocationSchema = z.object({
  country: z.string().trim().optional().default('India'),
  state: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  currentAddress: z.string().trim().optional().default(''),
  workingAreas: z.array(z.string().trim()).optional().default([]),
  latitude: z.number().min(-90).max(90).optional().default(0),
  longitude: z.number().min(-180).max(180).optional().default(0),
  serviceRadiusKm: z.number().min(1).max(100).optional().default(10),
});

export const providerPricingSchema = z.object({
  hourlyPrice: z.number().min(0, 'Hourly price must be positive').optional().default(100),
  dailyPrice: z.number().min(0).optional().default(800),
  visitCharge: z.number().min(0).optional().default(150),
  emergencyCharge: z.number().min(0).optional().default(250),
  currency: z.string().trim().optional().default('INR'),
});

export const bankDetailsSchema = z.object({
  accountName: z.string().trim().optional().default(''),
  accountNumber: z.string().trim().optional().default(''),
  bankName: z.string().trim().optional().default(''),
  ifscCode: z.string().trim().optional().default(''),
  upiId: z.string().trim().optional().default(''),
});

export const providerDocsSchema = z.object({
  aadhaarNumber: z.string().trim().optional().default(''),
  aadhaarDoc: z.string().trim().optional().default(''),
  panNumber: z.string().trim().optional().default(''),
  panDoc: z.string().trim().optional().default(''),
  profilePhotoDoc: z.string().trim().optional().default(''),
  selfiePhotoDoc: z.string().trim().optional().default(''),
  certificates: z.array(z.string().trim()).optional().default([]),
  experienceDocs: z.array(z.string().trim()).optional().default([]),
  policeVerificationDoc: z.string().trim().optional().default(''),
});

export const createProviderSchema = z.object({
  userId: z.string().trim().optional(),
  providerType: z.enum(['cook', 'maid', 'babysitter', 'eldercare', 'cleaning', 'physiotherapist', 'occupational_therapist', 'other']).default('cook'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().default('unspecified'),
  dob: z.string().or(z.date()).optional(),
  profilePhoto: z.string().trim().optional().default(''),
  qualification: z.string().trim().optional().default(''),
  specializations: z.array(z.string().trim()).optional().default([]),
  homeVisitAvailability: z.boolean().optional().default(true),
  consultationFee: z.number().min(0).optional().default(500),
  experienceYears: z.number().min(0).max(60).optional().default(0),
  languages: z.array(z.string().trim()).optional().default([]),
  skills: z.array(z.string().trim()).optional().default([]),
  bio: z.string().trim().max(2000).optional().default(''),
  location: providerLocationSchema.optional(),
  services: z.array(providerServiceItemSchema).optional().default([]),
  schedule: z.array(dayScheduleSchema).optional().default([]),
  holidaySupport: z.boolean().optional().default(false),
  pricing: providerPricingSchema.optional(),
  documents: providerDocsSchema.optional(),
  bankDetails: bankDetailsSchema.optional(),
  kycStatus: z.enum(['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'RESUBMISSION_REQUESTED', 'unverified', 'pending', 'approved', 'rejected', 'suspended']).optional().default('NOT_SUBMITTED'),
});

export const updateProviderSchema = createProviderSchema.partial();

export const submitKycSchema = z.object({
  aadhaarNumber: z.string().trim().min(12, 'Aadhaar number must be 12 digits').max(14),
  aadhaarDoc: z.string().trim().min(1, 'Aadhaar document image/PDF is required'),
  panNumber: z.string().trim().min(10, 'PAN number must be 10 characters').max(10),
  panDoc: z.string().trim().min(1, 'PAN document image/PDF is required'),
  qualification: z.string().trim().optional(),
  specializations: z.array(z.string().trim()).optional(),
});

export const verifyKycSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_resubmission']),
  rejectionReason: z.string().trim().optional(),
});

export const providerQuerySchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  providerType: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  kycStatus: z.enum(['unverified', 'pending', 'approved', 'rejected', 'suspended']).optional(),
  minExperience: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isAvailable: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'averageRating', 'experienceYears', 'pricing.hourlyPrice', 'fullName']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const providerNearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).optional().default(10),
  providerType: z.string().optional(),
  isAvailable: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const addGalleryItemSchema = z.object({
  url: z.string().trim().min(1, 'Image URL is required'),
  caption: z.string().trim().optional().default(''),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ProviderQueryInput = z.infer<typeof providerQuerySchema>;
export type ProviderNearbyQueryInput = z.infer<typeof providerNearbyQuerySchema>;
export type ToggleAvailabilityInput = z.infer<typeof toggleAvailabilitySchema>;
export type AddGalleryItemInput = z.infer<typeof addGalleryItemSchema>;

export const providerMatchQuerySchema = z.object({
  taskName: z.string().trim().optional(),
  serviceType: z.string().trim().optional(),
  date: z.string().trim().optional(),
  startTime: z.string().trim().optional(),
  durationHours: z.coerce.number().min(0.5).max(24).optional().default(1),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().trim().optional(),
  sortBy: z.enum(['recommended', 'nearest', 'highest_rated', 'lowest_price']).optional().default('recommended'),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export const updateSkillsSchema = z.object({
  skills: z.array(z.string().trim()),
});

export type ProviderMatchQueryInput = z.infer<typeof providerMatchQuerySchema>;
export type UpdateSkillsInput = z.infer<typeof updateSkillsSchema>;
