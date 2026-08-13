import { Schema, model, type Document, type Types } from 'mongoose';

export interface ISubscriptionPlan {
  name: string;
  code: string;
  price: number;
  maxBookingsPerMonth: number;
  maxBranches: number;
  commissionRate: number;
  features: string[];
  isActive: boolean;
}

export interface ISubscriptionPlanDocument extends ISubscriptionPlan, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    maxBookingsPerMonth: { type: Number, default: 50 },
    maxBranches: { type: Number, default: 1 },
    commissionRate: { type: Number, default: 10 }, // 10% platform commission
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const SubscriptionPlan = model<ISubscriptionPlanDocument>('SubscriptionPlan', subscriptionPlanSchema);
