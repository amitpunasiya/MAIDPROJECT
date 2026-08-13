import { Schema, model, type Document, type Types } from 'mongoose';
import {
  Currency,
  TransactionReferenceType,
  TransactionType,
} from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface ITransaction {
  transactionNumber: string;
  walletId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: Currency;
  referenceType: TransactionReferenceType;
  referenceId?: Types.ObjectId;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ITransactionDocument extends ITransaction, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    transactionNumber: {
      type: String,
      required: [true, 'Transaction number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Wallet is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    currency: { type: String, enum: Object.values(Currency), default: Currency.INR },
    referenceType: {
      type: String,
      enum: Object.values(TransactionReferenceType),
      required: [true, 'Reference type is required'],
      index: true,
    },
    referenceId: { type: Schema.Types.ObjectId, index: true },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
    ...softDeleteFields,
  },
  { timestamps: true },
);

transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ referenceType: 1, referenceId: 1 });

export const Transaction = model<ITransactionDocument>('Transaction', transactionSchema);
