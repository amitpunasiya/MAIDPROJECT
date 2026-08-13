import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IReview {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  cookId: Types.ObjectId;
  comment: string;
  isPublished: boolean;
  publishedAt?: Date;
  moderatedBy?: Types.ObjectId;
  moderationNotes?: string;
}

export interface IReviewDocument extends IReview, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
      index: true,
    },
    cookId: {
      type: Schema.Types.ObjectId,
      ref: 'Cook',
      required: [true, 'Cook is required'],
      index: true,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderationNotes: { type: String, trim: true, maxlength: 500 },
    ...softDeleteFields,
  },
  { timestamps: true },
);

reviewSchema.index({ cookId: 1, isPublished: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, createdAt: -1 });

export const Review = model<IReviewDocument>('Review', reviewSchema);
