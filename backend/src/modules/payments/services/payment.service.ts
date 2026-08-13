import crypto from 'crypto';
import { paymentRepository } from '../repositories/payment.repository.js';
import { Booking } from '../../../models/booking.model.js';
import { User } from '../../../models/user.model.js';
import { Customer } from '../../../models/customer.model.js';
import { walletService } from '../../../services/wallet/wallet.service.js';
import { notificationService } from '../../notifications/services/notification.service.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { BookingStatus, WalletOwnerType } from '../../../types/domain.enums.js';
import type {
  CreatePaymentIntentDTO,
  VerifyPaymentDTO,
  ConfirmCodDTO,
  RefundPaymentDTO,
  PaymentFilterDTO,
  IPaymentDocument,
} from '../interfaces/payment.interface.js';
import { Types } from 'mongoose';

export class PaymentService {
  async createPaymentOrder(
    userId: string,
    input: CreatePaymentIntentDTO,
  ): Promise<{ payment: IPaymentDocument; razorpayOrderId?: string; clientSecret?: string }> {
    const booking = await Booking.findById(input.bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const customerUser = await User.findById(userId);
    if (!customerUser) {
      throw ApiError.notFound('Customer user account not found');
    }

    const customerProfile = await Customer.findOne({ userId: new Types.ObjectId(userId) });
    if (booking.customerId.toString() !== userId && customerProfile && booking.customerId.toString() !== customerProfile._id.toString()) {
      throw ApiError.forbidden('You are not authorized to create payment for this booking');
    }

    // Duplicate payment prevention check
    const existingPayment = await paymentRepository.findByBookingId(booking._id.toString());
    if (existingPayment && existingPayment.paymentStatus === 'paid') {
      throw ApiError.badRequest('Payment has already been successfully completed for this booking');
    }

    const totalAmount = input.amount || booking.pricing?.totalAmount || 100;
    if (totalAmount <= 0) {
      throw ApiError.badRequest('Payment amount must be greater than zero');
    }

    const mode = (input.paymentMode || input.paymentMethod || 'razorpay').toLowerCase();
    const validModes = ['cash', 'cod', 'upi', 'razorpay', 'wallet', 'online', 'stripe'];
    if (!validModes.includes(mode)) {
      throw ApiError.badRequest(`Invalid payment mode: ${mode}`);
    }

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `INV-${year}-${randomSeq}`;

    let payment = existingPayment;

    if (!payment) {
      payment = await paymentRepository.create({
        bookingId: booking._id,
        userId: new Types.ObjectId(userId),
        providerId: booking.cookId || new Types.ObjectId('000000000000000000000002'),
        invoiceNumber,
        amount: booking.pricing?.baseAmount || totalAmount,
        discountAmount: booking.pricing?.discountAmount || 0,
        taxAmount: booking.pricing?.taxAmount || Math.round(totalAmount * 0.05),
        platformFee: booking.pricing?.platformFee || 50,
        totalAmount,
        currency: booking.pricing?.currency || 'INR',
        paymentMethod: (mode === 'cash' ? 'cod' : mode) as any,
        paymentStatus: 'pending',
      });

      await Booking.findByIdAndUpdate(booking._id, { paymentId: payment._id });
    }

    const razorpayOrderId = mode === 'razorpay' || mode === 'upi' ? `order_${payment._id.toString()}` : undefined;
    const clientSecret = mode === 'stripe' ? `pi_${payment._id.toString()}_secret` : undefined;

    logger.info('Order Created', {
      paymentId: payment._id,
      invoiceNumber: payment.invoiceNumber,
      amount: payment.totalAmount,
      mode,
      userId,
      bookingId: booking._id,
    });

    return {
      payment,
      razorpayOrderId,
      clientSecret,
    };
  }

  async verifyPayment(userId: string, input: VerifyPaymentDTO): Promise<IPaymentDocument> {
    let payment: IPaymentDocument | null = null;

    if (input.paymentId) {
      payment = await paymentRepository.findById(input.paymentId);
    } else if (input.bookingId) {
      payment = await paymentRepository.findByBookingId(input.bookingId);
    }

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.paymentStatus === 'paid') {
      return payment; // Idempotent return if already verified
    }

    const mode = (input.paymentMode || payment.paymentMethod || 'razorpay').toLowerCase();
    const transactionId = input.transactionId || input.razorpayPaymentId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Cryptographic Razorpay Signature Verification
    if ((mode === 'razorpay' || mode === 'upi') && input.razorpaySignature && input.razorpayOrderId) {
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      if (razorpaySecret) {
        const generatedSignature = crypto
          .createHmac('sha256', razorpaySecret)
          .update(`${input.razorpayOrderId}|${input.razorpayPaymentId || transactionId}`)
          .digest('hex');
        if (generatedSignature !== input.razorpaySignature) {
          throw ApiError.badRequest('Invalid Razorpay payment cryptographic signature');
        }
      }
    }

    // Wallet Debit if mode is wallet
    if (mode === 'wallet') {
      try {
        await walletService.debitWallet(
          userId,
          WalletOwnerType.CUSTOMER,
          payment.totalAmount,
          `Payment for Booking ${payment.bookingId.toString()}`,
          payment._id.toString(),
        );
        logger.info('Wallet Updated: Customer wallet debited for payment', { userId, amount: payment.totalAmount });
      } catch (err: any) {
        logger.warn('Payment Failed: Wallet debit failed', { userId, error: err.message });
        await paymentRepository.updateById(payment._id.toString(), { paymentStatus: 'failed' });
        throw ApiError.badRequest(err.message || 'Payment failed due to insufficient wallet balance');
      }
    }

    // Mark payment status as paid (SUCCESS)
    const updatedPayment = await paymentRepository.updateById(payment._id.toString(), {
      paymentStatus: 'paid',
      transactionId,
      paidAt: new Date(),
    });

    if (!updatedPayment) {
      throw ApiError.internal('Failed to update payment status');
    }

    logger.info('Payment Success', {
      paymentId: updatedPayment._id,
      transactionId: updatedPayment.transactionId,
      invoiceNumber: updatedPayment.invoiceNumber,
      amount: updatedPayment.totalAmount,
      mode,
    });

    await notificationService.notifyPaymentSuccess(userId, updatedPayment._id.toString(), updatedPayment.totalAmount);

    // Update Booking status to CONFIRMED and add timeline event
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = BookingStatus.CONFIRMED;

      if (!booking.timeline) booking.timeline = [];
      booking.timeline.push({
        status: BookingStatus.CONFIRMED,
        timestamp: new Date(),
        description: 'Payment verified successfully and booking confirmed',
        updatedBy: new Types.ObjectId(userId),
      });

      await booking.save();
      logger.info('Booking Confirmed', { bookingId: booking._id, status: booking.status });

      // Provider Earnings & Admin Commission calculation
      const providerUserId = booking.cookId?.toString();
      if (providerUserId && Types.ObjectId.isValid(providerUserId)) {
        const netProviderAmount = Math.max(0, updatedPayment.totalAmount - (updatedPayment.platformFee || 50));
        await walletService.creditWallet(
          providerUserId,
          WalletOwnerType.PROVIDER,
          netProviderAmount,
          `Provider earnings for Booking ${booking.bookingNumber}`,
          updatedPayment._id.toString(),
        );
        logger.info('Wallet Updated: Provider earnings credited', {
          providerUserId,
          netProviderAmount,
          commission: updatedPayment.platformFee,
        });
      }
    }

