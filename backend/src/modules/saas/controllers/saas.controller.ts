import type { Request, Response } from 'express';
import { saasService } from '../services/saas.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';

export class SaaSController {
  createBranch = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { name, city, address, managerName, managerPhone, managerEmail, serviceRadiusKm, timing } = req.body;
    if (!name || !city || !address) {
      throw ApiError.badRequest('Name, city, and address are required to create a branch');
    }

    const branch = await saasService.createBranch({
      providerId: req.user.id,
      name,
      city,
      address,
      managerName,
      managerPhone,
      managerEmail,
      serviceRadiusKm,
      timing,
    });

    return ApiResponse.created(res, 'Branch created successfully', branch);
  });

  getProviderBranches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const branches = await saasService.getProviderBranches(req.user.id);
    return ApiResponse.ok(res, 'Provider branches retrieved', branches);
  });

  getCityBranches = asyncHandler(async (req: Request, res: Response) => {
    const city = String(req.params.city || '');
    const branches = await saasService.getCityBranches(city);
    return ApiResponse.ok(res, `Branches in ${city} retrieved`, branches);
  });

  createPlan = asyncHandler(async (req: Request, res: Response) => {
    const { name, code, price, maxBookingsPerMonth, maxBranches, commissionRate, features } = req.body;
    if (!name || !code || price === undefined) {
      throw ApiError.badRequest('Name, code, and price are required to create a SaaS subscription plan');
    }

    const plan = await saasService.createPlan({
      name,
      code,
      price,
      maxBookingsPerMonth,
      maxBranches,
      commissionRate,
      features,
    });

    return ApiResponse.created(res, 'SaaS Plan created successfully', plan);
  });

  getPlans = asyncHandler(async (_req: Request, res: Response) => {
    const plans = await saasService.getPlans();
    return ApiResponse.ok(res, 'Subscription plans retrieved', plans);
  });
}

export const saasController = new SaaSController();
