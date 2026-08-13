import { Favorite, type IFavoriteDocument } from '../../models/favorite.model.js';
import { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class FavoriteService {
  async addFavorite(customerId: string, itemType: 'provider' | 'service', targetId: string): Promise<IFavoriteDocument> {
    if (!targetId) throw ApiError.badRequest('targetId is required');

    const query: any = { customerId: new Types.ObjectId(customerId), itemType, isDeleted: false };
    if (itemType === 'provider') query.providerId = new Types.ObjectId(targetId);
    else query.serviceId = new Types.ObjectId(targetId);

    const existing = await Favorite.findOne(query);
    if (existing) return existing;

    return Favorite.create({
      customerId: new Types.ObjectId(customerId),
      itemType,
      providerId: itemType === 'provider' ? new Types.ObjectId(targetId) : undefined,
      serviceId: itemType === 'service' ? new Types.ObjectId(targetId) : undefined,
    });
  }

  async removeFavorite(customerId: string, itemType: 'provider' | 'service', targetId: string): Promise<boolean> {
    const query: any = { customerId: new Types.ObjectId(customerId), itemType };
    if (itemType === 'provider') query.providerId = new Types.ObjectId(targetId);
    else query.serviceId = new Types.ObjectId(targetId);

    const res = await Favorite.deleteOne(query);
    return res.deletedCount > 0;
  }

  async getFavorites(customerId: string) {
    const favorites = await Favorite.find({ customerId: new Types.ObjectId(customerId), isDeleted: false })
      .populate('providerId', 'name avatar email phone role address')
      .populate('serviceId')
      .sort({ createdAt: -1 });

    return favorites;
  }
}

export const favoriteService = new FavoriteService();
