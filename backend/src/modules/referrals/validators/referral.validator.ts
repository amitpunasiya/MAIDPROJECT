import { z } from 'zod';

export const generateReferralSchema = z.object({});

export const applyReferralSchema = z.object({
  referralCode: z.string().trim().min(4, 'Referral code is required').toUpperCase(),
});

export const referralQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ApplyReferralInput = z.infer<typeof applyReferralSchema>;
export type ReferralQueryInput = z.infer<typeof referralQuerySchema>;
