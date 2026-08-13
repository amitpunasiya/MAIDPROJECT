import { Schema, model } from 'mongoose';
import type { ICountry } from '../modules/location/interfaces/country.interface.js';
import { softDeleteFields } from './common/softDelete.js';

const countrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isoCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    phoneCode: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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

export const Country = model<ICountry>('Country', countrySchema);
export default Country;
