import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export type PriceType = 'per_hour' | 'per_sqft' | 'per_item' | 'fixed';

export interface IServiceCatalog {
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  icon?: string;
  bannerImage?: string;
  galleryImages: string[];
  description: string;
  shortDescription?: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  priceType: PriceType;
  estimatedDurationMinutes: number;
  requiredStaff: number;
  equipmentRequired: string[];
  materialsRequired: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  availableCities: string[];
  availableBranches: Types.ObjectId[];
  gstPercentage: number;
  verificationRequired?: boolean;
  skillsRequired?: string[];
}

export interface IServiceCatalogDocument extends IServiceCatalog, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCatalogSchema = new Schema<IServiceCatalogDocument>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Category reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    icon: { type: String, trim: true },
    bannerImage: { type: String, trim: true },
    galleryImages: { type: [String], default: [] },
    description: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    basePrice: { type: Number, required: true, min: 0 },
    minPrice: { type: Number, default: 0, min: 0 },
    maxPrice: { type: Number, default: 10000, min: 0 },
    priceType: {
      type: String,
      enum: ['per_hour', 'per_sqft', 'per_item', 'fixed'],
      default: 'fixed',
    },
    estimatedDurationMinutes: { type: Number, default: 60, min: 15 },
    requiredStaff: { type: Number, default: 1, min: 1 },
    equipmentRequired: { type: [String], default: [] },
    materialsRequired: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    availableCities: { type: [String], default: [] },
    availableBranches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    gstPercentage: { type: Number, default: 18, min: 0, max: 28 },
    verificationRequired: { type: Boolean, default: false, index: true },
    skillsRequired: { type: [String], default: [] },
    ...softDeleteFields,
  },
  { timestamps: true },
);

serviceCatalogSchema.index({ categoryId: 1, isActive: 1 });
serviceCatalogSchema.index({ name: 'text', description: 'text' });

export const ServiceCatalog = model<IServiceCatalogDocument>('ServiceCatalog', serviceCatalogSchema);
