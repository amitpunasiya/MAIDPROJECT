import { ActivityLog, type IActivityLogDocument } from '../../../models/activityLog.model.js';
import type { FilterQuery } from 'mongoose';

export class ActivityLogRepository {
  async create(data: Partial<IActivityLogDocument>): Promise<IActivityLogDocument> {
    return ActivityLog.create(data);
  }

  async findWithFilters(filter: {
    userId?: string;
    module?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const query: FilterQuery<IActivityLogDocument> = {};

    if (filter.userId) {
      query.userId = filter.userId;
    }
    if (filter.module) {
      query.module = filter.module.toLowerCase();
    }
    if (filter.action) {
      query.action = filter.action.toUpperCase();
    }

    const [items, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('userId', 'name email phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
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

export const activityLogRepository = new ActivityLogRepository();
