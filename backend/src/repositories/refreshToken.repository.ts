import { RefreshToken, type IRefreshTokenDocument } from '../models/refreshToken.model.js';
import type { Types } from 'mongoose';

export class RefreshTokenRepository {
  async create(data: Partial<IRefreshTokenDocument>): Promise<IRefreshTokenDocument> {
    return RefreshToken.create(data);
  }

  async findByTokenHash(tokenHash: string): Promise<IRefreshTokenDocument | null> {
    return RefreshToken.findOne({ tokenHash, isRevoked: false });
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
  }

  async revokeAllByUserId(userId: Types.ObjectId | string): Promise<void> {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  }

  async deleteExpired(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount ?? 0;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
