import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IDispute {
  bookingId: Types.ObjectId;
  openedBy: Types.ObjectId;
  againstUser: Types.ObjectId;
  reason: string;
  description: string;
  attachments?: string[];
  status: 'open' | 'under_review' | 'resolved' | 'rejected' | 'cancelled';
  resolution?: string;
  refundAmount?: number;
  adminNotes?: string;
}

export interface IDisputeDocument extends IDispute, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDisputeDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    againstUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected', 'cancelled'], default: 'open', index: true },
    resolution: { type: String, trim: true, default: '' },
    refundAmount: { type: Number, default: 0 },
    adminNotes: { type: String, trim: true, default: '' },
    ...softDeleteFields,
  },
  { timestamps: true },
);

disputeSchema.index({ bookingId: 1, openedBy: 1 });

export const Dispute = model<IDisputeDocument>('Dispute', disputeSchema);
