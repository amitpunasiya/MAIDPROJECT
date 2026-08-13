import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  createCmsPageSchema,
  updateCmsPageSchema,
  createBannerSchema,
  updateBannerSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  cmsQuerySchema,
} from '../validators/cms.validator.js';

const router = Router();

// Public Read Endpoints for Pages, Banners & Testimonials
router.get('/pages', validate(cmsQuerySchema, 'query'), cmsController.getPages);
router.get('/pages/:slug', cmsController.getPageBySlug);

router.get('/banners', validate(cmsQuerySchema, 'query'), cmsController.getBanners);

router.get('/testimonials', validate(cmsQuerySchema, 'query'), cmsController.getTestimonials);
router.post('/testimonials', validate(createTestimonialSchema), cmsController.createTestimonial);

// Protected Write Endpoints for Admin & Super Admin
router.use(authenticate);
router.use(requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Pages Admin Routes
router.post('/pages', validate(createCmsPageSchema), cmsController.createPage);
router.put('/pages/:id', validate(updateCmsPageSchema), cmsController.updatePage);
router.patch('/pages/:id', validate(updateCmsPageSchema), cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

// Banners Admin Routes
router.post('/banners', validate(createBannerSchema), cmsController.createBanner);
router.put('/banners/:id', validate(updateBannerSchema), cmsController.updateBanner);
router.patch('/banners/:id', validate(updateBannerSchema), cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

// Testimonials Admin Routes
router.put('/testimonials/:id', validate(updateTestimonialSchema), cmsController.updateTestimonial);
router.patch('/testimonials/:id', validate(updateTestimonialSchema), cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

export default router;
