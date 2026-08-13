import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().trim().min(3, 'Code must be at least 3 characters').toUpperCase(),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be positive'),
  minBookingAmount: z.number().min(0).optional().default(0),
  maxDiscountAmount: z.number().min(0).optional(),
  validFrom: z.string().or(z.date()).optional(),
  validUntil: z.string().or(z.date()).optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional().default(1),
  applicableCities: z.array(z.string()).optional().default([]),
  applicableServices: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required').toUpperCase(),
  basePrice: z.number().positive('Base price must be greater than 0'),
  city: z.string().trim().optional(),
  serviceType: z.string().trim().optional(),
});

export const couponQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type CouponQueryInput = z.infer<typeof couponQuerySchema>;
