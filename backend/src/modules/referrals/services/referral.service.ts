import { referralRepository } from '../repositories/referral.repository.js';
import { User } from '../../../models/user.model.js';
import { walletService } from '../../../services/wallet/wallet.service.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { WalletOwnerType } from '../../../types/domain.enums.js';
import type { ApplyReferralInput, ReferralQueryInput } from '../validators/referral.validator.js';
import { Types } from 'mongoose';

export class ReferralService {
  private generateCode(userName?: string): string {
    const prefix = userName ? userName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() : 'REF';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  }

  async generateReferralCode(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    let referral = await referralRepository.findOne({ referrerUserId: new Types.ObjectId(userId), isDeleted: { $ne: true } });

    if (!referral) {
      const code = this.generateCode(user.name);
      referral = await referralRepository.create({
        referrerUserId: new Types.ObjectId(userId),
        referralCode: code,
        rewardAmount: 100,
        status: 'pending',
        rewardStatus: 'pending',
      });
    }

    const shareUrl = `https://maidproject.com/signup?ref=${referral.referralCode}`;

    return {
      referralCode: referral.referralCode,
      shareUrl,
      rewardAmount: referral.rewardAmount,
    };
  }

  async getReferralData(userId: string, query: ReferralQueryInput) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    let referralObj = await this.generateReferralCode(userId);
    const history = await referralRepository.findByReferrer(userId, query);

    return {
      referralCode: referralObj.referralCode,
      shareUrl: referralObj.shareUrl,
      rewardAmountPerReferral: 100,
      totalEarned: history.totalEarned,
      totalReferrals: history.total,
      history: history.items,
      page: history.page,
      limit: history.limit,
      totalPages: history.totalPages,
    };
  }

  async applyReferralCode(referredUserId: string, input: ApplyReferralInput) {
    const code = input.referralCode.toUpperCase();

    const existingReferral = await referralRepository.findByCode(code);
    if (!existingReferral) {
      throw ApiError.notFound('Invalid referral code');
    }

    if (existingReferral.referrerUserId.toString() === referredUserId) {
      throw ApiError.badRequest('You cannot use your own referral code');
    }

    // Check if this user has already used a referral code
    const alreadyReferred = await referralRepository.findOne({ referredUserId: new Types.ObjectId(referredUserId) });
    if (alreadyReferred) {
      throw ApiError.badRequest('You have already applied a referral code');
    }

    const rewardAmount = existingReferral.rewardAmount || 100;

    // Credit Referrer Wallet
    await walletService.creditWallet(
      existingReferral.referrerUserId.toString(),
      WalletOwnerType.CUSTOMER,
      rewardAmount,
      `Referral bonus for inviting new user`,
      existingReferral._id.toString(),
    );

    // Credit Referred User Welcome Bonus Wallet
    await walletService.creditWallet(
      referredUserId,
      WalletOwnerType.CUSTOMER,
      50,
      `Welcome bonus for signing up via referral code ${code}`,
      existingReferral._id.toString(),
    );

    // Create completed referral record
    const referralRecord = await referralRepository.create({
      referrerUserId: existingReferral.referrerUserId,
      referralCode: code,
      referredUserId: new Types.ObjectId(referredUserId),
      status: 'completed',
      rewardAmount,
      rewardStatus: 'credited',
      completedAt: new Date(),
    });

    logger.info('Referral code applied successfully', {
      code,
      referrerUserId: existingReferral.referrerUserId,
      referredUserId,
      rewardAmount,
    });

    return referralRecord;
  }
}

export const referralService = new ReferralService();
