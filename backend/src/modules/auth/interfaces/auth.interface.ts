import type { IUserDocument } from '../../../models/user.model.js';
import type { UserRole } from '../../../types/auth.types.js';

export interface AuthResult {
  user: IUserDocument;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface UserProfileResponse {
  user: Record<string, unknown>;
}

export interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export type { UserRole };
