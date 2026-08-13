import type { IBranchDocument } from '../../../models/branch.model.js';
import type { ISubscriptionPlanDocument } from '../../../models/subscriptionPlan.model.js';

export interface CreateBranchDTO {
  providerId: string;
  name: string;
  city: string;
  address: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  serviceRadiusKm?: number;
  timing?: string;
}

export interface CreatePlanDTO {
  name: string;
  code: string;
  price: number;
  maxBookingsPerMonth?: number;
  maxBranches?: number;
  commissionRate?: number;
  features?: string[];
}

export type { IBranchDocument, ISubscriptionPlanDocument };
