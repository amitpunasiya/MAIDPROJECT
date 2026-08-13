import { Schema, model, type Document, type Types } from 'mongoose';
import { VerificationStatus } from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IMaid {
  userId: Types.ObjectId;
  walletId?: Types.ObjectId;
  bio?: string;
  experienceYears: number;
  services: string[];
  skills: string[];
  languages: string[];
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;
  averageRating: number;
  totalRatings: number;
  totalBookings: number;
  completedBookings: number;
  isAvailable: boolean;
  isFeatured: boolean;
  hourlyRate: number;
  currency: string;
}

export interface IMaidDocument extends IMaid, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const maidSchema = new Schema<IMaidDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      index: true,
    },
    bio: { type: String, trim: true, maxlength: 1000 },
    experienceYears: { type: Number, default: 0, min: 0, max: 60 },
    services: {
      type: [String],
      default: ['cleaning', 'dusting', 'utensil_washing'],
      required: [true, 'At least one service is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'At least one service is required',
      },
      index: true,
    },
    skills: { type: [String], default: [], index: true },
    languages: { type: [String], default: [] },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    totalBookings: { type: Number, default: 0, min: 0 },
    completedBookings: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    hourlyRate: { type: Number, required: [true, 'Hourly rate is required'], min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

maidSchema.index({ verificationStatus: 1, isAvailable: 1, isDeleted: 1 });
maidSchema.index({ averageRating: -1, totalRatings: -1 });
maidSchema.index({ services: 1, isAvailable: 1 });

export const Maid = model<IMaidDocument>('Maid', maidSchema);
