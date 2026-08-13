import type { Request, Response } from 'express';
import { serviceCatalogService } from '../services/serviceCatalog/serviceCatalog.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class ServiceCatalogController {
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const isFeaturedOnly = req.query.featured === 'true';
    const categories = await serviceCatalogService.getCategories(isFeaturedOnly);
    return ApiResponse.ok(res, 'Service categories retrieved', categories);
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, icon, bannerImage, description, displayOrder } = req.body;
    if (!name) throw ApiError.badRequest('Category name is required');

    const category = await serviceCatalogService.createCategory({
      name,
      icon,
      bannerImage,
      description,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
    });

    return ApiResponse.created(res, 'Service category created successfully', category);
  });

  getServicesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = String(req.params.categoryId || '');
    if (!categoryId) throw ApiError.badRequest('categoryId is required');

    const services = await serviceCatalogService.getServicesByCategory(categoryId);
    return ApiResponse.ok(res, 'Services for category retrieved', services);
  });

  getServiceDetails = asyncHandler(async (req: Request, res: Response) => {
    const serviceId = String(req.params.serviceId || '');
    if (!serviceId) throw ApiError.badRequest('serviceId is required');

    const details = await serviceCatalogService.getServiceDetails(serviceId);
    return ApiResponse.ok(res, 'Service details retrieved', details);
  });

  createService = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId, name, description, shortDescription, basePrice, minPrice, maxPrice, priceType, estimatedDurationMinutes, requiredStaff, equipmentRequired, materialsRequired, gstPercentage } = req.body;

    const service = await serviceCatalogService.createService({
      categoryId,
      name,
      description,
      shortDescription,
      basePrice: Number(basePrice),
      minPrice: minPrice ? Number(minPrice) : 0,
      maxPrice: maxPrice ? Number(maxPrice) : 10000,
      priceType: priceType || 'fixed',
      estimatedDurationMinutes: estimatedDurationMinutes ? Number(estimatedDurationMinutes) : 60,
      requiredStaff: requiredStaff ? Number(requiredStaff) : 1,
      equipmentRequired: equipmentRequired || [],
      materialsRequired: materialsRequired || [],
      gstPercentage: gstPercentage ? Number(gstPercentage) : 18,
    });

    return ApiResponse.created(res, 'Service created successfully', service);
  });

  createSubService = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId, name, description, basePrice, estimatedDurationMinutes, unit } = req.body;

    const sub = await serviceCatalogService.createSubService({
      serviceId,
      name,
      description,
      basePrice: Number(basePrice),
      estimatedDurationMinutes: estimatedDurationMinutes ? Number(estimatedDurationMinutes) : 30,
      unit: unit || 'unit',
    });

    return ApiResponse.created(res, 'Sub-service created successfully', sub);
  });

  calculatePrice = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId, subServiceId, quantity, city, branchId, providerId, isWeekend, isFestival, isEmergency } = req.body;
    if (!serviceId) throw ApiError.badRequest('serviceId is required');

    const result = await serviceCatalogService.calculateDynamicPrice({
      serviceId: String(serviceId),
      subServiceId: subServiceId ? String(subServiceId) : undefined,
      quantity: quantity ? Number(quantity) : 1,
      city: city ? String(city) : undefined,
      branchId: branchId ? String(branchId) : undefined,
      providerId: providerId ? String(providerId) : undefined,
      isWeekend: Boolean(isWeekend),
      isFestival: Boolean(isFestival),
      isEmergency: Boolean(isEmergency),
    });

    return ApiResponse.ok(res, 'Dynamic price calculated', result);
  });

  searchServices = asyncHandler(async (req: Request, res: Response) => {
    const q = String(req.query.q || '');
    const results = await serviceCatalogService.searchServices(q);
    return ApiResponse.ok(res, `Search results for "${q}"`, results);
  });

  getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await serviceCatalogService.getServiceAnalytics();
    return ApiResponse.ok(res, 'Service catalog analytics retrieved', analytics);
  });

  seedCatalog = asyncHandler(async (_req: Request, res: Response) => {
    await serviceCatalogService.seedDefaultCatalog();
    return ApiResponse.ok(res, 'Catalog default categories and services initialized');
  });
}

export const serviceCatalogController = new ServiceCatalogController();
