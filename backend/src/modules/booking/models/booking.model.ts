import { Schema, model, type Document, type Types } from 'mongoose';
import { BookingStatus, Currency, ServiceType } from '../../../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from '../../../models/common/softDelete.js';
import type { IAddress } from '../../../models/user.model.js';

export interface IBookingPricing {
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  currency: Currency;
}

export interface IBookingTimelineItem {
  status: BookingStatus | string;
  timestamp: Date;
  description: string;
  updatedBy?: Types.ObjectId;
  metadata?: Record<string, unknown>;
}

export interface IBooking {
  bookingNumber: string;
  customerId: Types.ObjectId;
  cookId: Types.ObjectId;
  slotId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  couponId?: Types.ObjectId;
  paymentId?: Types.ObjectId;
  serviceType: ServiceType;
  serviceCategory?: string;
  status: BookingStatus;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  slotType?: 'PREDEFINED' | 'CUSTOM';
  providerSelectionMode?: 'SPECIFIC' | 'AUTO_MATCH';
  requestStatus?: 'PENDING_PROVIDER_ACCEPTANCE' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  serviceAddress: IAddress;
  pricing: IBookingPricing;
  categoryId?: Types.ObjectId;
  serviceCatalogId?: Types.ObjectId;
  subServiceId?: Types.ObjectId;
  taskName?: string;
  taskDetails?: Record<string, unknown>;
  instructions?: string;
  photos?: string[];
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  acceptedAt?: Date;
  onTheWayAt?: Date;
  arrivedAt?: Date;
  startOtpHash?: string;
  startOtpRaw?: string;
  startOtpExpiresAt?: Date;
  startOtpAttempts?: number;
  otpVerifiedAt?: Date;
  lastProviderLatitude?: number;
  lastProviderLongitude?: number;
  lastProviderLocationAt?: Date;
  distanceKm?: number;
  etaMinutes?: number;
  timeline?: IBookingTimelineItem[];
}

export interface IBookingDocument extends IBooking, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
);

const bookingPricingSchema = new Schema<IBookingPricing>(
  {
    baseAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    platformFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: Object.values(Currency), default: Currency.INR },
  },
  { _id: false },
);

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: {
      type: String,
      required: [true, 'Booking number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    cookId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider (Cook/Maid) is required'],
      index: true,
    },
    slotId: { type: Schema.Types.ObjectId, ref: 'BookingSlot', index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', index: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      required: [true, 'Service type is required'],
    },
    serviceCategory: {
      type: String,
      enum: ['COOK', 'MAID', 'BABYSITTER', 'HOUSEHOLD_TASK', 'PHYSIOTHERAPY', 'OCCUPATIONAL_THERAPY'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    scheduledDate: { type: Date, required: [true, 'Scheduled date is required'], index: true },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
    },
    durationHours: { type: Number, required: true, min: 0.5, max: 24 },
    slotType: { type: String, enum: ['PREDEFINED', 'CUSTOM'], default: 'PREDEFINED', index: true },
    providerSelectionMode: { type: String, enum: ['SPECIFIC', 'AUTO_MATCH'], default: 'SPECIFIC', index: true },
    requestStatus: {
      type: String,
      enum: ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING_PROVIDER_ACCEPTANCE',
      index: true,
    },
    serviceAddress: { type: addressSchema, required: true },
    pricing: { type: bookingPricingSchema, required: true },
    taskName: { type: String, trim: true },
    taskDetails: { type: Schema.Types.Mixed },
    instructions: { type: String, trim: true, maxlength: 1000 },
    photos: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 1000 },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    acceptedAt: { type: Date },
    onTheWayAt: { type: Date },
    arrivedAt: { type: Date },
    startOtpHash: { type: String, trim: true },
    startOtpRaw: { type: String, trim: true },
    startOtpExpiresAt: { type: Date },
    startOtpAttempts: { type: Number, default: 0 },
    otpVerifiedAt: { type: Date },
    lastProviderLatitude: { type: Number },
    lastProviderLongitude: { type: Number },
    lastProviderLocationAt: { type: Date },
    distanceKm: { type: Number },
    etaMinutes: { type: Number },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        metadata: { type: Schema.Types.Mixed },
      },
    ],
    ...softDeleteFields,
  },
  { timestamps: true },
);

bookingSchema.index({ customerId: 1, status: 1, scheduledDate: -1 });
bookingSchema.index({ cookId: 1, status: 1, scheduledDate: -1 });
bookingSchema.index({ status: 1, scheduledDate: 1, isDeleted: 1 });

export const Booking = model<IBookingDocument>('Booking', bookingSchema);
