import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ISubService {
  serviceId: Types.ObjectId;
  name: string;
  description?: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  gstPercentage: number;
  platformFee: number;
  homeVisitPrice?: number;
  clinicPrice?: number;
  emergencyPrice?: number;
  weekendPrice?: number;
  festivalPrice?: number;
  popularityScore: number;
  ratingsAverage: number;
  bookingCount: number;
  estimatedDurationMinutes: number;
  requiredStaff: number;
  requiredEquipment: string[];
  unit: string;
  status: 'active' | 'disabled' | 'archived';
  isActive: boolean;
}

export interface ISubServiceDocument extends ISubService, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subServiceSchema = new Schema<ISubServiceDocument>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCatalog',
      required: [true, 'Service reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Sub-service name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    images: { type: [String], default: [] },
    basePrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    gstPercentage: { type: Number, default: 18, min: 0, max: 28 },
    platformFee: { type: Number, default: 50, min: 0 },
    homeVisitPrice: { type: Number, min: 0 },
    clinicPrice: { type: Number, min: 0 },
    emergencyPrice: { type: Number, min: 0 },
    weekendPrice: { type: Number, min: 0 },
    festivalPrice: { type: Number, min: 0 },
    popularityScore: { type: Number, default: 0, index: true },
    ratingsAverage: { type: Number, default: 4.8, min: 0, max: 5.0 },
    bookingCount: { type: Number, default: 0, min: 0 },
    estimatedDurationMinutes: { type: Number, default: 30, min: 5 },
    requiredStaff: { type: Number, default: 1, min: 1 },
    requiredEquipment: { type: [String], default: [] },
    unit: { type: String, default: 'unit', trim: true },
    status: {
      type: String,
      enum: ['active', 'disabled', 'archived'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

subServiceSchema.index({ serviceId: 1, isActive: 1, status: 1 });
subServiceSchema.index({ popularityScore: -1 });

export const SubService = model<ISubServiceDocument>('SubService', subServiceSchema);
