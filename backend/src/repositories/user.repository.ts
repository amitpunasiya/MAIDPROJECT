import type { FilterQuery, UpdateQuery } from 'mongoose';
import { User, type IUserDocument } from '../models/user.model.js';

export class UserRepository {
  async create(data: Partial<IUserDocument>): Promise<IUserDocument> {
    return User.create(data);
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('+password');
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone });
  }

  async findByPhoneWithPassword(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone }).select('+password');
  }

  async findByFirebaseUid(firebaseUid: string): Promise<IUserDocument | null> {
    return User.findOne({ firebaseUid });
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<IUserDocument | null> {
    return User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpires');
  }

  async findByEmailVerificationTokenHash(tokenHash: string): Promise<IUserDocument | null> {
    return User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationTokenHash +emailVerificationExpires');
  }

  async updateById(
    id: string,
    update: UpdateQuery<IUserDocument>,
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  async exists(filter: FilterQuery<IUserDocument>): Promise<boolean> {
    const count = await User.countDocuments(filter);
    return count > 0;
  }
}

export const userRepository = new UserRepository();
