  import { Schema, model, type Document, type Types } from 'mongoose';
  import { BookingSlotStatus } from '../types/domain.enums.js';
  import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

  export interface IBookingSlot {
    cookId: Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    status: BookingSlotStatus;
    bookingId?: Types.ObjectId;
    blockedReason?: string;
  }

  export interface IBookingSlotDocument extends IBookingSlot, ISoftDelete, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }

  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

  const bookingSlotSchema = new Schema<IBookingSlotDocument>(
    {
      cookId: {
        type: Schema.Types.ObjectId,
        ref: 'Cook',
        required: [true, 'Cook is required'],
        index: true,
      },
      date: {
        type: Date,
        required: [true, 'Date is required'],
        index: true,
      },
      startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [timePattern, 'Start time must be in HH:mm format'],
      },
      endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [timePattern, 'End time must be in HH:mm format'],
      },
      status: {
        type: String,
        enum: Object.values(BookingSlotStatus),
        default: BookingSlotStatus.AVAILABLE,
        index: true,
      },
      bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', sparse: true },
      blockedReason: { type: String, trim: true, maxlength: 300 },
      ...softDeleteFields,
    },
    { timestamps: true },
  );

  bookingSlotSchema.index({ cookId: 1, date: 1, startTime: 1 }, { unique: true });
  bookingSlotSchema.index({ cookId: 1, date: 1, status: 1 });

  export const BookingSlot = model<IBookingSlotDocument>('BookingSlot', bookingSlotSchema);
