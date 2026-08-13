import { BaseRepository } from '../../../repositories/base.repository.js';
import { Coupon, type ICouponDocument } from '../../../models/coupon.model.js';
import type { CouponQueryInput } from '../validators/coupon.validator.js';

export class CouponRepository extends BaseRepository<ICouponDocument> {
  constructor() {
    super(Coupon);
  }

  async findByCode(code: string): Promise<ICouponDocument | null> {
    return this.model.findOne({ code: code.toUpperCase(), isDeleted: { $ne: true } });
  }

  async findActiveCoupons(): Promise<ICouponDocument[]> {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        isDeleted: { $ne: true },
      })
      .sort({ createdAt: -1 });
  }

  async findAllPaginated(input: CouponQueryInput) {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };

    if (input.isActive !== undefined) {
      filter.isActive = input.isActive;
    }

    if (input.search) {
      filter.$or = [
        { code: new RegExp(input.search, 'i') },
        { title: new RegExp(input.search, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.model.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  }
}

export const couponRepository = new CouponRepository();
