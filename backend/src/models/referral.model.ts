import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IReferral {
  referrerUserId: Types.ObjectId;
  referralCode: string;
  referredUserId?: Types.ObjectId;
  referredEmail?: string;
  referredPhone?: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  rewardStatus: 'pending' | 'credited' | 'failed';
  completedAt?: Date;
}

export interface IReferralDocument extends IReferral, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferralDocument>(
  {
    referrerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Referrer user ID is required'],
      index: true,
    },
    referralCode: {
      type: String,
      required: [true, 'Referral code is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    referredEmail: { type: String, trim: true, lowercase: true },
    referredPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
      index: true,
    },
    rewardAmount: { type: Number, default: 100, min: 0 },
    rewardStatus: {
      type: String,
      enum: ['pending', 'credited', 'failed'],
      default: 'pending',
      index: true,
    },
    completedAt: { type: Date },
    ...softDeleteFields,
  },
  { timestamps: true },
);

referralSchema.index({ referrerUserId: 1, referralCode: 1 });

export const Referral = model<IReferralDocument>('Referral', referralSchema);
