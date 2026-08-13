import { get, post } from './helpers';
import { ApiResponse } from './types';

export interface ICoupon {
  id: string;
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  validUntil?: string;
  description?: string;
  isActive?: boolean;
}

export interface ApplyCouponResponse {
  coupon: ICoupon;
  discountAmount: number;
  finalAmount: number;
}

export const couponApi = {
  /**
   * Get active coupons for customer checkout
   * GET /coupons/active
   */
  getActiveCoupons(): Promise<ApiResponse<ICoupon[]>> {
    return get<ICoupon[]>('/coupons/active');
  },

  /**
   * Validate and apply coupon to order amount
   * POST /coupons/apply
   */
  applyCoupon(code: string, bookingAmount: number): Promise<ApiResponse<ApplyCouponResponse>> {
    return post<ApplyCouponResponse>('/coupons/apply', { code, bookingAmount });
  },
};

export default couponApi;
