import { z } from 'zod';

export const createOrderSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  paymentMode: z.enum(['cash', 'cod', 'upi', 'razorpay', 'wallet', 'online', 'stripe']).optional().default('razorpay'),
  paymentMethod: z.enum(['cash', 'cod', 'upi', 'razorpay', 'wallet', 'online', 'stripe']).optional(),
  amount: z.number().positive('Amount must be greater than zero').optional(),
});

export const createPaymentIntentSchema = createOrderSchema;

export const verifyPaymentSchema = z.object({
  paymentId: z.string().trim().optional(),
  bookingId: z.string().trim().optional(),
  transactionId: z.string().trim().optional(),
  paymentMode: z.enum(['cash', 'cod', 'upi', 'razorpay', 'wallet', 'online', 'stripe']).optional(),
  signature: z.string().trim().optional(),
});

export const confirmCodSchema = z.object({
  paymentId: z.string().trim().min(1, 'Payment ID is required'),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().trim().min(1, 'Payment ID is required'),
  reason: z.string().trim().optional().default('Customer cancellation'),
  amount: z.number().min(0).optional(),
});

export const paymentFilterSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED']).optional(),
  paymentMethod: z.enum(['cash', 'cod', 'upi', 'razorpay', 'wallet', 'online', 'stripe']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
