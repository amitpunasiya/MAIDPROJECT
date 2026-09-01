import { z } from 'zod';
import { UserRole } from '../types/auth.types.js';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number format (E.164 recommended)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER).optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
  isProvider: z.boolean().optional(),
  services: z.array(z.string()).optional(),
  // Provider (Cook/Maid) specific registration fields
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').optional(),
  experienceYears: z.number().min(0).max(60).optional(),
  bio: z.string().trim().max(1000).optional(),
  serviceTypes: z.array(z.string()).optional(),
});

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format').optional(),
    password: z.string().min(1, 'Password is required'),
    role: z.nativeEnum(UserRole).optional(),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: 'Either email or phone number is required for login',
    path: ['email'],
  });

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number format (E.164 recommended)'),
});

export const verifyOtpSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number format (E.164 recommended)'),
  role: z.nativeEnum(UserRole).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format').optional(),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: 'Either email or phone number must be provided',
    path: ['email'],
  });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export const sendEmailVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SendEmailVerificationInput = z.infer<typeof sendEmailVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
