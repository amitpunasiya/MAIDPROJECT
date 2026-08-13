import { Schema, model, type Document, type Types } from 'mongoose';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IFavorite {
  customerId: Types.ObjectId;
  providerId?: Types.ObjectId;
  serviceId?: Types.ObjectId;
  itemType: 'provider' | 'service';
}

export interface IFavoriteDocument extends IFavorite, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavoriteDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'ServiceCatalog', index: true },
    itemType: {
      type: String,
      enum: ['provider', 'service'],
      required: true,
    },
    ...softDeleteFields,
  },
  { timestamps: true },
);

favoriteSchema.index({ customerId: 1, providerId: 1 }, { unique: true, partialFilterExpression: { providerId: { $exists: true } } });
favoriteSchema.index({ customerId: 1, serviceId: 1 }, { unique: true, partialFilterExpression: { serviceId: { $exists: true } } });

export const Favorite = model<IFavoriteDocument>('Favorite', favoriteSchema);
