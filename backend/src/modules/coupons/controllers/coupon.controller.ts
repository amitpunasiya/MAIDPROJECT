import type { Request, Response } from 'express';
import { couponService } from '../services/coupon.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import type { CreateCouponInput, UpdateCouponInput, ApplyCouponInput, CouponQueryInput } from '../validators/coupon.validator.js';

export class CouponController {
  createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateCouponInput;
    const coupon = await couponService.createCoupon(input);
    return ApiResponse.created(res, 'Coupon created successfully', { coupon });
  });

  updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const input = req.body as UpdateCouponInput;
    const coupon = await couponService.updateCoupon(id, input);
    return ApiResponse.ok(res, 'Coupon updated successfully', { coupon });
  });

  deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await couponService.deleteCoupon(id);
    return ApiResponse.ok(res, 'Coupon deleted successfully');
  });

  toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const isActive = req.body.isActive as boolean | undefined;
    const coupon = await couponService.toggleStatus(id, isActive);
    return ApiResponse.ok(res, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`, { coupon });
  });

  getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CouponQueryInput;
    const result = await couponService.getAllCoupons(query);
    return ApiResponse.ok(res, 'Coupons retrieved successfully', result);
  });

  getActiveCoupons = asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponService.getActiveCoupons();
    return ApiResponse.ok(res, 'Active coupons retrieved successfully', { coupons });
  });

  applyCoupon = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ApplyCouponInput;
    const result = await couponService.applyCoupon(input, req.user?.id);
    return ApiResponse.ok(res, 'Coupon applied successfully', result);
  });
}

export const couponController = new CouponController();