    return updatedPayment;
  }

  async confirmCod(userId: string, input: ConfirmCodDTO): Promise<IPaymentDocument> {
    const payment = await paymentRepository.findById(input.paymentId);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    const updated = await paymentRepository.updateById(payment._id.toString(), {
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      paidAt: new Date(),
    });

    if (!updated) {
      throw ApiError.internal('Failed to confirm COD payment');
    }

    // Update Booking Status to CONFIRMED
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = BookingStatus.CONFIRMED;
      if (!booking.timeline) booking.timeline = [];
      booking.timeline.push({
        status: BookingStatus.CONFIRMED,
        timestamp: new Date(),
        description: 'COD Payment confirmed by provider/customer',
        updatedBy: new Types.ObjectId(userId),
      });
      await booking.save();
      logger.info('Booking Confirmed via COD', { bookingId: booking._id });
    }

    logger.info('Payment Success: COD Payment confirmed', { paymentId: updated._id, invoiceNumber: updated.invoiceNumber });
    return updated;
  }

  async refundPayment(userId: string, input: RefundPaymentDTO): Promise<IPaymentDocument> {
    const payment = await paymentRepository.findById(input.paymentId);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.paymentStatus !== 'paid') {
      throw ApiError.badRequest('Only paid transactions can be refunded');
    }

    const refundAmt = input.amount ?? payment.totalAmount;

    // Credit refund to customer wallet
    await walletService.creditWallet(
      payment.userId.toString(),
      WalletOwnerType.CUSTOMER,
      refundAmt,
      `Refund for Booking ${payment.bookingId.toString()}: ${input.reason || 'Cancelled'}`,
      payment._id.toString(),
    );

    const updated = await paymentRepository.updateById(payment._id.toString(), {
      paymentStatus: 'refunded',
      refundedAt: new Date(),
      refundAmount: refundAmt,
    });

    if (!updated) {
      throw ApiError.internal('Failed to process refund');
    }

    // Update Booking status to CANCELLED
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = input.reason || 'Refund issued';
      if (!booking.timeline) booking.timeline = [];
      booking.timeline.push({
        status: BookingStatus.CANCELLED,
        timestamp: new Date(),
        description: `Booking cancelled and refund of ₹${refundAmt} processed to wallet`,
        updatedBy: new Types.ObjectId(userId),
      });
      await booking.save();
    }

    logger.info('Refund', { paymentId: updated._id, refundAmount: refundAmt, reason: input.reason });
    logger.info('Wallet Updated: Customer wallet credited with refund', { userId: payment.userId, refundAmount: refundAmt });

    return updated;
  }

  async getPaymentHistory(userId: string, filter: PaymentFilterDTO) {
    return paymentRepository.findUserPaymentHistory(userId, filter);
  }

  async getPaymentById(paymentId: string, userId: string): Promise<IPaymentDocument> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.userId.toString() !== userId && payment.providerId.toString() !== userId) {
      throw ApiError.forbidden('You are not authorized to view this invoice');
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
