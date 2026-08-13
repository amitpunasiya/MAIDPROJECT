import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IAddress extends ISoftDelete, Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  fullName: string;
  mobile: string;
  houseNo: string;
  floor?: string;
  landmark?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType: 'Home' | 'Office' | 'Other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    houseNo: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      default: '',
    },
    landmark: {
      type: String,
      default: '',
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    pincode: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    addressType: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    ...softDeleteFields,
  },
  {
    timestamps: true,
  },
);

const Address = model<IAddress>('Address', addressSchema);
export default Address;
