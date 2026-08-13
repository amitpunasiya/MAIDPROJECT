import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().trim().min(2, 'Country name must be at least 2 characters').max(100),
  isoCode: z.string().trim().min(2, 'ISO code must be 2 characters (e.g. IN)').max(3),
  phoneCode: z.string().trim().min(1, 'Phone code is required (e.g. +91)').max(10),
  currency: z.string().trim().min(3, 'Currency code must be 3 characters (e.g. INR)').max(5),
  isActive: z.boolean().optional().default(true),
});

export const updateCountrySchema = createCountrySchema.partial();

export const createStateSchema = z.object({
  countryId: z.string().trim().min(1, 'Country ID is required'),
  name: z.string().trim().min(2, 'State name must be at least 2 characters').max(100),
  code: z.string().trim().min(2, 'State code must be 2 characters (e.g. KA, MH)').max(10),
  isActive: z.boolean().optional().default(true),
});

export const updateStateSchema = createStateSchema.partial();

export const createCitySchema = z.object({
  stateId: z.string().trim().min(1, 'State ID is required'),
  countryId: z.string().trim().optional(),
  name: z.string().trim().min(2, 'City name must be at least 2 characters').max(100),
  slug: z.string().trim().toLowerCase().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCitySchema = createCitySchema.partial();

export const cityQuerySchema = z.object({
  stateId: z.string().optional(),
  countryId: z.string().optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
  sortBy: z.enum(['name', 'createdAt', 'slug']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const citySearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query q is required'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  stateId: z.string().optional(),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type CreateStateInput = z.infer<typeof createStateSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type CityQueryInput = z.infer<typeof cityQuerySchema>;
export type CitySearchQueryInput = z.infer<typeof citySearchQuerySchema>;
