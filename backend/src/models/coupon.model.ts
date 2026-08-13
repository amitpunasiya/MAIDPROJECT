import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ICoupon {
  code: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  applicableCities?: string[];
  applicableServices?: string[];
  isActive: boolean;
}

export interface ICouponDocument extends ICoupon, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minBookingAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    applicableCities: { type: [String], default: [] },
    applicableServices: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = model<ICouponDocument>('Coupon', couponSchema);
