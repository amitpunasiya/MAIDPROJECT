import { cookRepository, type PaginatedCooksResult } from '../../repositories/cook.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  CookSearchQueryInput,
  UpdateCookProfileInput,
} from '../../validators/cook.validator.js';
import type { ICookDocument } from '../../models/cook.model.js';
import { VerificationStatus } from '../../types/domain.enums.js';

export class CookService {
  async searchCooks(queryParams: CookSearchQueryInput): Promise<PaginatedCooksResult> {
    return cookRepository.searchCooks(queryParams);
  }

  async getCookById(cookId: string): Promise<ICookDocument> {
    const cook = await cookRepository.findCookById(cookId);
    if (!cook) {
      throw ApiError.notFound('Cook profile not found');
    }
    return cook;
  }

  async getCookByUserId(userId: string): Promise<ICookDocument> {
    const cook = await cookRepository.findByUserId(userId);
    if (!cook) {
      throw ApiError.notFound('Cook profile not found');
    }
    return cook;
  }

  async updateCookProfile(
    userId: string,
    input: UpdateCookProfileInput,
  ): Promise<ICookDocument> {
    let cook = await cookRepository.findByUserId(userId);

    if (!cook) {
      // Create initial cook profile if not already present
      cook = await cookRepository.create({
        userId: userId as unknown as ICookDocument['userId'],
        experienceYears: input.experienceYears ?? 0,
        serviceTypes: input.serviceTypes ?? [],
        skills: input.skills ?? [],
        languages: input.languages ?? [],
        bio: input.bio,
        hourlyRate: input.hourlyRate ?? 0,
        currency: input.currency ?? 'INR',
        verificationStatus: VerificationStatus.PENDING,
        isAvailable: false,
      } as unknown as Partial<ICookDocument>);
    } else {
      const updated = await cookRepository.updateByUserId(userId, input as Partial<ICookDocument>);
      if (!updated) {
        throw ApiError.internal('Failed to update cook profile');
      }
      cook = updated;
    }

    return cook;
  }

  async toggleAvailability(
    userId: string,
    explicitAvailable?: boolean,
  ): Promise<ICookDocument> {
    const cook = await cookRepository.findByUserId(userId);
    if (!cook) {
      throw ApiError.notFound('Cook profile not found. Please complete your cook profile first.');
    }

    const newStatus = explicitAvailable !== undefined ? explicitAvailable : !cook.isAvailable;

    const updated = await cookRepository.updateByUserId(userId, {
      isAvailable: newStatus,
    } as Partial<ICookDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to update availability status');
    }

    return updated;
  }
}

export const cookService = new CookService();
