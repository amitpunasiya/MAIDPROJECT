import { maidRepository, type PaginatedMaidsResult } from '../../repositories/maid.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  MaidSearchQueryInput,
  UpdateMaidProfileInput,
} from '../../validators/maid.validator.js';
import type { IMaidDocument } from '../../models/maid.model.js';
import { VerificationStatus } from '../../types/domain.enums.js';

export class MaidService {
  async searchMaids(queryParams: MaidSearchQueryInput): Promise<PaginatedMaidsResult> {
    return maidRepository.searchMaids(queryParams);
  }

  async getMaidById(maidId: string): Promise<IMaidDocument> {
    const maid = await maidRepository.findMaidById(maidId);
    if (!maid) {
      throw ApiError.notFound('Maid profile not found');
    }
    return maid;
  }

  async getMaidByUserId(userId: string): Promise<IMaidDocument> {
    const maid = await maidRepository.findByUserId(userId);
    if (!maid) {
      throw ApiError.notFound('Maid profile not found');
    }
    return maid;
  }

  async updateMaidProfile(
    userId: string,
    input: UpdateMaidProfileInput,
  ): Promise<IMaidDocument> {
    let maid = await maidRepository.findByUserId(userId);

    if (!maid) {
      // Create initial maid profile if not present
      maid = await maidRepository.create({
        userId: userId as unknown as IMaidDocument['userId'],
        experienceYears: input.experienceYears ?? 0,
        services: input.services ?? ['cleaning', 'dusting', 'utensil_washing'],
        skills: input.skills ?? [],
        languages: input.languages ?? [],
        bio: input.bio,
        hourlyRate: input.hourlyRate ?? 0,
        currency: input.currency ?? 'INR',
        verificationStatus: VerificationStatus.PENDING,
        isAvailable: false,
      } as unknown as Partial<IMaidDocument>);
    } else {
      const updated = await maidRepository.updateByUserId(userId, input as Partial<IMaidDocument>);
      if (!updated) {
        throw ApiError.internal('Failed to update maid profile');
      }
      maid = updated;
    }

    return maid;
  }

  async toggleAvailability(
    userId: string,
    explicitAvailable?: boolean,
  ): Promise<IMaidDocument> {
    const maid = await maidRepository.findByUserId(userId);
    if (!maid) {
      throw ApiError.notFound('Maid profile not found. Please complete your maid profile first.');
    }

    const newStatus = explicitAvailable !== undefined ? explicitAvailable : !maid.isAvailable;

    const updated = await maidRepository.updateByUserId(userId, {
      isAvailable: newStatus,
    } as Partial<IMaidDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to update availability status');
    }

    return updated;
  }
}

export const maidService = new MaidService();
