import type { Request, Response } from 'express';
import { addressService } from '../services/address/address.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator.js';

export class AddressController {
  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const input = req.body as CreateAddressInput;
    const address = await addressService.createAddress(req.user.id, input);

    return ApiResponse.created(res, 'Address added successfully', { address });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const input = req.body as UpdateAddressInput;
    const address = await addressService.updateAddress(id, req.user.id, input);

    return ApiResponse.ok(res, 'Address updated successfully', { address });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    await addressService.deleteAddress(id, req.user.id);

    return ApiResponse.ok(res, 'Address deleted successfully');
  });

  getMyAddresses = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const addresses = await addressService.getMyAddresses(req.user.id);

    return ApiResponse.ok(res, 'Addresses retrieved successfully', { addresses });
  });

  getDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const address = await addressService.getDefaultAddress(req.user.id);

    return ApiResponse.ok(res, 'Default address retrieved successfully', { address });
  });

  setDefault = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const id = req.params.id as string;
    const address = await addressService.setDefaultAddress(id, req.user.id);

    return ApiResponse.ok(res, 'Default address updated successfully', { address });
  });
}

export const addressController = new AddressController();
