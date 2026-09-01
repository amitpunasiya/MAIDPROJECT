import { Schema, model, type Document, type Types } from 'mongoose';

export interface ISetting {
  key: string;
  value: any;
  description?: string;
  updatedBy?: Types.ObjectId;
}

export interface ISettingDocument extends ISetting, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISettingDocument>(
  {
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
      default: '',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export const Setting = model<ISettingDocument>('Setting', settingSchema);

export async function getSettingValue<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const doc = await Setting.findOne({ key });
    if (doc && doc.value !== undefined) {
      return doc.value as T;
    }
  } catch {
    // Return default on error
  }
  return defaultValue;
}
