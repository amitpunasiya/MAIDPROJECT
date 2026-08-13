import { Schema, model, type Document, type Types } from 'mongoose';
import { ServiceType, VerificationStatus } from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ICook {
  userId: Types.ObjectId;
  walletId?: Types.ObjectId;
  bio?: string;
  experienceYears: number;
  serviceTypes: ServiceType[];
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

export interface ICookDocument extends ICook, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cookSchema = new Schema<ICookDocument>(
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
    serviceTypes: {
      type: [String],
      enum: Object.values(ServiceType),
      required: [true, 'At least one service type is required'],
      validate: {
        validator: (value: ServiceType[]) => value.length > 0,
        message: 'At least one service type is required',
      },
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

cookSchema.index({ verificationStatus: 1, isAvailable: 1, isDeleted: 1 });
cookSchema.index({ averageRating: -1, totalRatings: -1 });
cookSchema.index({ serviceTypes: 1, isAvailable: 1 });

export const Cook = model<ICookDocument>('Cook', cookSchema);
