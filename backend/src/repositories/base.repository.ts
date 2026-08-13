import type { Document, FilterQuery, Model, UpdateQuery, Types } from 'mongoose';
import type { ISoftDelete } from '../models/common/softDelete.js';
import { mergeNotDeleted } from '../models/common/softDelete.js';

export interface FindManyOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export abstract class BaseRepository<TDoc extends Document & ISoftDelete> {
  constructor(protected readonly model: Model<TDoc>) {}

  async create(data: Partial<TDoc>): Promise<TDoc> {
    return this.model.create(data);
  }

  async findById(id: string | Types.ObjectId): Promise<TDoc | null> {
    return this.model.findOne(mergeNotDeleted({ _id: id }));
  }

  async findOne(filter: FilterQuery<TDoc>): Promise<TDoc | null> {
    return this.model.findOne(mergeNotDeleted(filter));
  }

  async findMany(
    filter: FilterQuery<TDoc> = {},
    options: FindManyOptions = {},
  ): Promise<TDoc[]> {
    let query = this.model.find(mergeNotDeleted(filter));

    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    return query.exec();
  }

  async count(filter: FilterQuery<TDoc> = {}): Promise<number> {
    return this.model.countDocuments(mergeNotDeleted(filter));
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<TDoc>,
  ): Promise<TDoc | null> {
    return this.model.findOneAndUpdate(mergeNotDeleted({ _id: id }), update, {
      new: true,
      runValidators: true,
    });
  }

  async updateOne(
    filter: FilterQuery<TDoc>,
    update: UpdateQuery<TDoc>,
  ): Promise<TDoc | null> {
    return this.model.findOneAndUpdate(mergeNotDeleted(filter), update, {
      new: true,
      runValidators: true,
    });
  }

  async softDeleteById(id: string | Types.ObjectId): Promise<TDoc | null> {
    return this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
  }

  async restoreById(id: string | Types.ObjectId): Promise<TDoc | null> {
    return this.model.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true },
    );
  }

  async exists(filter: FilterQuery<TDoc>): Promise<boolean> {
    const count = await this.model.countDocuments(mergeNotDeleted(filter));
    return count > 0;
  }
}
