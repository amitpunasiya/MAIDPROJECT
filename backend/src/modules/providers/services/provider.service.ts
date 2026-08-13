import { providerRepository } from '../repositories/provider.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import type {
  CreateProviderInput,
  UpdateProviderInput,
  ProviderQueryInput,
  ProviderNearbyQueryInput,
  AddGalleryItemInput,
} from '../validators/provider.validator.js';
import type { IProviderDocument } from '../interfaces/provider.interface.js';
import type { Types } from 'mongoose';

export class ProviderService {
  async createProvider(
    input: CreateProviderInput,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const targetUserId = (isAdmin && input.userId ? input.userId : requestingUserId) as string;

    const existing = await providerRepository.findByUserId(targetUserId);
    if (existing) {
      throw ApiError.conflict('Provider profile already exists for this user');
    }

    const lng = input.location?.longitude ?? 77.5946;
    const lat = input.location?.latitude ?? 12.9716;

    const providerData: Partial<IProviderDocument> = {
      ...input,
      dob: input.dob ? new Date(input.dob) : undefined,
      userId: targetUserId as unknown as Types.ObjectId,
      geoPoint: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    };

    const created = await providerRepository.create(providerData);

    logger.info('Provider created successfully', {
      providerId: created._id.toString(),
      userId: targetUserId,
      providerType: created.providerType,
      createdBy: requestingUserId,
    });

    return created;
  }

  async getProviderById(idOrUserId: string): Promise<IProviderDocument> {
    let provider = await providerRepository.findById(idOrUserId);
    if (!provider) {
      provider = await providerRepository.findByUserId(idOrUserId);
    }
    if (!provider) {
      throw ApiError.notFound('Provider profile not found');
    }
    return provider;
  }

  async updateProvider(
    idOrUserId: string,
    input: UpdateProviderInput,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to edit this provider profile');
    }

    const updatePayload: Partial<IProviderDocument> = { ...(input as any) };
    if (input.dob) {
      updatePayload.dob = new Date(input.dob);
    }

    if (input.location?.longitude !== undefined || input.location?.latitude !== undefined) {
      const lng = input.location.longitude ?? provider.location?.longitude ?? 77.5946;
      const lat = input.location.latitude ?? provider.location?.latitude ?? 12.9716;
      updatePayload.geoPoint = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    const updated = await providerRepository.updateById(provider._id.toString(), updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to update provider profile');
    }

    logger.info('Provider updated successfully', {
      providerId: provider._id.toString(),
      updatedBy: requestingUserId,
    });

    return updated;
  }

  async deleteProvider(
    idOrUserId: string,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<void> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to delete this provider profile');
    }

    await providerRepository.softDeleteById(provider._id.toString());

