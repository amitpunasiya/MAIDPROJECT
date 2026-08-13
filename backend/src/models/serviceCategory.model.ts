import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IServiceCategory {
  name: string;
  slug: string;
  icon?: string;
  bannerImage?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface IServiceCategoryDocument extends IServiceCategory, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
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
    description: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
    ...softDeleteFields,
  },
  { timestamps: true },
);

serviceCategorySchema.index({ isActive: 1, isFeatured: 1, displayOrder: 1 });

export const ServiceCategory = model<IServiceCategoryDocument>('ServiceCategory', serviceCategorySchema);
