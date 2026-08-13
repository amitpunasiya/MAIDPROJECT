import { z } from 'zod';

export const updateMaidProfileSchema = z
  .object({
    bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').optional(),
    experienceYears: z
      .number()
      .min(0, 'Experience years cannot be negative')
      .max(60, 'Experience years cannot exceed 60')
      .optional(),
    services: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one service is required')
      .optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
    languages: z.array(z.string().trim().min(1)).optional(),
    hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').optional(),
    currency: z.string().trim().default('INR').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for profile update',
  });

export const toggleMaidAvailabilitySchema = z.object({
  isAvailable: z.boolean().optional(),
});

export const maidSearchQuerySchema = z.object({
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  service: z.string().trim().optional(),
  minExperience: z.coerce.number().min(0).optional(),
  maxExperience: z.coerce.number().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isAvailable: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z
    .enum(['averageRating', 'hourlyRate', 'experienceYears', 'createdAt'])
    .default('averageRating'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type UpdateMaidProfileInput = z.infer<typeof updateMaidProfileSchema>;
export type ToggleMaidAvailabilityInput = z.infer<typeof toggleMaidAvailabilitySchema>;
export type MaidSearchQueryInput = z.infer<typeof maidSearchQuerySchema>;