    logger.info('Provider deleted successfully', {
      providerId: provider._id.toString(),
      deletedBy: requestingUserId,
    });
  }

  async getProviders(filter: ProviderQueryInput) {
    return providerRepository.findWithFilters(filter);
  }

  async getAvailableProviders(filter: ProviderQueryInput) {
    return providerRepository.findWithFilters({ ...filter, isAvailable: true });
  }

  async getTopRatedProviders(limit = 10) {
    return providerRepository.findTopRated(limit);
  }

  async getStatistics() {
    return providerRepository.getStatistics();
  }

  async searchNearby(filter: ProviderNearbyQueryInput) {
    return providerRepository.findNearby(filter);
  }

  async verifyProvider(idOrUserId: string, requestingUserId: string): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);
    const updated = await providerRepository.updateById(provider._id.toString(), {
      verificationStatus: 'verified',
      kycStatus: 'approved',
      aadhaarVerificationStatus: 'verified',
      policeVerificationStatus: 'verified',
    });
    if (!updated) {
      throw ApiError.internal('Failed to verify provider');
    }

    logger.info('Provider verification status updated to VERIFIED', {
      providerId: provider._id.toString(),
      verifiedBy: requestingUserId,
    });

    return updated;
  }

  async suspendProvider(idOrUserId: string, requestingUserId: string): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);
    const updated = await providerRepository.updateById(provider._id.toString(), {
      kycStatus: 'suspended',
      isAvailable: false,
    });
    if (!updated) {
      throw ApiError.internal('Failed to suspend provider');
    }

    logger.info('Provider suspended', {
      providerId: provider._id.toString(),
      suspendedBy: requestingUserId,
    });

    return updated;
  }

  async activateProvider(idOrUserId: string, requestingUserId: string): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);
    const updated = await providerRepository.updateById(provider._id.toString(), {
      kycStatus: 'approved',
      isAvailable: true,
    });
    if (!updated) {
      throw ApiError.internal('Failed to activate provider');
    }

    logger.info('Provider activated', {
      providerId: provider._id.toString(),
      activatedBy: requestingUserId,
    });

    return updated;
  }

  async rejectProvider(idOrUserId: string, requestingUserId: string): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);
    const updated = await providerRepository.updateById(provider._id.toString(), {
      verificationStatus: 'rejected',
      kycStatus: 'rejected',
    });
    if (!updated) {
      throw ApiError.internal('Failed to reject provider');
    }

    logger.info('Provider rejected', {
      providerId: provider._id.toString(),
      rejectedBy: requestingUserId,
    });

    return updated;
  }

  async toggleAvailability(
    idOrUserId: string,
    isAvailable: boolean,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to modify availability for this profile');
    }

    const updated = await providerRepository.toggleAvailability(provider._id.toString(), isAvailable);
    if (!updated) {
      throw ApiError.internal('Failed to toggle availability');
    }

    logger.info('Provider availability toggled', {
      providerId: provider._id.toString(),
      isAvailable,
      updatedBy: requestingUserId,
    });

    return updated;
  }

  async addGalleryItem(
    idOrUserId: string,
    item: AddGalleryItemInput,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to upload gallery images for this profile');
    }

    const updated = await providerRepository.addGalleryItem(provider._id.toString(), item);
    if (!updated) {
      throw ApiError.internal('Failed to add gallery item');
    }
    return updated;
  }

  async updateSkills(
    idOrUserId: string,
    skills: string[],
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to update skills for this profile');
    }

    const updated = await providerRepository.updateById(provider._id.toString(), { skills });
    if (!updated) {
      throw ApiError.internal('Failed to update worker skills');
    }
    return updated;
  }

  async matchProviders(query: {
    taskName?: string;
    serviceType?: string;
    date?: string;
    startTime?: string;
    durationHours?: number;
    latitude?: number;
    longitude?: number;
    city?: string;
    sortBy?: 'recommended' | 'nearest' | 'highest_rated' | 'lowest_price';
    limit?: number;
  }) {
    const allActive = await providerRepository.findWithFilters({
      isAvailable: true,
      city: query.city,
      limit: 100,
    });

    const items = allActive.items || [];
    const taskNameLower = (query.taskName || query.serviceType || '').toLowerCase();
    const isSensitiveCare = taskNameLower.includes('childcare') || taskNameLower.includes('elder');

    // Filter & Score
    const scoredList = items.map((p) => {
      const pSkills = (p.skills || []).map((s) => s.toLowerCase());
      const pType = (p.providerType || '').toLowerCase();

      // 1. Skill & Type match check
      let skillMatch = false;
      if (!taskNameLower || pSkills.includes(taskNameLower)) {
        skillMatch = true;
      } else if (taskNameLower.includes('cook') && pType === 'cook') {
        skillMatch = true;
      } else if (
        (taskNameLower.includes('clean') || taskNameLower.includes('dish') || taskNameLower.includes('sweep') || taskNameLower.includes('mop') || taskNameLower.includes('laundry')) &&
        (pType === 'maid' || pType === 'cleaning')
      ) {
        skillMatch = true;
      } else if (pSkills.some((sk) => taskNameLower.includes(sk) || sk.includes(taskNameLower))) {
        skillMatch = true;
      }

      // 2. Sensitive Care Verification check
      let verificationEligible = true;
      if (isSensitiveCare) {
        if (p.policeVerificationStatus !== 'verified' && p.verificationStatus !== 'verified') {
          verificationEligible = false;
        }
      }

      // 3. Distance calculation (Haversine formula)
      let distanceKm = 3.5; // default fallback distance
      if (query.latitude !== undefined && query.longitude !== undefined && p.location?.latitude && p.location?.longitude) {
        const radlat1 = (Math.PI * query.latitude) / 180;
        const radlat2 = (Math.PI * p.location.latitude) / 180;
        const theta = query.longitude - p.location.longitude;
        const radtheta = (Math.PI * theta) / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(Math.min(1, Math.max(-1, dist)));
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344;
        distanceKm = Math.round(dist * 10) / 10;
      }

      // Match Score calculation
      let score = 0;
      if (skillMatch) score += 100;
      if (verificationEligible) score += 20;
      if (p.verificationStatus === 'verified') score += 20;
      score += (p.averageRating || 4.5) * 10; // max 50
      score += Math.min(30, (p.completedBookings || 0) * 0.5); // max 30
      score += Math.max(0, 50 - distanceKm * 3); // max 50

      return {
        provider: p,
        eligible: skillMatch && verificationEligible && p.kycStatus !== 'suspended',
        distanceKm,
        score,
      };
    });

    const eligibleOnly = scoredList.filter((item) => item.eligible);

    // Sort
    const sortBy = query.sortBy || 'recommended';
    eligibleOnly.sort((a, b) => {
      if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
      if (sortBy === 'highest_rated') return (b.provider.averageRating || 0) - (a.provider.averageRating || 0);
      if (sortBy === 'lowest_price') return (a.provider.pricing?.hourlyPrice || 200) - (b.provider.pricing?.hourlyPrice || 200);
      return b.score - a.score; // recommended
    });

    const limit = query.limit || 20;
    const finalItems = eligibleOnly.slice(0, limit).map((item) => ({
      id: item.provider._id.toString(),
      _id: item.provider._id.toString(),
      name: item.provider.fullName,
      fullName: item.provider.fullName,
      profilePhoto: item.provider.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      rating: item.provider.averageRating || 4.8,
      averageRating: item.provider.averageRating || 4.8,
      completedJobs: item.provider.completedBookings || 120,
      verificationStatus: item.provider.verificationStatus || 'verified',
      isVerified: item.provider.verificationStatus === 'verified',
      distanceKm: item.distanceKm,
      skills: item.provider.skills || ['Household Trained'],
      languages: item.provider.languages || ['English', 'Hindi'],
      hourlyRate: item.provider.pricing?.hourlyPrice || 250,
      price: `₹${item.provider.pricing?.hourlyPrice || 250}/hr`,
      isAvailable: item.provider.isAvailable,
      matchScore: item.score,
    }));

    return {
      items: finalItems,
      total: finalItems.length,
    };
  }

  async removeGalleryItem(
    idOrUserId: string,
    galleryItemId: string,
    requestingUserId: string,
    isAdmin = false,
  ): Promise<IProviderDocument> {
    const provider = await this.getProviderById(idOrUserId);

    if (!isAdmin && provider.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('You do not have permission to remove gallery images for this profile');
    }

    const updated = await providerRepository.removeGalleryItem(provider._id.toString(), galleryItemId);
    if (!updated) {
      throw ApiError.internal('Failed to remove gallery item');
    }
    return updated;
  }
}

export const providerService = new ProviderService();
