import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;
const pincodeRegex = /^\d{6}$/;

export const createAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  mobile: z
    .string()
    .trim()
    .regex(phoneRegex, 'Invalid mobile number format'),
  houseNo: z.string().trim().min(1, 'House/Flat number is required').max(100),
  floor: z.string().trim().max(50).optional(),
  landmark: z.string().trim().max(150).optional(),
  addressLine1: z.string().trim().min(1, 'Address line 1 is required').max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  country: z.string().trim().min(1).max(100).default('India'),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, 'Pincode must be a valid 6-digit number'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  addressType: z.enum(['Home', 'Office', 'Other']).default('Home'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
