import { Schema, model } from 'mongoose';
import type { IState } from '../modules/location/interfaces/state.interface.js';
import { softDeleteFields } from './common/softDelete.js';

const stateSchema = new Schema<IState>(
  {
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
    code: {
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

stateSchema.index({ countryId: 1, code: 1, isDeleted: 1 }, { unique: true });
stateSchema.index({ countryId: 1, name: 1, isDeleted: 1 }, { unique: true });

export const State = model<IState>('State', stateSchema);
export default State;
