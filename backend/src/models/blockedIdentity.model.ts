import { Schema, model, type Document, type Types } from 'mongoose';

export interface IBlockedIdentity {
  identityHash: string; // SHA-256 hash of normalized document number + country code
  countryCode: string;
  documentType: string;
  maskedIdentity?: string;
  originalProviderId?: Types.ObjectId;
  reason: string;
  blockedBy?: Types.ObjectId;
  blockedAt: Date;
}

export interface IBlockedIdentityDocument extends IBlockedIdentity, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blockedIdentitySchema = new Schema<IBlockedIdentityDocument>(
  {
    identityHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    documentType: {
      type: String,
      required: true,
      trim: true,
    },
    maskedIdentity: {
      type: String,
      trim: true,
      default: '',
    },
    originalProviderId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      default: 'Permanent Ban by Administrator',
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const BlockedIdentity = model<IBlockedIdentityDocument>('BlockedIdentity', blockedIdentitySchema);
