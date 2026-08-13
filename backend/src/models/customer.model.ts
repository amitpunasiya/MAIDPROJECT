import { Schema, model, type Document, type Types } from 'mongoose';
import { ServiceType } from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ICustomerPreferences {
  serviceTypes: ServiceType[];
  dietaryRestrictions?: string[];
  preferredLanguages?: string[];
  notes?: string;
}

export interface ICustomer {
  userId: Types.ObjectId;
  walletId?: Types.ObjectId;
  preferences: ICustomerPreferences;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  loyaltyPoints: number;
  isActive: boolean;
}

export interface ICustomerDocument extends ICustomer, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerPreferencesSchema = new Schema<ICustomerPreferences>(
  {
    serviceTypes: {
      type: [String],
      enum: Object.values(ServiceType),
      default: [ServiceType.COOK],
    },
    dietaryRestrictions: { type: [String], default: [] },
    preferredLanguages: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const customerSchema = new Schema<ICustomerDocument>(
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
    preferences: {
      type: customerPreferencesSchema,
      default: () => ({}),
    },
    totalBookings: { type: Number, default: 0, min: 0 },
    completedBookings: { type: Number, default: 0, min: 0 },
    cancelledBookings: { type: Number, default: 0, min: 0 },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

customerSchema.index({ isActive: 1, isDeleted: 1 });
customerSchema.index({ loyaltyPoints: -1 });

export const Customer = model<ICustomerDocument>('Customer', customerSchema);
