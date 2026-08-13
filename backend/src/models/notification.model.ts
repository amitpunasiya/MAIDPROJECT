import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type:
    | 'booking_created'
    | 'booking_assigned'
    | 'booking_accepted'
    | 'booking_cancelled'
    | 'booking_completed'
    | 'payment_success'
    | 'payment_failed'
    | 'wallet_credited'
    | 'wallet_debited'
    | 'reminder'
    | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'push' | 'email' | 'sms' | 'in_app';
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
}

export interface INotificationDocument extends INotification, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_assigned',
        'booking_accepted',
        'booking_cancelled',
        'booking_completed',
        'payment_success',
        'payment_failed',
        'wallet_credited',
        'wallet_debited',
        'reminder',
        'system',
      ],
      default: 'system',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      default: 'in_app',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    ...softDeleteFields,
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1, createdAt: -1 });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
