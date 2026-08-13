import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IServicePricing {
  serviceId: Types.ObjectId;
  subServiceId?: Types.ObjectId;
  city?: string;
  branchId?: Types.ObjectId;
  providerId?: Types.ObjectId;
  weekendMultiplier: number;
  festivalMultiplier: number;
  emergencyMultiplier: number;
  discountPrice?: number;
  offerPrice?: number;
  taxPercentage: number;
  isActive: boolean;
}

export interface IServicePricingDocument extends IServicePricing, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const servicePricingSchema = new Schema<IServicePricingDocument>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCatalog',
      required: [true, 'Service reference is required'],
      index: true,
    },
    subServiceId: { type: Schema.Types.ObjectId, ref: 'SubService', index: true },
    city: { type: String, trim: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', index: true },
    weekendMultiplier: { type: Number, default: 1.15, min: 1.0 },
    festivalMultiplier: { type: Number, default: 1.25, min: 1.0 },
    emergencyMultiplier: { type: Number, default: 1.5, min: 1.0 },
    discountPrice: { type: Number, min: 0 },
    offerPrice: { type: Number, min: 0 },
    taxPercentage: { type: Number, default: 18, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

servicePricingSchema.index({ serviceId: 1, city: 1, branchId: 1, providerId: 1 });

export const ServicePricing = model<IServicePricingDocument>('ServicePricing', servicePricingSchema);
