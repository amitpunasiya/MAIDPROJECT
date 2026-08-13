import { BaseRepository } from '../../../repositories/base.repository.js';
import { CmsPage, type ICmsPageDocument } from '../../../models/cmsPage.model.js';
import type { CmsQueryInput } from '../validators/cms.validator.js';

export class CmsPageRepository extends BaseRepository<ICmsPageDocument> {
  constructor() {
    super(CmsPage);
  }

  async findBySlug(slug: string): Promise<ICmsPageDocument | null> {
    return this.model.findOne({ slug: slug.toLowerCase(), isDeleted: { $ne: true } }).populate('lastUpdatedBy', 'name email');
  }

  async findAllPaginated(queryInput: CmsQueryInput) {
    const page = Math.max(1, queryInput.page ?? 1);
    const limit = Math.min(100, Math.max(1, queryInput.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };

    if (queryInput.status) {
      filter.status = queryInput.status;
    }

    if (queryInput.search) {
      filter.$or = [
        { title: new RegExp(queryInput.search, 'i') },
        { slug: new RegExp(queryInput.search, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate('lastUpdatedBy', 'name email'),
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

export const cmsPageRepository = new CmsPageRepository();
