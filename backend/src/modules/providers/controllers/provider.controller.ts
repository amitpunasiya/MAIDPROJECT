import type { Request, Response } from 'express';
import { providerService } from '../services/provider.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import { UserRole } from '../../../types/auth.types.js';
import type {
  CreateProviderInput,
  UpdateProviderInput,
  ProviderQueryInput,
  ProviderNearbyQueryInput,
  ToggleAvailabilityInput,
  AddGalleryItemInput,
} from '../validators/provider.validator.js';

export class ProviderController {
  createProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as CreateProviderInput;
    const isAdmin = req.user.role === UserRole.ADMIN;
    const provider = await providerService.createProvider(input, req.user.id, isAdmin);

    return ApiResponse.created(res, 'Provider profile created successfully', { provider });
  });

  getProviders = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as ProviderQueryInput;
    const result = await providerService.getProviders(filter);

    return ApiResponse.ok(res, 'Providers retrieved successfully', result);
  });

  getProviderById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const provider = await providerService.getProviderById(id);

    return ApiResponse.ok(res, 'Provider profile retrieved successfully', { provider });
  });

  updateProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const input = req.body as UpdateProviderInput;
    const isAdmin = req.user.role === UserRole.ADMIN;
    const provider = await providerService.updateProvider(id, input, req.user.id, isAdmin);

    return ApiResponse.ok(res, 'Provider profile updated successfully', { provider });
  });

  deleteProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const isAdmin = req.user.role === UserRole.ADMIN;
    await providerService.deleteProvider(id, req.user.id, isAdmin);

    return ApiResponse.ok(res, 'Provider profile deleted successfully');
  });

  searchNearby = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as ProviderNearbyQueryInput;
    const providers = await providerService.searchNearby(filter);

    return ApiResponse.ok(res, 'Nearby providers retrieved successfully', {
      items: providers,
      count: providers.length,
    });
  });

  toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { isAvailable } = req.body as ToggleAvailabilityInput;
    const id = (req.params.id as string) || req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;

    const provider = await providerService.toggleAvailability(id, isAvailable, req.user.id, isAdmin);
    return ApiResponse.ok(res, `Provider availability set to ${isAvailable ? 'available' : 'unavailable'}`, {
      provider,
    });
  });

  addGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const item = req.body as AddGalleryItemInput;
    const id = (req.params.id as string) || req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;

    const provider = await providerService.addGalleryItem(id, item, req.user.id, isAdmin);
    return ApiResponse.created(res, 'Gallery item added successfully', { provider });
  });

  removeGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const galleryItemId = (req.params.id as string) || (req.params.galleryItemId as string);
    const id = (req.params.providerId as string) || req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN || (req.user.role as string) === UserRole.SUPER_ADMIN;

    const provider = await providerService.removeGalleryItem(id, galleryItemId, req.user.id, isAdmin);
    return ApiResponse.ok(res, 'Gallery item removed successfully', { provider });
  });

  getAvailable = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as ProviderQueryInput;
    const result = await providerService.getAvailableProviders(filter);

    return ApiResponse.ok(res, 'Available providers retrieved successfully', result);
  });

  getTopRated = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const providers = await providerService.getTopRatedProviders(limit);

    return ApiResponse.ok(res, 'Top-rated providers retrieved successfully', { items: providers, count: providers.length });
  });

  getStatistics = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await providerService.getStatistics();

    return ApiResponse.ok(res, 'Provider statistics retrieved successfully', { statistics: stats });
  });

  verifyProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const provider = await providerService.verifyProvider(id, req.user.id);

    return ApiResponse.ok(res, 'Provider verified successfully', { provider });
  });

  suspendProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const provider = await providerService.suspendProvider(id, req.user.id);

    return ApiResponse.ok(res, 'Provider suspended successfully', { provider });
  });

  activateProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const provider = await providerService.activateProvider(id, req.user.id);

    return ApiResponse.ok(res, 'Provider activated successfully', { provider });
  });

  rejectProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const provider = await providerService.rejectProvider(id, req.user.id);

    return ApiResponse.ok(res, 'Provider rejected successfully', { provider });
  });

  matchProviders = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as any;
    const result = await providerService.matchProviders(filter);
    return ApiResponse.ok(res, 'Smart worker matching complete', result);
  });

  updateSkills = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = (req.params.id as string) || req.user.id;
    const { skills } = req.body;
    const isAdmin = req.user.role === UserRole.ADMIN;

    const provider = await providerService.updateSkills(id, skills || [], req.user.id, isAdmin);
    return ApiResponse.ok(res, 'Worker skills updated successfully', { provider });
  });
}

export const providerController = new ProviderController();
