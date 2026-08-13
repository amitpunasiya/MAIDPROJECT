import { Wallet, type IWalletDocument } from '../../models/wallet.model.js';
import { Transaction, type ITransactionDocument } from '../../models/transaction.model.js';
import { Withdrawal, type IWithdrawalDocument } from '../../models/withdrawal.model.js';
import { Customer } from '../../models/customer.model.js';
import { Currency, WalletOwnerType, TransactionType, WithdrawalStatus, TransactionReferenceType } from '../../types/domain.enums.js';
import { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { notificationService } from '../../modules/notifications/services/notification.service.js';

export class WalletService {
  async getOrCreateWallet(ownerId: string, ownerType: WalletOwnerType): Promise<IWalletDocument> {
    const existing = await Wallet.findOne({ ownerId: new Types.ObjectId(ownerId), ownerType });
    if (existing) return existing;

    return Wallet.create({
      ownerId: new Types.ObjectId(ownerId),
      ownerType,
      balance: 0,
      currency: Currency.INR,
      isActive: true,
    });
  }

  async getBalance(ownerId: string, ownerType: WalletOwnerType) {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    return { balance: wallet.balance, currency: wallet.currency };
  }

  async creditWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{ wallet: IWalletDocument; transaction: ITransactionDocument }> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    const balanceBefore = wallet.balance;
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      transactionNumber,
      walletId: wallet._id,
      amount,
      currency: Currency.INR,
      type: TransactionType.CREDIT,
      referenceType: TransactionReferenceType.TOPUP,
      referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
    });

    await notificationService.notifyWalletCredited(ownerId, amount, description);

    return { wallet, transaction };
  }

  async debitWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{ wallet: IWalletDocument; transaction: ITransactionDocument }> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    if (wallet.balance < amount) {
      throw ApiError.badRequest('Insufficient wallet balance');
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      transactionNumber,
      walletId: wallet._id,
      amount,
      currency: Currency.INR,
      type: TransactionType.DEBIT,
      referenceType: TransactionReferenceType.PAYMENT,
      referenceId: referenceId ? new Types.ObjectId(referenceId) : undefined,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
    });

    await notificationService.notifyWalletDebited(ownerId, amount, description);

    return { wallet, transaction };
  }

  async requestWithdrawal(
    providerId: string,
    amount: number,
    bankDetails: { accountNumber: string; ifscCode: string; accountHolderName: string; bankName?: string }
  ): Promise<IWithdrawalDocument> {
    const wallet = await this.getOrCreateWallet(providerId, WalletOwnerType.PROVIDER);
    if (wallet.balance < amount) {
      throw ApiError.badRequest('Insufficient balance for withdrawal request');
    }

    const withdrawalNumber = `WTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const withdrawal = await Withdrawal.create({
      withdrawalNumber,
      cookId: new Types.ObjectId(providerId),
      walletId: wallet._id,
      amount,
      currency: Currency.INR,
      status: WithdrawalStatus.PENDING,
      bankDetails: {
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName ?? 'Bank',
      },
      requestedAt: new Date(),
    });

    // Hold funds by debiting wallet balance
    wallet.balance -= amount;
    await wallet.save();

    return withdrawal;
  }

  async approveWithdrawal(withdrawalId: string, transactionId: string): Promise<IWithdrawalDocument> {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw ApiError.notFound('Withdrawal request not found');

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.processedAt = new Date();
    withdrawal.transactionId = new Types.ObjectId(transactionId);
    await withdrawal.save();

    return withdrawal;
  }

  async getTransactions(ownerId: string, ownerType: WalletOwnerType) {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    return Transaction.find({ walletId: wallet._id }).sort({ createdAt: -1 });
  }

  async addLoyaltyPoints(userId: string, points: number) {
    const customer = await Customer.findOne({ userId: new Types.ObjectId(userId) });
    if (!customer) return null;

    customer.loyaltyPoints += points;
    await customer.save();
    return customer;
  }
}

export const walletService = new WalletService();
