import type { Request, Response } from 'express';
import { referralService } from '../services/referral.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type { ApplyReferralInput, ReferralQueryInput } from '../validators/referral.validator.js';

export class ReferralController {
  generateCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await referralService.generateReferralCode(req.user.id);
    return ApiResponse.created(res, 'Referral code generated successfully', result);
  });

  getReferrals = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const query = req.query as unknown as ReferralQueryInput;
    const result = await referralService.getReferralData(req.user.id, query);
    return ApiResponse.ok(res, 'Referral statistics retrieved successfully', result);
  });

  applyReferral = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = req.body as ApplyReferralInput;
    const referral = await referralService.applyReferralCode(req.user.id, input);
    return ApiResponse.ok(res, 'Referral code applied successfully and wallet rewards credited', { referral });
  });
}

export const referralController = new ReferralController();
