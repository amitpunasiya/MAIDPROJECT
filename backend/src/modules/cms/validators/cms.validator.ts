import { z } from 'zod';

export const createCmsPageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().min(1, 'Slug is required').toLowerCase(),
  description: z.string().trim().optional(),
  content: z.string().trim().min(1, 'Content is required'),
  images: z.array(z.string()).optional().default([]),
  metaTitle: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
  metaKeywords: z.array(z.string()).optional().default([]),
  status: z.enum(['published', 'draft']).optional().default('published'),
});

export const updateCmsPageSchema = createCmsPageSchema.partial();

export const createBannerSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  subtitle: z.string().trim().optional(),
  imageUrl: z.string().trim().min(1, 'Image URL is required'),
  ctaText: z.string().trim().optional(),
  ctaLink: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  targetRole: z.enum(['all', 'customer', 'provider']).optional().default('all'),
});

export const updateBannerSchema = createBannerSchema.partial();

export const createTestimonialSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  avatar: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  service: z.string().trim().min(1, 'Service is required'),
  rating: z.number().min(1).max(5).optional().default(5),
  content: z.string().trim().min(1, 'Content is required'),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional().default('approved'),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const cmsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  approvalStatus: z.string().optional(),
});

export type CreateCmsPageInput = z.infer<typeof createCmsPageSchema>;
export type UpdateCmsPageInput = z.infer<typeof updateCmsPageSchema>;
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type CmsQueryInput = z.infer<typeof cmsQuerySchema>;
