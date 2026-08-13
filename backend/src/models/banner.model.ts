import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IBanner {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  sortOrder: number;
  targetRole?: 'all' | 'customer' | 'provider';
}

export interface IBannerDocument extends IBanner, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBannerDocument>(
  {
    title: { type: String, required: [true, 'Banner title is required'], trim: true },
    subtitle: { type: String, trim: true },
    imageUrl: { type: String, required: [true, 'Banner image URL is required'], trim: true },
    ctaText: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    targetRole: {
      type: String,
      enum: ['all', 'customer', 'provider'],
      default: 'all',
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

bannerSchema.index({ isActive: 1, sortOrder: 1 });

export const Banner = model<IBannerDocument>('Banner', bannerSchema);
