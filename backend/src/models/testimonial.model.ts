import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ITestimonial {
  customerName: string;
  avatar?: string;
  city: string;
  service: string;
  rating: number;
  content: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface ITestimonialDocument extends ITestimonial, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonialDocument>(
  {
    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
    avatar: { type: String, trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    service: { type: String, required: [true, 'Service is required'], trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    content: { type: String, required: [true, 'Content is required'], trim: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

testimonialSchema.index({ approvalStatus: 1, createdAt: -1 });

export const Testimonial = model<ITestimonialDocument>('Testimonial', testimonialSchema);
