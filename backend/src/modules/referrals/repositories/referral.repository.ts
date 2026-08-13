import { BaseRepository } from '../../../repositories/base.repository.js';
import { Referral, type IReferralDocument } from '../../../models/referral.model.js';
import type { ReferralQueryInput } from '../validators/referral.validator.js';
import { Types } from 'mongoose';

export class ReferralRepository extends BaseRepository<IReferralDocument> {
  constructor() {
    super(Referral);
  }

  async findByCode(referralCode: string): Promise<IReferralDocument | null> {
    return this.model.findOne({ referralCode: referralCode.toUpperCase(), isDeleted: { $ne: true } });
  }

  async findByReferrer(referrerUserId: string, queryInput: ReferralQueryInput = { page: 1, limit: 20 }) {
    const page = Math.max(1, queryInput.page ?? 1);
    const limit = Math.min(100, Math.max(1, queryInput.limit ?? 20));
    const skip = (page - 1) * limit;

    const query = { referrerUserId: new Types.ObjectId(referrerUserId), isDeleted: { $ne: true } };

    const [items, total, totalEarningsRes] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('referredUserId', 'name phone email avatar'),
      this.model.countDocuments(query),
      this.model.aggregate([
        { $match: { referrerUserId: new Types.ObjectId(referrerUserId), rewardStatus: 'credited', isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$rewardAmount' } } },
      ]),
    ]);

    return {
      items,
      total,
      totalEarned: totalEarningsRes[0]?.sum || 0,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByReferrer(referrerUserId: string): Promise<number> {
    return this.model.countDocuments({ referrerUserId: new Types.ObjectId(referrerUserId), isDeleted: { $ne: true } });
  }
}

export const referralRepository = new ReferralRepository();
