import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IReport {
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  category: string;
  description: string;
  attachments?: string[];
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  adminNotes?: string;
}

export interface IReportDocument extends IReport, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'reviewed', 'action_taken', 'dismissed'], default: 'pending', index: true },
    adminNotes: { type: String, trim: true, default: '' },
    ...softDeleteFields,
  },
  { timestamps: true },
);

reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ reportedUserId: 1, createdAt: -1 });

export const Report = model<IReportDocument>('Report', reportSchema);
