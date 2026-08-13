import { get, post } from './helpers';
import { ApiResponse, PaginatedData } from './types';

export interface IWalletBalanceResponse {
  balance: number;
  currency: string;
}

export interface IWalletTransactionItem {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  timestamp: string;
  status: 'Completed' | 'Pending';
  referenceId?: string;
}

export interface IRechargeWalletResponse {
  transactionId: string;
  newBalance: number;
  status: string;
}

export const walletApi = {
  /**
   * Get authenticated user wallet balance
   * GET /wallet/balance
   */
  getWalletBalance(): Promise<ApiResponse<IWalletBalanceResponse>> {
    return get<IWalletBalanceResponse>('/wallet/balance');
  },

  /**
   * Get wallet transaction log history
   * GET /wallet/transactions
   */
  getWalletTransactions(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedData<IWalletTransactionItem>>> {
    return get<PaginatedData<IWalletTransactionItem>>('/wallet/transactions', params);
  },

  /**
   * Recharge / Top-up wallet balance
   * POST /wallet/recharge
   */
  rechargeWallet(amount: number, paymentMethod: string = 'upi'): Promise<ApiResponse<IRechargeWalletResponse>> {
    return post<IRechargeWalletResponse>('/wallet/recharge', { amount, paymentMethod });
  },

  /**
   * Deduct / Pay using wallet balance
   * POST /wallet/pay
   */
  payWithWallet(bookingId: string, amount: number): Promise<ApiResponse<{ success: boolean; newBalance: number; transactionRef: string }>> {
    return post<{ success: boolean; newBalance: number; transactionRef: string }>('/wallet/pay', { bookingId, amount });
  },
};

export default walletApi;
