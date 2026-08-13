import { BaseRepository } from '../../../repositories/base.repository.js';
import { Banner, type IBannerDocument } from '../../../models/banner.model.js';
import type { CmsQueryInput } from '../validators/cms.validator.js';

export class BannerRepository extends BaseRepository<IBannerDocument> {
  constructor() {
    super(Banner);
  }

  async findActiveBanners(targetRole?: string): Promise<IBannerDocument[]> {
    const filter: any = { isActive: true, isDeleted: { $ne: true } };
    if (targetRole) {
      filter.targetRole = { $in: ['all', targetRole] };
    }
    return this.model.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  }

  async findAllPaginated(queryInput: CmsQueryInput) {
    const page = Math.max(1, queryInput.page ?? 1);
    const limit = Math.min(100, Math.max(1, queryInput.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };
    if (queryInput.search) {
      filter.title = new RegExp(queryInput.search, 'i');
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const bannerRepository = new BannerRepository();
