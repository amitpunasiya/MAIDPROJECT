import { Schema, model, type Document, type Types } from 'mongoose';
import { Currency, WithdrawalStatus } from '../types/domain.enums.js';
import { softDeleteFields, type ISoftDelete } from './common/softDelete.js';

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface IWithdrawal {
  withdrawalNumber: string;
  cookId: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  currency: Currency;
  status: WithdrawalStatus;
  bankDetails: IBankDetails;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  rejectionReason?: string;
  transactionId?: Types.ObjectId;
  notes?: string;
}

export interface IWithdrawalDocument extends IWithdrawal, ISoftDelete, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    accountHolderName: { type: String, required: true, trim: true, maxlength: 100 },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'],
    },
    bankName: { type: String, required: true, trim: true, maxlength: 100 },
    upiId: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const withdrawalSchema = new Schema<IWithdrawalDocument>(
  {
    withdrawalNumber: {
      type: String,
      required: [true, 'Withdrawal number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    cookId: {
      type: Schema.Types.ObjectId,
      ref: 'Cook',
      required: [true, 'Cook is required'],
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Wallet is required'],
      index: true,
    },
    amount: { type: Number, required: [true, 'Amount is required'], min: 1 },
    currency: { type: String, enum: Object.values(Currency), default: Currency.INR },
    status: {
      type: String,
      enum: Object.values(WithdrawalStatus),
      default: WithdrawalStatus.PENDING,
      index: true,
    },
    bankDetails: { type: bankDetailsSchema, required: true },
    requestedAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    notes: { type: String, trim: true, maxlength: 500 },
    ...softDeleteFields,
  },
  { timestamps: true },
);

withdrawalSchema.index({ cookId: 1, status: 1, requestedAt: -1 });
withdrawalSchema.index({ status: 1, requestedAt: 1 });

export const Withdrawal = model<IWithdrawalDocument>('Withdrawal', withdrawalSchema);
