import { BaseRepository } from '../../../repositories/base.repository.js';
import { Testimonial, type ITestimonialDocument } from '../../../models/testimonial.model.js';
import type { CmsQueryInput } from '../validators/cms.validator.js';

export class TestimonialRepository extends BaseRepository<ITestimonialDocument> {
  constructor() {
    super(Testimonial);
  }

  async findApprovedTestimonials(limit = 10): Promise<ITestimonialDocument[]> {
    return this.model
      .find({ approvalStatus: 'approved', isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async findAllPaginated(queryInput: CmsQueryInput) {
    const page = Math.max(1, queryInput.page ?? 1);
    const limit = Math.min(100, Math.max(1, queryInput.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };

    if (queryInput.approvalStatus) {
      filter.approvalStatus = queryInput.approvalStatus;
    }

    if (queryInput.search) {
      filter.$or = [
        { customerName: new RegExp(queryInput.search, 'i') },
        { content: new RegExp(queryInput.search, 'i') },
        { city: new RegExp(queryInput.search, 'i') },
        { service: new RegExp(queryInput.search, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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

export const testimonialRepository = new TestimonialRepository();
