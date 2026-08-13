import { Schema, model, type Document, type Types } from 'mongoose';

export interface IActivityLog {
  userId?: Types.ObjectId;
  userRole?: string;
  action: string;
  module: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userRole: { type: String, trim: true, default: 'system' },
    action: { type: String, required: true, trim: true, uppercase: true, index: true },
    module: { type: String, required: true, trim: true, lowercase: true, index: true },
    entityId: { type: String, trim: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, trim: true, default: '' },
    userAgent: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

activityLogSchema.index({ userId: 1, module: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, action: 1, createdAt: -1 });

export const ActivityLog = model<IActivityLogDocument>('ActivityLog', activityLogSchema);
