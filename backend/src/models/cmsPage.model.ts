import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ICmsPage {
  title: string;
  slug: string;
  description?: string;
  content: string;
  images?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status: 'published' | 'draft';
  version: number;
  lastUpdatedBy?: Types.ObjectId;
}

export interface ICmsPageDocument extends ICmsPage, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cmsPageSchema = new Schema<ICmsPageDocument>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    content: { type: String, required: [true, 'Content is required'] },
    images: { type: [String], default: [] },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
      index: true,
    },
    version: { type: Number, default: 1, min: 1 },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    ...softDeleteFields,
  },
  { timestamps: true },
);

cmsPageSchema.index({ slug: 1, status: 1 });

export const CmsPage = model<ICmsPageDocument>('CmsPage', cmsPageSchema);
