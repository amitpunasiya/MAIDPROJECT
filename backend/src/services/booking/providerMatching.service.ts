import { Cook } from '../../models/cook.model.js';
import { mapsService } from '../maps/maps.service.js';
import { VerificationStatus } from '../../types/domain.enums.js';

export interface ProviderMatchingInput {
  city: string;
  latitude?: number;
  longitude?: number;
  serviceType?: string;
  branchId?: string;
  isEmergency?: boolean;
  minRating?: number;
  minExperienceYears?: number;
}

export interface RankedProvider {
  cookId: string;
  userId: string;
  providerName: string;
  avatar?: string;
  experienceYears: number;
  averageRating: number;
  totalRatings: number;
  completedBookings: number;
  hourlyRate: number;
  distanceKm: number;
  matchScore: number;
  isAvailable: boolean;
}

export class ProviderMatchingService {
  async findBestMatchingProviders(input: ProviderMatchingInput): Promise<RankedProvider[]> {
    const query: any = {
      isDeleted: false,
      verificationStatus: VerificationStatus.VERIFIED,
      isAvailable: true,
    };

    const candidates = await Cook.find(query).populate('userId');
    const userLat = input.latitude ?? 12.9716;
    const userLng = input.longitude ?? 77.5946;

    const rankedList: RankedProvider[] = [];

    for (const cook of candidates) {
      const user = (cook as any).userId;
      if (!user || !user.isActive) continue;

      // Distance calculation
      const cookLat = user.address?.coordinates?.lat ?? 12.9716;
      const cookLng = user.address?.coordinates?.lng ?? 77.5946;
      const dist = mapsService.getDistanceMatrix({ lat: userLat, lng: userLng }, { lat: cookLat, lng: cookLng });
      const distanceKm = (await dist).distanceKm;

      // Scoring factors
      let score = 100;
      // Proximity bonus (closer = higher score)
      score += Math.max(0, 50 - distanceKm * 2);
      // Rating bonus
      score += (cook.averageRating || 4.0) * 10;
      // Experience bonus
      score += Math.min(20, cook.experienceYears * 2);
      // Completed jobs bonus
      score += Math.min(15, cook.completedBookings * 0.5);
      // Featured / Premium Provider bonus
      if (cook.isFeatured) score += 15;

      rankedList.push({
        cookId: cook._id.toString(),
        userId: user._id.toString(),
        providerName: user.name || 'Professional Provider',
        avatar: user.avatar,
        experienceYears: cook.experienceYears,
        averageRating: cook.averageRating || 4.5,
        totalRatings: cook.totalRatings || 0,
        completedBookings: cook.completedBookings || 0,
        hourlyRate: cook.hourlyRate,
        distanceKm,
        matchScore: Math.round(score),
        isAvailable: cook.isAvailable,
      });
    }

    // Sort descending by matchScore
    return rankedList.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const providerMatchingService = new ProviderMatchingService();
