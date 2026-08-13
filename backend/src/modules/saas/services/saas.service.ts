import { saasRepository } from '../repositories/saas.repository.js';
import type { CreateBranchDTO, CreatePlanDTO } from '../interfaces/saas.interface.js';
import { Types } from 'mongoose';

export class SaaSService {
  async createBranch(input: CreateBranchDTO) {
    return saasRepository.createBranch({
      providerId: new Types.ObjectId(input.providerId),
      name: input.name,
      city: input.city,
      address: input.address,
      managerName: input.managerName ?? '',
      managerPhone: input.managerPhone ?? '',
      managerEmail: input.managerEmail ?? '',
      serviceRadiusKm: input.serviceRadiusKm ?? 10,
      timing: input.timing ?? '08:00 AM - 08:00 PM',
      isActive: true,
    });
  }

  async getProviderBranches(providerId: string) {
    return saasRepository.findBranchesByProvider(providerId);
  }

  async getCityBranches(city: string) {
    return saasRepository.findBranchesByCity(city);
  }

  async createPlan(input: CreatePlanDTO) {
    return saasRepository.createPlan({
      name: input.name,
      code: input.code.toUpperCase(),
      price: input.price,
      maxBookingsPerMonth: input.maxBookingsPerMonth ?? 50,
      maxBranches: input.maxBranches ?? 1,
      commissionRate: input.commissionRate ?? 10,
      features: input.features ?? [],
      isActive: true,
    });
  }

  async getPlans() {
    return saasRepository.findAllActivePlans();
  }
}

export const saasService = new SaaSService();
