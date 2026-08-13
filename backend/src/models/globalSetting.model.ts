import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IGeneralSettings {
  appName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultLanguage: string;
  timezone: string;
}

export interface IBookingSettings {
  bookingRadiusKm: number;
  cancellationTimeHours: number;
  rescheduleLimit: number;
  autoAssignProvider: boolean;
  bookingExpiryMinutes: number;
}

export interface IPaymentSettings {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  platformCommissionPercentage: number;
  gstPercentage: number;
  currency: string;
  walletEnabled: boolean;
  codEnabled: boolean;
}

export interface INotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface ISecuritySettings {
  jwtExpiry: string;
  refreshTokenExpiry: string;
  otpExpiryMinutes: number;
  maxLoginAttempts: number;
}

export interface IMaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
}

export interface IGlobalSettings {
  general: IGeneralSettings;
  booking: IBookingSettings;
  payment: IPaymentSettings;
  notifications: INotificationSettings;
  security: ISecuritySettings;
  maintenance: IMaintenanceSettings;
  socialLinks: ISocialLinks;
}

export interface IGlobalSettingsDocument extends IGlobalSettings, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const globalSettingsSchema = new Schema<IGlobalSettingsDocument>(
  {
    general: {
      appName: { type: String, default: 'Maid & Cook Service Platform', trim: true },
      companyName: { type: String, default: 'MaidProject Inc.', trim: true },
      supportEmail: { type: String, default: 'support@maidproject.com', trim: true },
      supportPhone: { type: String, default: '+91 9999999999', trim: true },
      logoUrl: { type: String, default: '' },
      faviconUrl: { type: String, default: '' },
      defaultLanguage: { type: String, default: 'en' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },
    booking: {
      bookingRadiusKm: { type: Number, default: 15, min: 1 },
      cancellationTimeHours: { type: Number, default: 2, min: 0 },
      rescheduleLimit: { type: Number, default: 3, min: 0 },
      autoAssignProvider: { type: Boolean, default: false },
      bookingExpiryMinutes: { type: Number, default: 30, min: 1 },
    },
    payment: {
      razorpayKeyId: { type: String, default: '' },
      razorpayKeySecret: { type: String, default: '' },
      platformCommissionPercentage: { type: Number, default: 10, min: 0, max: 100 },
      gstPercentage: { type: Number, default: 5, min: 0, max: 100 },
      currency: { type: String, default: 'INR' },
      walletEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
      whatsappEnabled: { type: Boolean, default: true },
    },
    security: {
      jwtExpiry: { type: String, default: '1d' },
      refreshTokenExpiry: { type: String, default: '7d' },
      otpExpiryMinutes: { type: Number, default: 10, min: 1 },
      maxLoginAttempts: { type: Number, default: 5, min: 1 },
    },
    maintenance: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: {
        type: String,
        default: 'System under scheduled maintenance. Please check back soon.',
      },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

export const GlobalSettings = model<IGlobalSettingsDocument>('GlobalSettings', globalSettingsSchema);
