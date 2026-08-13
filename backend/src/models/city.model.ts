import { Schema, model } from 'mongoose';
import type { ICity } from '../modules/location/interfaces/city.interface.js';
import { softDeleteFields } from './common/softDelete.js';

const citySchema = new Schema<ICity>(
  {
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ...softDeleteFields,
  },
  {
    timestamps: true,
  },
);

// Enforce unique city name within the same state
citySchema.index({ stateId: 1, name: 1, isDeleted: 1 }, { unique: true });

// Optimized indexes for search and query performance
citySchema.index({ countryId: 1, isActive: 1 });
citySchema.index({ stateId: 1, isActive: 1 });
citySchema.index({ name: 1, isActive: 1 });
citySchema.index({ name: 'text', slug: 'text' });

export const City = model<ICity>('City', citySchema);
export default City;
