import { Coupon } from '../../models/coupon.model.js';
import { Customer } from '../../models/customer.model.js';
import { Setting } from '../../models/setting.model.js';

export interface DynamicPricingInput {
  basePrice: number;
  city?: string;
  isPeakHour?: boolean;
  couponCode?: string;
  loyaltyPointsToRedeem?: number;
  customerId?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  citySurgeMultiplier: number;
  peakHourSurge: number;
  subtotal: number;
  couponDiscount: number;
  loyaltyDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  finalTotal: number;
  pointsEarned: number;
}

export class PricingService {
  async calculatePrice(input: DynamicPricingInput): Promise<PricingBreakdown> {
    const { basePrice, city, isPeakHour = false, couponCode, loyaltyPointsToRedeem = 0, customerId } = input;

    // Fetch dynamic pricing settings
    const cityMultiplierSetting = city ? await Setting.findOne({ key: `city_multiplier_${city.toLowerCase()}` }) : null;
    const citySurgeMultiplier = cityMultiplierSetting?.value ? Number(cityMultiplierSetting.value) : 1.0;
    const peakHourSurge = isPeakHour ? 1.15 : 1.0; // 15% surge during peak hours

    const subtotal = Math.round(basePrice * citySurgeMultiplier * peakHourSurge);

    // Coupon discount logic
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (coupon && subtotal >= coupon.minBookingAmount) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
            couponDiscount = coupon.maxDiscountAmount;
          }
        } else {
          couponDiscount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }

    // Loyalty points redemption logic (10 points = 1 INR)
    let loyaltyDiscount = 0;
    if (loyaltyPointsToRedeem > 0 && customerId) {
      const customer = await Customer.findById(customerId);
      if (customer && customer.loyaltyPoints >= loyaltyPointsToRedeem) {
        const maxRedeemablePoints = Math.min(loyaltyPointsToRedeem, customer.loyaltyPoints);
        loyaltyDiscount = Math.round(maxRedeemablePoints / 10);
      }
    }

    const totalDiscounts = couponDiscount + loyaltyDiscount;
    const taxableAmount = Math.max(0, subtotal - totalDiscounts);

    // GST Calculation: 18% standard GST (9% CGST, 9% SGST)
    const cgst = Math.round((taxableAmount * 9) / 100);
    const sgst = Math.round((taxableAmount * 9) / 100);
    const totalGst = cgst + sgst;
    const finalTotal = taxableAmount + totalGst;

    // Points earned on booking (1 point per 100 INR spent)
    const pointsEarned = Math.floor(finalTotal / 100);

    return {
      basePrice,
      citySurgeMultiplier,
      peakHourSurge,
      subtotal,
      couponDiscount,
      loyaltyDiscount,
      taxableAmount,
      cgst,
      sgst,
      totalGst,
      finalTotal,
      pointsEarned,
    };
  }
}

export const pricingService = new PricingService();
