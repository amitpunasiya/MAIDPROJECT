import type { FilterQuery, Types } from 'mongoose';
import { BaseRepository, type FindManyOptions } from '../../../repositories/base.repository.js';
import {
  Media,
  type IMediaDocument,
  MediaContext,
  MediaType,
  MediaVerificationStatus,
} from '../../../models/media.model.js';

export interface MediaListOptions extends FindManyOptions {
  context?: MediaContext;
  mediaType?: MediaType;
  verificationStatus?: MediaVerificationStatus;
}

export class MediaRepository extends BaseRepository<IMediaDocument> {
  constructor() {
    super(Media);
  }

  /**
   * Find by ID including soft-deleted records (needed for the replace flow).
   */
  async findByIdIncludeDeleted(id: string | Types.ObjectId): Promise<IMediaDocument | null> {
    return this.model.findById(id);
  }

  /**
   * Find all media uploaded by a specific user (soft-delete aware).
   */
  async findByUploadedBy(
    userId: string | Types.ObjectId,
    options: MediaListOptions = {},
  ): Promise<IMediaDocument[]> {
    const filter: FilterQuery<IMediaDocument> = { uploadedBy: userId };
    if (options.context) filter.context = options.context;
    if (options.mediaType) filter.mediaType = options.mediaType;
    if (options.verificationStatus) filter.verificationStatus = options.verificationStatus;

    return this.findMany(filter, {
      sort: options.sort ?? { createdAt: -1 },
      skip: options.skip,
      limit: options.limit,
    });
  }

  /**
   * Count media uploaded by a specific user (for pagination).
   */
  async countByUploadedBy(
    userId: string | Types.ObjectId,
    options: MediaListOptions = {},
  ): Promise<number> {
    const filter: FilterQuery<IMediaDocument> = { uploadedBy: userId };
    if (options.context) filter.context = options.context;
    if (options.mediaType) filter.mediaType = options.mediaType;
    if (options.verificationStatus) filter.verificationStatus = options.verificationStatus;

    return this.count(filter);
  }

  /**
   * Find all media by context (admin use-case).
   */
  async findByContext(
    context: MediaContext,
    options: FindManyOptions = {},
  ): Promise<IMediaDocument[]> {
    return this.findMany({ context }, { sort: { createdAt: -1 }, ...options });
  }

  /**
   * Admin: find all media with optional filters (paginated).
   */
  async findAllPaginated(
    page: number,
    limit: number,
    filters: Partial<{
      context: MediaContext;
      mediaType: MediaType;
      verificationStatus: MediaVerificationStatus;
      uploadedBy: string;
    }> = {},
  ): Promise<{
    items: IMediaDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<IMediaDocument> = {};

    if (filters.context) filter.context = filters.context;
    if (filters.mediaType) filter.mediaType = filters.mediaType;
    if (filters.verificationStatus) filter.verificationStatus = filters.verificationStatus;
    if (filters.uploadedBy) filter.uploadedBy = filters.uploadedBy;

    const [items, total] = await Promise.all([
      this.findMany(filter, { sort: { createdAt: -1 }, skip, limit }),
      this.count(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const mediaRepository = new MediaRepository();
