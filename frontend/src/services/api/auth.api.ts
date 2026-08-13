import { get, post, patch } from './helpers';
import { ApiResponse } from './types';
import { UserRole } from '../../types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  mobileOrEmail?: string;
  password?: string;
  otp?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: UserRole;
  city?: string;
  address?: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp?: string;
  idToken?: string;
}

export interface ForgotPasswordPayload {
  email?: string;
  phone?: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword?: string;
  password?: string;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  currentPassword?: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  city?: string;
  address?: string;
}

// ─── Auth API Service ─────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Universal Login (Supports email/phone + password)
   * POST /auth/login
   */
  login(data: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/login', data);
  },

  /**
   * Role-specific Login Endpoints
   */
  loginCustomer(data: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/login/customer', data);
  },

  loginCook(data: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/login/cook', data);
  },

  loginMaid(data: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/login/maid', data);
  },

  loginAdmin(data: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/login/admin', data);
  },

  /**
   * Register a new user (Customer / Cook / Maid)
   * POST /auth/register
   */
  register(data: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/register', data);
  },

  /**
   * Request phone OTP
   * POST /auth/send-otp
   */
  sendOtp(phone: string): Promise<ApiResponse<{ phone: string; message?: string }>> {
    return post<{ phone: string; message?: string }>('/auth/send-otp', { phone });
  },

  /**
   * Verify phone OTP
   * POST /auth/verify-otp
   */
  verifyOtp(data: VerifyOtpPayload): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/verify-otp', data);
  },

  /**
   * Logout current session
   * POST /auth/logout
   */
  logout(refreshToken?: string): Promise<ApiResponse<null>> {
    return post<null>('/auth/logout', { refreshToken });
  },

  /**
   * Logout all sessions across devices
   * POST /auth/logout-all
   */
  logoutAll(): Promise<ApiResponse<null>> {
    return post<null>('/auth/logout-all');
  },

  /**
   * Request password reset link / token
   * POST /auth/forgot-password
   */
  forgotPassword(data: ForgotPasswordPayload): Promise<ApiResponse<{ message: string; resetToken?: string }>> {
    return post<{ message: string; resetToken?: string }>('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  resetPassword(data: ResetPasswordPayload): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/reset-password', data);
  },

  /**
   * Change current user's password
   * POST /auth/change-password
   */
  changePassword(data: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/change-password', data);
  },

  /**
   * Get authenticated user profile
   * GET /auth/profile
   */
  getProfile(): Promise<ApiResponse<{ user: AuthUser }>> {
    return get<{ user: AuthUser }>('/auth/profile');
  },

  /**
   * Update user profile fields
   * PATCH /auth/profile
   */
  updateProfile(data: UpdateProfilePayload): Promise<ApiResponse<{ user: AuthUser }>> {
    return patch<{ user: AuthUser }>('/auth/profile', data);
  },

  /**
   * Refresh JWT access token
   * POST /auth/refresh-token
   */
  refreshToken(token?: string): Promise<ApiResponse<AuthResponseData>> {
    return post<AuthResponseData>('/auth/refresh-token', { refreshToken: token });
  },
};

export default authApi;
