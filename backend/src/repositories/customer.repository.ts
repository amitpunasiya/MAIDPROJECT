import { BaseRepository } from './base.repository.js';
import { Customer, type ICustomerDocument } from '../models/customer.model.js';
import type { Types } from 'mongoose';

export class CustomerRepository extends BaseRepository<ICustomerDocument> {
  constructor() {
    super(Customer);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<ICustomerDocument | null> {
    return this.findOne({ userId });
  }

  async updateByUserId(
    userId: string | Types.ObjectId,
    update: Partial<ICustomerDocument>,
  ): Promise<ICustomerDocument | null> {
    return this.updateOne({ userId }, update);
  }
}

export const customerRepository = new CustomerRepository();
