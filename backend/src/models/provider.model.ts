import { Schema, model } from 'mongoose';
import { softDeleteFields } from './common/softDelete.js';
import type { IProviderDocument } from '../modules/providers/interfaces/provider.interface.js';

const providerServiceItemSchema = new Schema(
  {
    serviceName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, trim: true, default: '1 hour' },
    category: { type: String, trim: true, default: 'General' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: true },
);

const dayScheduleSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isWorking: { type: Boolean, default: true },
    startTime: { type: String, default: '08:00' },
    endTime: { type: String, default: '18:00' },
    breakStartTime: { type: String, default: '13:00' },
    breakEndTime: { type: String, default: '14:00' },
  },
  { _id: false },
);

const galleryItemSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const providerLocationSchema = new Schema(
  {
    country: { type: String, default: 'India', trim: true },
    state: { type: String, default: '', trim: true, index: true },
    city: { type: String, default: '', trim: true, index: true },
    currentAddress: { type: String, default: '', trim: true },
    workingAreas: { type: [String], default: [] },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    serviceRadiusKm: { type: Number, default: 10, min: 1 },
  },
  { _id: false },
);

const providerPricingSchema = new Schema(
  {
    hourlyPrice: { type: Number, default: 100, min: 0, index: true },
    dailyPrice: { type: Number, default: 800, min: 0 },
    visitCharge: { type: Number, default: 150, min: 0 },
    emergencyCharge: { type: Number, default: 250, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
  },
  { _id: false },
);

const bankDetailsSchema = new Schema(
  {
    accountName: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: '' },
    ifscCode: { type: String, trim: true, default: '' },
    upiId: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const providerDocsSchema = new Schema(
  {
    aadhaarNumber: { type: String, trim: true, default: '' },
    aadhaarDoc: { type: String, trim: true, default: '' },
    panNumber: { type: String, trim: true, default: '' },
    panDoc: { type: String, trim: true, default: '' },
    profilePhotoDoc: { type: String, trim: true, default: '' },
    selfiePhotoDoc: { type: String, trim: true, default: '' },
    certificates: { type: [String], default: [] },
    experienceDocs: { type: [String], default: [] },
    policeVerificationDoc: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const providerSchema = new Schema<IProviderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    providerType: {
      type: String,
      enum: ['cook', 'maid', 'babysitter', 'eldercare', 'cleaning', 'other'],
      default: 'cook',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
      index: true,
    },
    dob: { type: Date },
    profilePhoto: { type: String, trim: true, default: '' },
    experienceYears: { type: Number, default: 0, min: 0, max: 60, index: true },
    languages: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },
    bio: { type: String, trim: true, maxlength: 2000, default: '' },
    aadhaarVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    policeVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'approved', 'rejected', 'suspended'],
      default: 'unverified',
      index: true,
    },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    totalRatings: { type: Number, default: 0, min: 0 },
    totalReviews: { type: Number, default: 0, min: 0 },
    totalBookings: { type: Number, default: 0, min: 0 },
    completedBookings: { type: Number, default: 0, min: 0 },
    cancelledJobs: { type: Number, default: 0, min: 0 },
    lastSeen: { type: Date, default: Date.now },
    location: { type: providerLocationSchema, default: () => ({}) },
    geoPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716],
      },
    },
    services: { type: [providerServiceItemSchema], default: [] },
    schedule: { type: [dayScheduleSchema], default: [] },
    holidaySupport: { type: Boolean, default: false },
    pricing: { type: providerPricingSchema, default: () => ({}) },
    documents: { type: providerDocsSchema, default: () => ({}) },
    gallery: { type: [galleryItemSchema], default: [] },
    ...softDeleteFields,
  },
  { timestamps: true },
);

// Indexes for fast spatial & multi-attribute querying
providerSchema.index({ geoPoint: '2dsphere' });
providerSchema.index({ 'location.city': 1, providerType: 1, isAvailable: 1, isDeleted: 1 });
providerSchema.index({ 'location.state': 1, isAvailable: 1 });
providerSchema.index({ averageRating: -1, totalRatings: -1 });
providerSchema.index({ fullName: 'text', skills: 'text', bio: 'text' });

export const Provider = model<IProviderDocument>('Provider', providerSchema);
