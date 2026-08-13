import { Branch, type IBranchDocument } from '../../../models/branch.model.js';
import { SubscriptionPlan, type ISubscriptionPlanDocument } from '../../../models/subscriptionPlan.model.js';
import { Types } from 'mongoose';

export class SaaSRepository {
  // Branch methods
  async createBranch(data: Partial<IBranchDocument>): Promise<IBranchDocument> {
    return Branch.create(data);
  }

  async findBranchesByProvider(providerId: string): Promise<IBranchDocument[]> {
    return Branch.find({ providerId: new Types.ObjectId(providerId), isActive: true });
  }

  async findBranchesByCity(city: string): Promise<IBranchDocument[]> {
    return Branch.find({ city: new RegExp(`^${city}$`, 'i'), isActive: true });
  }

  // Subscription Plan methods
  async createPlan(data: Partial<ISubscriptionPlanDocument>): Promise<ISubscriptionPlanDocument> {
    return SubscriptionPlan.create(data);
  }

  async findAllActivePlans(): Promise<ISubscriptionPlanDocument[]> {
    return SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
  }
}

export const saasRepository = new SaaSRepository();
