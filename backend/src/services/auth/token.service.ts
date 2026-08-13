import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';
import { env } from '../../config/env.js';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository.js';
import { hashToken, generateSecureToken } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import type { JwtAccessPayload, JwtRefreshPayload, TokenPair, UserRole } from '../../types/auth.types.js';
import type { Types } from 'mongoose';

interface CreateTokenPairParams {
  userId: string;
  email: string;
  role: UserRole;
  userAgent?: string;
  ipAddress?: string;
}

export class TokenService {
  generateAccessToken(payload: Omit<JwtAccessPayload, 'sub'> & { sub: string }): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  generateRefreshToken(userId: string, jti: string): string {
    const payload: JwtRefreshPayload = { sub: userId, jti };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): JwtAccessPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    } catch {
      throw ApiError.unauthorized('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Refresh token expired');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async createTokenPair(params: CreateTokenPairParams): Promise<TokenPair> {
    const { userId, email, role, userAgent, ipAddress } = params;

    const accessToken = this.generateAccessToken({ sub: userId, email, role });
    const jti = generateSecureToken();
    const refreshToken = this.generateRefreshToken(userId, jti);

    const expiresMs = ms(env.JWT_REFRESH_EXPIRES_IN as StringValue);
    const expiresAt = new Date(Date.now() + (typeof expiresMs === 'number' ? expiresMs : 7 * 24 * 60 * 60 * 1000));

    await refreshTokenRepository.create({
      userId: userId as unknown as Types.ObjectId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const decoded = this.verifyRefreshToken(oldRefreshToken);
    const tokenHash = hashToken(oldRefreshToken);

    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.isRevoked) {
      throw ApiError.unauthorized('Refresh token revoked or not found');
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired');
    }

    await refreshTokenRepository.revokeByTokenHash(tokenHash);

    const { userRepository } = await import('../../repositories/user.repository.js');
    const user = await userRepository.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is inactive or not found');
    }

    return this.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent,
      ipAddress,
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.revokeByTokenHash(tokenHash);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllByUserId(userId);
  }

  getAccessTokenExpiresIn(): string {
    return env.JWT_ACCESS_EXPIRES_IN;
  }
}

export const tokenService = new TokenService();
