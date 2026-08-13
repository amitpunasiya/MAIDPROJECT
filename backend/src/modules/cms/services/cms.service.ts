import { cmsPageRepository } from '../repositories/cmsPage.repository.js';
import { bannerRepository } from '../repositories/banner.repository.js';
import { testimonialRepository } from '../repositories/testimonial.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { activityLogService } from '../../activityLogs/services/activityLog.service.js';
import { Types } from 'mongoose';
import type {
  CreateCmsPageInput,
  UpdateCmsPageInput,
  CreateBannerInput,
  UpdateBannerInput,
  CreateTestimonialInput,
  UpdateTestimonialInput,
  CmsQueryInput,
} from '../validators/cms.validator.js';

export class CmsService {
  // Page Methods
  async createPage(input: CreateCmsPageInput, adminUserId: string) {
    const existing = await cmsPageRepository.findBySlug(input.slug);
    if (existing) {
      throw ApiError.badRequest(`CMS page with slug '${input.slug}' already exists`);
    }

    const page = await cmsPageRepository.create({
      title: input.title,
      slug: input.slug.toLowerCase(),
      description: input.description,
      content: input.content,
      images: input.images ?? [],
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords ?? [],
      status: input.status ?? 'published',
      version: 1,
      lastUpdatedBy: new Types.ObjectId(adminUserId),
    });

    void activityLogService.log({
      userId: adminUserId,
      userRole: 'admin',
      action: 'CMS_PAGE_CREATED',
      module: 'cms',
      details: { pageId: page._id, slug: page.slug },
    });

    logger.info('CMS Page created', { pageId: page._id, slug: page.slug, adminUserId });
    return page;
  }

  async updatePage(id: string, input: UpdateCmsPageInput, adminUserId: string) {
    const page = await cmsPageRepository.findById(id);
    if (!page) throw ApiError.notFound('CMS page not found');

    if (input.slug && input.slug.toLowerCase() !== page.slug) {
      const existing = await cmsPageRepository.findBySlug(input.slug);
      if (existing) throw ApiError.badRequest(`CMS page with slug '${input.slug}' already exists`);
      page.slug = input.slug.toLowerCase();
    }

    if (input.title) page.title = input.title;
    if (input.description !== undefined) page.description = input.description;
    if (input.content) page.content = input.content;
    if (input.images) page.images = input.images;
    if (input.metaTitle !== undefined) page.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) page.metaDescription = input.metaDescription;
    if (input.metaKeywords) page.metaKeywords = input.metaKeywords;
    if (input.status) page.status = input.status;

    // Automatic versioning increment on update
    page.version = (page.version || 1) + 1;
    page.lastUpdatedBy = new Types.ObjectId(adminUserId);

    await page.save();

    void activityLogService.log({
      userId: adminUserId,
      userRole: 'admin',
      action: 'CMS_PAGE_UPDATED',
      module: 'cms',
      details: { pageId: page._id, slug: page.slug, version: page.version },
    });

    logger.info('CMS Page updated', { pageId: page._id, slug: page.slug, version: page.version });
    return page;
  }

  async deletePage(id: string, adminUserId: string) {
    const page = await cmsPageRepository.findById(id);
    if (!page) throw ApiError.notFound('CMS page not found');

    page.isDeleted = true;
    await page.save();

    void activityLogService.log({
      userId: adminUserId,
      userRole: 'admin',
      action: 'CMS_PAGE_DELETED',
      module: 'cms',
      details: { pageId: id },
    });

    logger.info('CMS Page soft deleted', { pageId: id, adminUserId });
  }

  async getPageBySlug(slug: string) {
    const page = await cmsPageRepository.findBySlug(slug);
    if (!page) throw ApiError.notFound(`CMS page '${slug}' not found`);
    return page;
  }

  async getAllPages(query: CmsQueryInput) {
    return cmsPageRepository.findAllPaginated(query);
  }

  // Banner Methods
  async createBanner(input: CreateBannerInput, adminUserId: string) {
    const banner = await bannerRepository.create({
      title: input.title,
      subtitle: input.subtitle,
      imageUrl: input.imageUrl,
      ctaText: input.ctaText,
      ctaLink: input.ctaLink,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      targetRole: input.targetRole ?? 'all',
    });

    logger.info('Banner created', { bannerId: banner._id, title: banner.title, adminUserId });
    return banner;
  }

  async updateBanner(id: string, input: UpdateBannerInput, adminUserId: string) {
    const banner = await bannerRepository.findById(id);
    if (!banner) throw ApiError.notFound('Banner not found');

    if (input.title) banner.title = input.title;
    if (input.subtitle !== undefined) banner.subtitle = input.subtitle;
    if (input.imageUrl) banner.imageUrl = input.imageUrl;
    if (input.ctaText !== undefined) banner.ctaText = input.ctaText;
    if (input.ctaLink !== undefined) banner.ctaLink = input.ctaLink;
    if (input.isActive !== undefined) banner.isActive = input.isActive;
    if (input.sortOrder !== undefined) banner.sortOrder = input.sortOrder;
    if (input.targetRole) banner.targetRole = input.targetRole;

    await banner.save();
    logger.info('Banner updated', { bannerId: banner._id, adminUserId });
    return banner;
  }

  async deleteBanner(id: string, adminUserId: string) {
    const banner = await bannerRepository.findById(id);
    if (!banner) throw ApiError.notFound('Banner not found');

    banner.isDeleted = true;
    await banner.save();
    logger.info('Banner soft deleted', { bannerId: id, adminUserId });
  }

  async getActiveBanners(targetRole?: string) {
    return bannerRepository.findActiveBanners(targetRole);
  }

  async getAllBanners(query: CmsQueryInput) {
    return bannerRepository.findAllPaginated(query);
  }

  // Testimonial Methods
  async createTestimonial(input: CreateTestimonialInput) {
    const testimonial = await testimonialRepository.create({
      customerName: input.customerName,
      avatar: input.avatar,
      city: input.city,
      service: input.service,
      rating: input.rating ?? 5,
      content: input.content,
      approvalStatus: input.approvalStatus ?? 'approved',
    });

    logger.info('Testimonial created', { testimonialId: testimonial._id, customerName: testimonial.customerName });
    return testimonial;
  }

  async updateTestimonial(id: string, input: UpdateTestimonialInput, adminUserId: string) {
    const testimonial = await testimonialRepository.findById(id);
    if (!testimonial) throw ApiError.notFound('Testimonial not found');

    if (input.customerName) testimonial.customerName = input.customerName;
    if (input.avatar !== undefined) testimonial.avatar = input.avatar;
    if (input.city) testimonial.city = input.city;
    if (input.service) testimonial.service = input.service;
    if (input.rating !== undefined) testimonial.rating = input.rating;
    if (input.content) testimonial.content = input.content;
    if (input.approvalStatus) testimonial.approvalStatus = input.approvalStatus;

    await testimonial.save();
    logger.info('Testimonial updated', { testimonialId: testimonial._id, adminUserId });
    return testimonial;
  }

  async deleteTestimonial(id: string, adminUserId: string) {
    const testimonial = await testimonialRepository.findById(id);
    if (!testimonial) throw ApiError.notFound('Testimonial not found');

    testimonial.isDeleted = true;
    await testimonial.save();
    logger.info('Testimonial soft deleted', { testimonialId: id, adminUserId });
  }

  async getApprovedTestimonials(limit = 10) {
    return testimonialRepository.findApprovedTestimonials(limit);
  }

  async getAllTestimonials(query: CmsQueryInput) {
    return testimonialRepository.findAllPaginated(query);
  }
}

export const cmsService = new CmsService();
