import { BaseRepository } from './base.repository.js';
import { Maid, type IMaidDocument } from '../models/maid.model.js';
import type { FilterQuery, Types } from 'mongoose';
import type { MaidSearchQueryInput } from '../validators/maid.validator.js';
import { mergeNotDeleted } from '../models/common/softDelete.js';
import { VerificationStatus } from '../types/domain.enums.js';

export interface PaginatedMaidsResult {
  maids: IMaidDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MaidRepository extends BaseRepository<IMaidDocument> {
  constructor() {
    super(Maid);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IMaidDocument | null> {
    return this.model
      .findOne(mergeNotDeleted({ userId }))
      .populate('userId', 'name email phone avatar address isActive')
      .exec();
  }

  async updateByUserId(
    userId: string | Types.ObjectId,
    update: Partial<IMaidDocument>,
  ): Promise<IMaidDocument | null> {
    return this.model
      .findOneAndUpdate(
        mergeNotDeleted({ userId }),
        { $set: update },
        { new: true, runValidators: true },
      )
      .populate('userId', 'name email phone avatar address isActive');
  }

  async findMaidById(id: string | Types.ObjectId): Promise<IMaidDocument | null> {
    return this.model
      .findOne(mergeNotDeleted({ _id: id }))
      .populate('userId', 'name email phone avatar address isActive')
      .exec();
  }

  async searchMaids(queryParams: MaidSearchQueryInput): Promise<PaginatedMaidsResult> {
    const {
      search,
      city,
      service,
      minExperience,
      maxExperience,
      minPrice,
      maxPrice,
      isAvailable,
      minRating,
      page,
      limit,
      sort,
      order,
    } = queryParams;

    const filter: FilterQuery<IMaidDocument> = mergeNotDeleted({
      verificationStatus: VerificationStatus.VERIFIED,
    });

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable;
    }

    if (service) {
      filter.services = service;
    }

    if (minRating !== undefined) {
      filter.averageRating = { $gte: minRating };
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      filter.experienceYears = {};
      if (minExperience !== undefined) filter.experienceYears.$gte = minExperience;
      if (maxExperience !== undefined) filter.experienceYears.$lte = maxExperience;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.hourlyRate = {};
      if (minPrice !== undefined) filter.hourlyRate.$gte = minPrice;
      if (maxPrice !== undefined) filter.hourlyRate.$lte = maxPrice;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { bio: searchRegex },
        { services: searchRegex },
        { skills: searchRegex },
        { languages: searchRegex },
      ];
    }

    const sortOption: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const query = this.model
      .find(filter)
      .populate({
        path: 'userId',
        select: 'name email phone avatar address isActive',
        match: city ? { 'address.city': new RegExp(city, 'i'), isActive: true } : { isActive: true },
      })
      .sort(sortOption);

    const allMatching = await query.exec();

    // Filter out entries where populated userId is null (city filter mismatch or inactive user)
    const validMaids = allMatching.filter((doc) => doc.userId !== null && doc.userId !== undefined);
    const total = validMaids.length;
    const paginatedMaids = validMaids.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      maids: paginatedMaids,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export const maidRepository = new MaidRepository();
