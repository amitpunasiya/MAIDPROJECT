import type { Types } from 'mongoose';
import { BaseRepository } from '../../../repositories/base.repository.js';
import { City } from '../../../models/city.model.js';
import type { ICity, ICityQueryFilter } from '../interfaces/city.interface.js';

export class CityRepository extends BaseRepository<ICity> {
  constructor() {
    super(City);
  }

  async findBySlug(slug: string): Promise<ICity | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  async findByNameAndState(stateId: string | Types.ObjectId, name: string): Promise<ICity | null> {
    return this.findOne({ stateId, name: new RegExp(`^${name.trim()}$`, 'i') });
  }

  async findByState(stateId: string | Types.ObjectId, isActive?: boolean): Promise<ICity[]> {
    const filter: Record<string, unknown> = { stateId };
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return this.findMany(filter, { sort: { name: 1 } });
  }

  async searchCities(query: string, limit = 20, stateId?: string): Promise<ICity[]> {
    const filter: Record<string, unknown> = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { slug: { $regex: query, $options: 'i' } },
      ],
    };
    if (stateId) {
      filter.stateId = stateId;
    }
    return this.findMany(filter, { limit, sort: { name: 1 } });
  }

  async findWithPagination(queryFilter: ICityQueryFilter): Promise<{ cities: ICity[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (queryFilter.stateId) {
      filter.stateId = queryFilter.stateId;
    }
    if (queryFilter.countryId) {
      filter.countryId = queryFilter.countryId;
    }
    if (queryFilter.isActive !== undefined) {
      filter.isActive = queryFilter.isActive;
    }
    if (queryFilter.search) {
      const searchRegex = new RegExp(queryFilter.search, 'i');
      filter.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const page = queryFilter.page || 1;
    const limit = queryFilter.limit || 50;
    const skip = (page - 1) * limit;

    const sortBy = queryFilter.sortBy || 'name';
    const sortOrder = queryFilter.sortOrder === 'desc' ? -1 : 1;

    const [cities, total] = await Promise.all([
      this.findMany(filter, { skip, limit, sort: { [sortBy]: sortOrder } }),
      this.count(filter),
    ]);

    return { cities, total };
  }
}

export const cityRepository = new CityRepository();
