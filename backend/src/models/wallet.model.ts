import { Schema, model, type Document, type Types } from 'mongoose';
import { Currency, WalletOwnerType } from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IWallet {
  ownerId: Types.ObjectId;
  ownerType: WalletOwnerType;
  balance: number;
  currency: Currency;
  isActive: boolean;
  lastTransactionAt?: Date;
}

export interface IWalletDocument extends IWallet, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWalletDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Owner reference is required'],
      index: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(WalletOwnerType),
      required: [true, 'Owner type is required'],
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: Object.values(Currency), default: Currency.INR },
    isActive: { type: Boolean, default: true, index: true },
    lastTransactionAt: { type: Date },
    ...softDeleteFields,
  },
  { timestamps: true },
);

walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
walletSchema.index({ isActive: 1, isDeleted: 1 });

export const Wallet = model<IWalletDocument>('Wallet', walletSchema);
