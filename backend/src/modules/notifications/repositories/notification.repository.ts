import type { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../repositories/base.repository.js';
import { Notification, type INotificationDocument } from '../../../models/notification.model.js';
import type { NotificationQueryDTO } from '../interfaces/notification.interface.js';

export class NotificationRepository extends BaseRepository<INotificationDocument> {
  constructor() {
    super(Notification);
  }

  async findUserNotifications(userId?: string, queryDto: NotificationQueryDTO = {}) {
    const page = Math.max(1, queryDto.page ?? 1);
    const limit = Math.min(100, Math.max(1, queryDto.limit ?? 20));
    const skip = (page - 1) * limit;

    const query: FilterQuery<INotificationDocument> = { isDeleted: { $ne: true } };

    if (userId) {
      query.userId = userId;
    }

    if (queryDto.isRead !== undefined) {
      query.isRead = queryDto.isRead;
    }

    if (queryDto.type) {
      query.type = queryDto.type;
    }

    if (queryDto.search) {
      query.$or = [
        { title: new RegExp(queryDto.search, 'i') },
        { message: new RegExp(queryDto.search, 'i') },
      ];
    }

    const sortField = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;

    const [items, total, unreadCount] = await Promise.all([
      this.model.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      this.model.countDocuments(query),
      this.model.countDocuments(userId ? { userId, isRead: false, isDeleted: { $ne: true } } : { isRead: false, isDeleted: { $ne: true } }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUnreadUserNotifications(userId: string, limit = 20) {
    const query = { userId, isRead: false, isDeleted: { $ne: true } };
    const [items, unreadCount] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).limit(limit),
      this.model.countDocuments(query),
    ]);

    return { items, unreadCount };
  }

  async markAsRead(id: string, userId?: string): Promise<INotificationDocument | null> {
    const filter: any = { _id: id, isDeleted: { $ne: true } };
    if (userId) filter.userId = userId;

    return this.model.findOneAndUpdate(filter, { isRead: true, readAt: new Date() }, { new: true });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.model.updateMany(
      { userId, isRead: false, isDeleted: { $ne: true } },
      { isRead: true, readAt: new Date() },
    );
    return result.modifiedCount;
  }

  async deleteNotification(id: string, userId?: string): Promise<boolean> {
    const filter: any = { _id: id };
    if (userId) filter.userId = userId;

    const result = await this.model.updateOne(filter, { isDeleted: true });
    return result.modifiedCount > 0;
  }

  async clearAllNotifications(userId: string): Promise<number> {
    const result = await this.model.updateMany({ userId, isDeleted: { $ne: true } }, { isDeleted: true });
    return result.modifiedCount;
  }
}

export const notificationRepository = new NotificationRepository();
