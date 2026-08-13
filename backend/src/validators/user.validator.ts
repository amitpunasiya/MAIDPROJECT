import { z } from 'zod';
import { ServiceType } from '../types/domain.enums.js';

const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Pincode must be a 6-digit number'),
  country: z.string().trim().min(1).max(100).default('India'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

const customerPreferencesSchema = z.object({
  serviceTypes: z.array(z.nativeEnum(ServiceType)).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  preferredLanguages: z.array(z.string()).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
    address: addressSchema.optional(),
    // Customer profile fields
    preferences: customerPreferencesSchema.optional(),
    // Provider (Cook/Maid) profile fields
    bio: z.string().trim().max(1000).optional(),
    experienceYears: z.number().min(0).max(60).optional(),
    hourlyRate: z.number().min(0).optional(),
    serviceTypes: z.array(z.nativeEnum(ServiceType)).optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
