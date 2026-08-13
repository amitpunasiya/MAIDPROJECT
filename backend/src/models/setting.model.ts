import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ISetting {
  category: 'global' | 'city' | 'provider' | 'booking' | 'pricing' | 'notification';
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
}

export interface ISettingDocument extends ISetting, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISettingDocument>(
  {
    category: {
      type: String,
      enum: ['global', 'city', 'provider', 'booking', 'pricing', 'notification'],
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

settingSchema.index({ category: 1, key: 1 });

export const Setting = model<ISettingDocument>('Setting', settingSchema);
