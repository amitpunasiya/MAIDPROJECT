import type { Document, Types } from 'mongoose';
import type { ISoftDelete } from '../../../models/common/softDelete.js';

export interface IProviderServiceItem {
  _id?: Types.ObjectId | string;
  serviceName: string;
  price: number;
  duration?: string;
  category?: string;
  description?: string;
}

export interface IDaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface IGalleryItem {
  _id?: Types.ObjectId;
  url: string;
  caption?: string;
  createdAt?: Date;
}

export interface IBankDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface IProviderDocs {
  countryCode?: string;
  documentType?: 'aadhaar' | 'ssn_id' | 'passport' | 'drivers_license' | 'national_id';
  documentNumberHash?: string;
  maskedIdentityNumber?: string;
  documentFrontDoc?: string;
  documentBackDoc?: string;
  aadhaarNumber?: string;
  aadhaarDoc?: string;
  panNumber?: string;
  panDoc?: string;
  profilePhotoDoc?: string;
  selfiePhotoDoc?: string;
  certificates?: string[];
  experienceDocs?: string[];
  policeVerificationDoc?: string;
}

export interface IProviderPricing {
  hourlyPrice: number;
  dailyPrice?: number;
  visitCharge?: number;
  emergencyCharge?: number;
  currency?: string;
}

export interface IProviderLocation {
  country: string;
  state: string;
  city: string;
  currentAddress: string;
  workingAreas?: string[];
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
}

export interface IProvider {
  userId: Types.ObjectId;
  providerType: 'cook' | 'maid' | 'babysitter' | 'eldercare' | 'cleaning' | 'physiotherapist' | 'occupational_therapist' | 'other' | string;
  fullName: string;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  dob?: Date;
  profilePhoto?: string;
  qualification?: string;
  specializations?: string[];
  homeVisitAvailability?: boolean;
  consultationFee?: number;
  experienceYears: number;
  languages: string[];
  skills: string[];
  bio?: string;
  aadhaarVerificationStatus: 'pending' | 'verified' | 'rejected' | string;
  policeVerificationStatus: 'pending' | 'verified' | 'rejected' | string;
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PERMANENTLY_BLOCKED' | 'pending' | 'verified' | 'rejected' | string;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUESTED' | string;
  kycRejectionReason?: string;
  blockedAt?: Date;
  blockedBy?: Types.ObjectId;
  blockReason?: string;
  bankDetails?: IBankDetails;
  isAvailable: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  cancelledJobs?: number;
  lastSeen?: Date;
  location: IProviderLocation;
  geoPoint?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  services: IProviderServiceItem[];
  serviceTypes?: string[];
  schedule: IDaySchedule[];
  holidaySupport: boolean;
  pricing: IProviderPricing;
  documents: IProviderDocs;
  gallery: IGalleryItem[];
}

export interface IProviderDocument extends IProvider, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProviderQueryFilter {
  city?: string;
  state?: string;
  providerType?: string;
  gender?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  kycStatus?: 'unverified' | 'pending' | 'approved' | 'rejected' | 'suspended';
  minExperience?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface INearbyFilter {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  providerType?: string;
  isAvailable?: boolean;
  limit?: number;
}
