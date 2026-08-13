import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IRatingScores {
  overall: number;
  punctuality: number;
  quality: number;
  professionalism: number;
}

export interface IRating {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  cookId: Types.ObjectId;
  reviewId?: Types.ObjectId;
  scores: IRatingScores;
}

export interface IRatingDocument extends IRating, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ratingScoreValidator = {
  validator: (value: number) => value >= 1 && value <= 5,
  message: 'Rating must be between 1 and 5',
};

const ratingScoresSchema = new Schema<IRatingScores>(
  {
    overall: { type: Number, required: true, min: 1, max: 5, validate: ratingScoreValidator },
    punctuality: { type: Number, required: true, min: 1, max: 5, validate: ratingScoreValidator },
    quality: { type: Number, required: true, min: 1, max: 5, validate: ratingScoreValidator },
    professionalism: { type: Number, required: true, min: 1, max: 5, validate: ratingScoreValidator },
  },
  { _id: false },
);

const ratingSchema = new Schema<IRatingDocument>(
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
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    scores: { type: ratingScoresSchema, required: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

ratingSchema.index({ cookId: 1, 'scores.overall': -1 });
ratingSchema.index({ customerId: 1, createdAt: -1 });

export const Rating = model<IRatingDocument>('Rating', ratingSchema);
