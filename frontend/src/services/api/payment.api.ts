import { get, post } from './helpers';
import { ApiResponse, PaginatedData } from './types';

export interface IPaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface IVerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string;
}

export interface IPaymentHistoryItem {
  paymentId: string;
  bookingId: string;
  amount: number;
  method: 'upi' | 'card' | 'debit' | 'netbanking' | 'wallet' | 'cash';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  transactionRef: string;
}

export interface IRefundStatusResponse {
  paymentId: string;
  refundId: string;
  amount: number;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export const paymentApi = {
  /**
   * Create Razorpay / Gateway Payment Order
   * POST /payments/create-order
   */
  createPaymentOrder(bookingId: string, amount: number, paymentMethod: string): Promise<ApiResponse<IPaymentOrderResponse>> {
    return post<IPaymentOrderResponse>('/payments/create-order', { bookingId, amount, paymentMethod });
  },

  /**
   * Verify Payment Signature from Razorpay / Gateway
   * POST /payments/verify
   */
  verifyPayment(payload: IVerifyPaymentPayload): Promise<ApiResponse<{ verified: boolean; transactionRef: string }>> {
    return post<{ verified: boolean; transactionRef: string }>('/payments/verify', payload);
  },

  /**
   * Get User Payment Transaction History
   * GET /payments/history
   */
  getPaymentHistory(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedData<IPaymentHistoryItem>>> {
    return get<PaginatedData<IPaymentHistoryItem>>('/payments/history', params);
  },

  /**
   * Get Refund Status by Payment ID
   * GET /payments/:paymentId/refund
   */
  getRefundStatus(paymentId: string): Promise<ApiResponse<IRefundStatusResponse>> {
    return get<IRefundStatusResponse>(`/payments/${paymentId}/refund`);
  },
};

export default paymentApi;
