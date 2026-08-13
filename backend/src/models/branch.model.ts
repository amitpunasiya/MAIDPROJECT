import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IBranch {
  providerId: Types.ObjectId;
  name: string;
  code?: string;
  city: string;
  address: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  serviceRadiusKm: number;
  operationalAreas?: string[];
  timing: string;
  isActive: boolean;
}

export interface IBranchDocument extends IBranch, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranchDocument>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Provider reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    latitude: { type: Number },
    longitude: { type: Number },
    managerName: { type: String, trim: true, default: '' },
    managerPhone: { type: String, trim: true, default: '' },
    managerEmail: { type: String, trim: true, default: '' },
    serviceRadiusKm: { type: Number, default: 10, min: 1 },
    operationalAreas: { type: [String], default: [] },
    timing: { type: String, default: '08:00 AM - 08:00 PM' },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

branchSchema.index({ providerId: 1, city: 1 });
branchSchema.index({ isActive: 1, isDeleted: 1 });

export const Branch = model<IBranchDocument>('Branch', branchSchema);
