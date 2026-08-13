import { couponRepository } from '../repositories/coupon.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import type { CreateCouponInput, UpdateCouponInput, ApplyCouponInput, CouponQueryInput } from '../validators/coupon.validator.js';
import type { ICouponDocument } from '../../../models/coupon.model.js';

export class CouponService {
  async createCoupon(input: CreateCouponInput): Promise<ICouponDocument> {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) {
      throw ApiError.badRequest(`Coupon code ${input.code} already exists`);
    }

    const validFrom = input.validFrom ? new Date(input.validFrom) : new Date();
    const validUntil = input.validUntil ? new Date(input.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const coupon = await couponRepository.create({
      code: input.code.toUpperCase(),
      title: input.title,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minBookingAmount: input.minBookingAmount ?? 0,
      maxDiscountAmount: input.maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit: input.usageLimit,
      perUserLimit: input.perUserLimit ?? 1,
      applicableCities: input.applicableCities ?? [],
      applicableServices: input.applicableServices ?? [],
      isActive: input.isActive ?? true,
      usedCount: 0,
    });

    logger.info('Coupon created', { couponId: coupon._id, code: coupon.code });
    return coupon;
  }

  async updateCoupon(id: string, input: UpdateCouponInput): Promise<ICouponDocument> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    if (input.code && input.code.toUpperCase() !== coupon.code) {
      const existing = await couponRepository.findByCode(input.code);
      if (existing) {
        throw ApiError.badRequest(`Coupon code ${input.code} is already in use`);
      }
      coupon.code = input.code.toUpperCase();
    }

    if (input.title) coupon.title = input.title;
    if (input.description !== undefined) coupon.description = input.description;
    if (input.discountType) coupon.discountType = input.discountType;
    if (input.discountValue !== undefined) coupon.discountValue = input.discountValue;
    if (input.minBookingAmount !== undefined) coupon.minBookingAmount = input.minBookingAmount;
    if (input.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = input.maxDiscountAmount;
    if (input.validFrom) coupon.validFrom = new Date(input.validFrom);
    if (input.validUntil) coupon.validUntil = new Date(input.validUntil);
    if (input.usageLimit !== undefined) coupon.usageLimit = input.usageLimit;
    if (input.perUserLimit !== undefined) coupon.perUserLimit = input.perUserLimit;
    if (input.applicableCities) coupon.applicableCities = input.applicableCities;
    if (input.applicableServices) coupon.applicableServices = input.applicableServices;
    if (input.isActive !== undefined) coupon.isActive = input.isActive;

    await coupon.save();
    logger.info('Coupon updated', { couponId: coupon._id, code: coupon.code });
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    coupon.isDeleted = true;
    await coupon.save();
    logger.info('Coupon soft deleted', { couponId: id, code: coupon.code });
  }

  async toggleStatus(id: string, isActive?: boolean): Promise<ICouponDocument> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    coupon.isActive = isActive !== undefined ? isActive : !coupon.isActive;
    await coupon.save();

    logger.info('Coupon status updated', { couponId: coupon._id, code: coupon.code, isActive: coupon.isActive });
    return coupon;
  }

  async getAllCoupons(query: CouponQueryInput) {
    return couponRepository.findAllPaginated(query);
  }

  async getActiveCoupons(): Promise<ICouponDocument[]> {
    return couponRepository.findActiveCoupons();
  }

  async applyCoupon(input: ApplyCouponInput, _userId?: string) {
    const coupon = await couponRepository.findByCode(input.code);
    if (!coupon || !coupon.isActive) {
      throw ApiError.badRequest('Invalid or inactive coupon code');
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      throw ApiError.badRequest('Coupon has expired or is not yet valid');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('Coupon usage limit has been reached');
    }

    if (coupon.minBookingAmount && input.basePrice < coupon.minBookingAmount) {
      throw ApiError.badRequest(`Minimum booking amount for this coupon is ₹${coupon.minBookingAmount}`);
    }

    if (coupon.applicableCities && coupon.applicableCities.length > 0 && input.city) {
      const cityMatch = coupon.applicableCities.some((c) => c.toLowerCase() === input.city?.toLowerCase());
      if (!cityMatch) {
        throw ApiError.badRequest(`Coupon is not applicable in ${input.city}`);
      }
    }

    if (coupon.applicableServices && coupon.applicableServices.length > 0 && input.serviceType) {
      const serviceMatch = coupon.applicableServices.some((s) => s.toLowerCase() === input.serviceType?.toLowerCase());
      if (!serviceMatch) {
        throw ApiError.badRequest(`Coupon is not applicable for ${input.serviceType} service`);
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (input.basePrice * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, input.basePrice);
    }

    const finalPrice = Math.max(0, input.basePrice - discountAmount);

    return {
      originalPrice: input.basePrice,
      discountAmount,
      finalPrice,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  }
}

export const couponService = new CouponService();
