import type { Request, Response } from 'express';
import { cmsService } from '../services/cms.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  CreateCmsPageInput,
  UpdateCmsPageInput,
  CreateBannerInput,
  UpdateBannerInput,
  CreateTestimonialInput,
  UpdateTestimonialInput,
  CmsQueryInput,
} from '../validators/cms.validator.js';

export class CmsController {
  // Page Controllers
  getPages = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CmsQueryInput;
    const result = await cmsService.getAllPages(query);
    return ApiResponse.ok(res, 'CMS pages retrieved successfully', result);
  });

  getPageBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const page = await cmsService.getPageBySlug(slug);
    return ApiResponse.ok(res, 'CMS page retrieved successfully', { page });
  });

  createPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as CreateCmsPageInput;
    const page = await cmsService.createPage(input, req.user.id);
    return ApiResponse.created(res, 'CMS page created successfully', { page });
  });

  updatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateCmsPageInput;
    const page = await cmsService.updatePage(id, input, req.user.id);
    return ApiResponse.ok(res, 'CMS page updated successfully', { page });
  });

  deletePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await cmsService.deletePage(id, req.user.id);
    return ApiResponse.ok(res, 'CMS page deleted successfully');
  });

  // Banner Controllers
  getBanners = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CmsQueryInput;
    if (req.user?.role === 'admin' || (req.user?.role as string) === 'super_admin') {
      const result = await cmsService.getAllBanners(query);
      return ApiResponse.ok(res, 'Banners retrieved successfully', result);
    }
    const banners = await cmsService.getActiveBanners(req.query.role as string);
    return ApiResponse.ok(res, 'Active banners retrieved successfully', { banners });
  });

  createBanner = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as CreateBannerInput;
    const banner = await cmsService.createBanner(input, req.user.id);
    return ApiResponse.created(res, 'Banner created successfully', { banner });
  });

  updateBanner = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateBannerInput;
    const banner = await cmsService.updateBanner(id, input, req.user.id);
    return ApiResponse.ok(res, 'Banner updated successfully', { banner });
  });

  deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await cmsService.deleteBanner(id, req.user.id);
    return ApiResponse.ok(res, 'Banner deleted successfully');
  });

  // Testimonial Controllers
  getTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CmsQueryInput;
    if (req.user?.role === 'admin' || (req.user?.role as string) === 'super_admin') {
      const result = await cmsService.getAllTestimonials(query);
      return ApiResponse.ok(res, 'Testimonials retrieved successfully', result);
    }
    const testimonials = await cmsService.getApprovedTestimonials();
    return ApiResponse.ok(res, 'Approved testimonials retrieved successfully', { testimonials });
  });

  createTestimonial = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateTestimonialInput;
    const testimonial = await cmsService.createTestimonial(input);
    return ApiResponse.created(res, 'Testimonial created successfully', { testimonial });
  });

  updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    const input = req.body as UpdateTestimonialInput;
    const testimonial = await cmsService.updateTestimonial(id, input, req.user.id);
    return ApiResponse.ok(res, 'Testimonial updated successfully', { testimonial });
  });

  deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = req.params.id as string;
    await cmsService.deleteTestimonial(id, req.user.id);
    return ApiResponse.ok(res, 'Testimonial deleted successfully');
  });
}

export const cmsController = new CmsController();
