import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IPayment {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  discountAmount: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'razorpay' | 'stripe' | 'cod' | 'wallet' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  receiptUrl?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IPaymentDocument extends IPayment, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider reference is required'],
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod', 'wallet', 'online'],
      default: 'online',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    transactionId: { type: String, trim: true, index: true },
    receiptUrl: { type: String, trim: true, default: '' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0, min: 0 },
    ...softDeleteFields,
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, paymentStatus: 1, createdAt: -1 });
paymentSchema.index({ providerId: 1, paymentStatus: 1, createdAt: -1 });

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
