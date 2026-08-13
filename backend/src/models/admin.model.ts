import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export enum AdminPermission {
  MANAGE_USERS = 'manage_users',
  MANAGE_COOKS = 'manage_cooks',
  MANAGE_BOOKINGS = 'manage_bookings',
  MANAGE_PAYMENTS = 'manage_payments',
  MANAGE_WITHDRAWALS = 'manage_withdrawals',
  MANAGE_COUPONS = 'manage_coupons',
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_SUPPORT = 'manage_support',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_DOCUMENTS = 'manage_documents',
}

export interface IAdmin {
  userId: Types.ObjectId;
  department?: string;
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
  lastActiveAt?: Date;
  isActive: boolean;
}

export interface IAdminDocument extends IAdmin, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdminDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    department: { type: String, trim: true, maxlength: 100 },
    permissions: {
      type: [String],
      enum: Object.values(AdminPermission),
      default: [],
    },
    isSuperAdmin: { type: Boolean, default: false, index: true },
    lastActiveAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    ...softDeleteFields,
  },
  { timestamps: true },
);

adminSchema.index({ isActive: 1, isDeleted: 1 });

export const Admin = model<IAdminDocument>('Admin', adminSchema);
