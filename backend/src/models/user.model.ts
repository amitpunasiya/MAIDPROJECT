import { Schema, model, type Document, type Types } from 'mongoose';
import { UserRole } from '../types/auth.types.js';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  roles?: UserRole[];
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  address?: IAddress;
  firebaseUid?: string;
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
}

export interface IUserDocument extends IUser, Document {
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

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    roles: {
      type: [String],
      default: [UserRole.CUSTOMER],
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    address: addressSchema,
    firebaseUid: {
      type: String,
      sparse: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: '',
    },
    lastLoginDevice: {
      type: String,
      default: '',
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const sanitized = ret as Record<string, unknown>;
        if (!sanitized.roles || !Array.isArray(sanitized.roles) || sanitized.roles.length === 0) {
          sanitized.roles = [sanitized.role || UserRole.CUSTOMER];
        }
        delete sanitized.password;
        delete sanitized.passwordResetTokenHash;
        delete sanitized.passwordResetExpires;
        delete sanitized.emailVerificationTokenHash;
        delete sanitized.emailVerificationExpires;
        delete sanitized.__v;
        return sanitized;
      },
    },
  },
);

userSchema.pre('save', function (next) {
  if (!this.roles || this.roles.length === 0) {
    this.roles = [this.role || UserRole.CUSTOMER];
  } else if (this.role && !this.roles.includes(this.role)) {
    this.roles.push(this.role);
  }
  next();
});

userSchema.index({ role: 1, isActive: 1 });

export const User = model<IUserDocument>('User', userSchema);
