import type { IPaymentDocument } from '../../../models/payment.model.js';

export interface CreatePaymentIntentDTO {
  bookingId: string;
  paymentMode?: 'cash' | 'cod' | 'upi' | 'razorpay' | 'wallet' | 'online' | 'stripe';
  paymentMethod?: 'cash' | 'cod' | 'upi' | 'razorpay' | 'wallet' | 'online' | 'stripe';
  amount?: number;
}

export interface VerifyPaymentDTO {
  paymentId?: string;
  bookingId?: string;
  transactionId?: string;
  paymentMode?: 'cash' | 'cod' | 'upi' | 'razorpay' | 'wallet' | 'online' | 'stripe';
  signature?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface ConfirmCodDTO {
  paymentId: string;
}

export interface RefundPaymentDTO {
  paymentId: string;
  reason?: string;
  amount?: number;
}

export interface PaymentFilterDTO {
  paymentStatus?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export type { IPaymentDocument };
