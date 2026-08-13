import { Schema, model, type Document, type Types } from 'mongoose';
import {
  Currency,
  DayOfWeek,
  ServiceType,
  SubscriptionPlanType,
  SubscriptionStatus,
} from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ISubscriptionScheduleSlot {
  startTime: string;
  endTime: string;
}

export interface ISubscriptionSchedule {
  dayOfWeek: DayOfWeek;
  slots: ISubscriptionScheduleSlot[];
}

export interface ISubscription {
  subscriptionNumber: string;
  customerId: Types.ObjectId;
  cookId?: Types.ObjectId;
  serviceType: ServiceType;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  schedule: ISubscriptionSchedule[];
  pricePerCycle: number;
  currency: Currency;
  autoRenew: boolean;
  totalCycles: number;
  completedCycles: number;
  nextBillingDate?: Date;
  pausedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface ISubscriptionDocument extends ISubscription, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleSlotSchema = new Schema<ISubscriptionScheduleSlot>(
  {
    startTime: { type: String, required: true, match: [timePattern, 'Invalid time format'] },
    endTime: { type: String, required: true, match: [timePattern, 'Invalid time format'] },
  },
  { _id: false },
);

const scheduleSchema = new Schema<ISubscriptionSchedule>(
  {
    dayOfWeek: {
      type: Number,
      enum: Object.values(DayOfWeek).filter((value) => typeof value === 'number'),
      required: true,
    },
    slots: {
      type: [scheduleSlotSchema],
      validate: {
        validator: (value: ISubscriptionScheduleSlot[]) => value.length > 0,
        message: 'At least one slot is required per schedule day',
      },
    },
  },
  { _id: false },
);

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    subscriptionNumber: {
      type: String,
      required: [true, 'Subscription number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
      index: true,
    },
    cookId: { type: Schema.Types.ObjectId, ref: 'Cook', index: true },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      required: [true, 'Service type is required'],
    },
    planType: {
      type: String,
      enum: Object.values(SubscriptionPlanType),
      required: [true, 'Plan type is required'],
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
      index: true,
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    schedule: {
      type: [scheduleSchema],
      validate: {
        validator: (value: ISubscriptionSchedule[]) => value.length > 0,
        message: 'At least one schedule day is required',
      },
    },
    pricePerCycle: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: Object.values(Currency), default: Currency.INR },
    autoRenew: { type: Boolean, default: true },
    totalCycles: { type: Number, default: 0, min: 0 },
    completedCycles: { type: Number, default: 0, min: 0 },
    nextBillingDate: { type: Date, index: true },
    pausedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    ...softDeleteFields,
  },
  { timestamps: true },
);

subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ cookId: 1, status: 1 });
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });

export const Subscription = model<ISubscriptionDocument>('Subscription', subscriptionSchema);
