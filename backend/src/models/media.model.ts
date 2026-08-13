import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum MediaContext {
  PROFILE_IMAGE = 'profile_image',
  PROVIDER_IMAGE = 'provider_image',
  SERVICE_IMAGE = 'service_image',
  BANNER_IMAGE = 'banner_image',
  CMS_IMAGE = 'cms_image',
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  DRIVING_LICENSE = 'driving_license',
  CERTIFICATE = 'certificate',
  POLICE_VERIFICATION = 'police_verification',
  OTHER = 'other',
}

export enum MediaType {
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export enum StorageProvider {
  CLOUDINARY = 'cloudinary',
  LOCAL = 'local',
}

export enum MediaVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMediaDocument extends Document, ISoftDelete {
  _id: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  context: MediaContext;
  mediaType: MediaType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: StorageProvider;
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  localPath?: string;
  width?: number;
  height?: number;
  format?: string;
  verificationStatus: MediaVerificationStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const mediaSchema = new Schema<IMediaDocument>(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'uploadedBy is required'],
      index: true,
    },
    context: {
      type: String,
      enum: Object.values(MediaContext),
      required: [true, 'context is required'],
      index: true,
    },
    mediaType: {
      type: String,
      enum: Object.values(MediaType),
      required: [true, 'mediaType is required'],
      index: true,
    },
    originalName: {
      type: String,
      trim: true,
      required: [true, 'originalName is required'],
    },
    mimeType: {
      type: String,
      trim: true,
      required: [true, 'mimeType is required'],
    },
    sizeBytes: {
      type: Number,
      required: [true, 'sizeBytes is required'],
      min: 0,
    },
    storageProvider: {
      type: String,
      enum: Object.values(StorageProvider),
      required: [true, 'storageProvider is required'],
      index: true,
    },
    url: {
      type: String,
      trim: true,
      required: [true, 'url is required'],
    },
    publicId: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    localPath: {
      type: String,
      trim: true,
      default: '',
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    format: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(MediaVerificationStatus),
      default: MediaVerificationStatus.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

// Compound indexes for common query patterns
mediaSchema.index({ uploadedBy: 1, context: 1, createdAt: -1 });
mediaSchema.index({ uploadedBy: 1, isDeleted: 1 });
mediaSchema.index({ context: 1, verificationStatus: 1 });

export const Media = model<IMediaDocument>('Media', mediaSchema);
