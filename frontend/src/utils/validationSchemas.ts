import { z } from 'zod';
import { UserRole } from '../types';

export const loginSchema = z.object({
  mobileOrEmail: z
    .string()
    .min(1, 'Please enter your Mobile Number or Email address')
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isMobile = /^[6-9]\d{9}$/.test(val.replace(/\s+/g, ''));
        return isEmail || isMobile;
      },
      { message: 'Enter a valid 10-digit mobile number or valid email address' }
    ),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    userType: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Please select a valid user type' }),
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms & Conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Please enter your registered Email or Mobile Number')
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isMobile = /^[6-9]\d{9}$/.test(val.replace(/\s+/g, ''));
        return isEmail || isMobile;
      },
      { message: 'Enter a valid 10-digit mobile number or valid email address' }
    ),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
