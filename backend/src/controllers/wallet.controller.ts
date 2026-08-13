import type { Request, Response } from 'express';
import { walletService } from '../services/wallet/wallet.service.js';
import { WalletOwnerType } from '../types/domain.enums.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class WalletController {
  getBalance = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ownerType = req.user.role === 'provider' ? WalletOwnerType.PROVIDER : WalletOwnerType.CUSTOMER;
    const balanceInfo = await walletService.getBalance(req.user.id, ownerType);
    return ApiResponse.ok(res, 'Wallet balance retrieved', balanceInfo);
  });

  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ownerType = req.user.role === 'provider' ? WalletOwnerType.PROVIDER : WalletOwnerType.CUSTOMER;
    const transactions = await walletService.getTransactions(req.user.id, ownerType);
    return ApiResponse.ok(res, 'Wallet transactions retrieved', transactions);
  });

  requestWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { amount, accountNumber, ifscCode, accountHolderName, bankName } = req.body;

    if (!amount || !accountNumber || !ifscCode || !accountHolderName) {
      throw ApiError.badRequest('Amount, accountNumber, ifscCode, and accountHolderName are required');
    }

    const withdrawal = await walletService.requestWithdrawal(req.user.id, Number(amount), {
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName,
    });

    return ApiResponse.created(res, 'Withdrawal requested successfully', withdrawal);
  });
}

export const walletController = new WalletController();
