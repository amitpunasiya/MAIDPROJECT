import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IRecurringBooking {
  customerId: Types.ObjectId;
  workerId?: Types.ObjectId;
  taskName: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: string;
  startTime: string;
  durationHours: number;
  serviceAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  hourlyRate: number;
  nextBookingDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  instructions?: string;
}

export interface IRecurringBookingDocument extends IRecurringBooking, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const recurringBookingSchema = new Schema<IRecurringBookingDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    taskName: { type: String, required: true, trim: true },
    frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], required: true },
    dayOfWeek: { type: String, trim: true, default: 'Saturday' },
    startTime: { type: String, required: true, default: '08:00 AM' },
    durationHours: { type: Number, required: true, default: 1 },
    serviceAddress: {
      street: { type: String, default: '' },
      city: { type: String, required: true, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '560001' },
      country: { type: String, default: 'India' },
    },
    hourlyRate: { type: Number, required: true, default: 250 },
    nextBookingDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active', index: true },
    instructions: { type: String, trim: true, default: '' },
    ...softDeleteFields,
  },
  { timestamps: true },
);

recurringBookingSchema.index({ customerId: 1, status: 1, nextBookingDate: 1 });

export const RecurringBooking = model<IRecurringBookingDocument>('RecurringBooking', recurringBookingSchema);
