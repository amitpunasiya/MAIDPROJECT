import type { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../repositories/base.repository.js';
import { Provider } from '../../../models/provider.model.js';
import type {
  IProviderDocument,
  IProviderQueryFilter,
  INearbyFilter,
} from '../interfaces/provider.interface.js';

export class ProviderRepository extends BaseRepository<IProviderDocument> {
  constructor() {
    super(Provider);
  }

  async findByUserId(userId: string): Promise<IProviderDocument | null> {
    return this.findOne({ userId, isDeleted: { $ne: true } });
  }

  async findWithFilters(filter: IProviderQueryFilter): Promise<{
    items: IProviderDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const query: FilterQuery<IProviderDocument> = { isDeleted: { $ne: true } };

    if (filter.city) {
      query['location.city'] = new RegExp(`^${filter.city.trim()}$`, 'i');
    }

    if (filter.state) {
      query['location.state'] = new RegExp(`^${filter.state.trim()}$`, 'i');
    }

    if (filter.providerType) {
      query.providerType = filter.providerType;
    }

    if (filter.gender && filter.gender !== 'unspecified') {
      query.gender = filter.gender;
    }

    if (filter.minExperience !== undefined) {
      query.experienceYears = { $gte: filter.minExperience };
    }

    if (filter.minRating !== undefined) {
      query.averageRating = { $gte: filter.minRating };
    }

    if (filter.verificationStatus) {
      query.verificationStatus = filter.verificationStatus;
    }

    if (filter.kycStatus) {
      query.kycStatus = filter.kycStatus;
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query['pricing.hourlyPrice'] = {};
      if (filter.minPrice !== undefined) query['pricing.hourlyPrice'].$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query['pricing.hourlyPrice'].$lte = filter.maxPrice;
    }

    if (filter.isAvailable !== undefined) {
      query.isAvailable = filter.isAvailable;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const sortField = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const [items, total] = await Promise.all([
      this.model.find(query).populate('userId', 'name email phone avatar').sort(sortObj).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findNearby(filter: INearbyFilter): Promise<IProviderDocument[]> {
    const radiusKm = filter.radiusKm ?? 10;
    const limit = filter.limit ?? 20;

    const query: FilterQuery<IProviderDocument> = {
      isDeleted: { $ne: true },
      geoPoint: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filter.longitude, filter.latitude],
          },
          $maxDistance: radiusKm * 1000, // convert km to meters
        },
      },
    };

    if (filter.providerType) {
      query.providerType = filter.providerType;
    }

    if (filter.isAvailable !== undefined) {
      query.isAvailable = filter.isAvailable;
    }

    return this.model
      .find(query)
      .populate('userId', 'name email phone avatar')
      .limit(limit);
  }

  async findTopRated(limit = 10): Promise<IProviderDocument[]> {
    return this.model
      .find({ isDeleted: { $ne: true }, isAvailable: true })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit)
      .populate('userId', 'name email phone avatar');
  }

  async getStatistics(): Promise<{
    totalProviders: number;
    verifiedProviders: number;
    pendingVerification: number;
    rejectedProviders: number;
    suspendedProviders: number;
    cooksCount: number;
    maidsCount: number;
  }> {
    const [total, verified, pending, rejected, suspended, cooks, maids] = await Promise.all([
      this.model.countDocuments({ isDeleted: { $ne: true } }),
      this.model.countDocuments({ isDeleted: { $ne: true }, verificationStatus: 'verified' }),
      this.model.countDocuments({ isDeleted: { $ne: true }, verificationStatus: 'pending' }),
      this.model.countDocuments({ isDeleted: { $ne: true }, verificationStatus: 'rejected' }),
      this.model.countDocuments({ isDeleted: { $ne: true }, kycStatus: 'suspended' }),
      this.model.countDocuments({ isDeleted: { $ne: true }, providerType: 'cook' }),
      this.model.countDocuments({ isDeleted: { $ne: true }, providerType: 'maid' }),
    ]);

    return {
      totalProviders: total,
      verifiedProviders: verified,
      pendingVerification: pending,
      rejectedProviders: rejected,
      suspendedProviders: suspended,
      cooksCount: cooks,
      maidsCount: maids,
    };
  }

  async toggleAvailability(id: string, isAvailable: boolean): Promise<IProviderDocument | null> {
    return this.updateById(id, { isAvailable });
  }

  async addGalleryItem(id: string, item: { url: string; caption?: string }): Promise<IProviderDocument | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        $push: {
          gallery: {
            url: item.url,
            caption: item.caption ?? '',
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );
  }

  async removeGalleryItem(id: string, galleryItemId: string): Promise<IProviderDocument | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        $pull: {
          gallery: { _id: galleryItemId },
        },
      },
      { new: true },
    );
  }
}

export const providerRepository = new ProviderRepository();
