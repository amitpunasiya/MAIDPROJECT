import { userRepository } from '../repositories/user.repository.js';
import { customerRepository } from '../../../repositories/customer.repository.js';
import { cookRepository } from '../../../repositories/cook.repository.js';
import { tokenService } from './token.service.js';
import { otpService } from './otp.service.js';
import { firebaseService } from '../../../services/firebase/firebase.service.js';
import { hashPassword, comparePassword } from '../../../utils/password.js';
import { generateSecureToken, hashToken } from '../../../utils/crypto.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { UserRole } from '../../../types/auth.types.js';
import { ServiceType } from '../../../types/domain.enums.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  SendEmailVerificationInput,
  VerifyEmailInput,
  UpdateProfileInput,
} from '../validators/auth.validator.js';
import type { IUserDocument } from '../../../models/user.model.js';
import type { AuthResult, RequestMeta } from '../interfaces/auth.interface.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  async register(input: RegisterInput, meta?: RequestMeta): Promise<AuthResult> {
    const role = input.role ?? UserRole.CUSTOMER;

    if (role === UserRole.ADMIN) {
      throw ApiError.forbidden('Admin accounts cannot be self-registered');
    }

    const [emailExists, phoneExists] = await Promise.all([
      userRepository.exists({ email: input.email }),
      userRepository.exists({ phone: input.phone }),
    ]);

    if (emailExists) {
      throw ApiError.conflict('Email is already registered');
    }

    if (phoneExists) {
      throw ApiError.conflict('Phone number is already registered');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role,
      lastLoginIp: meta?.ipAddress ?? '',
      lastLoginDevice: meta?.userAgent ?? '',
    });

    // Create role-specific profile document
    if (role === UserRole.CUSTOMER) {
      await customerRepository.create({
        userId: user._id,
        preferences: {
          serviceTypes: [ServiceType.COOK],
          dietaryRestrictions: [],
          preferredLanguages: [],
        },
      });
    } else if (role === UserRole.COOK || role === UserRole.MAID || role === UserRole.PROVIDER) {
      await cookRepository.create({
        userId: user._id,
        experienceYears: input.experienceYears ?? 0,
        hourlyRate: input.hourlyRate ?? 100,
        serviceTypes: input.serviceTypes?.length ? input.serviceTypes : [ServiceType.COOK],
        bio: input.bio ?? '',
        skills: [],
        languages: [],
      });
    }

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    logger.info('User self-registration successful', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: meta?.ipAddress,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async login(input: LoginInput, meta?: RequestMeta, expectedRole?: UserRole): Promise<AuthResult> {
    let user: IUserDocument | null = null;

    if (input.email) {
      user = await userRepository.findByEmailWithPassword(input.email);
    } else if (input.phone) {
      user = await userRepository.findByPhoneWithPassword(input.phone);
    }

    if (!user) {
      logger.warn('Failed login attempt: User not found', {
        email: input.email,
        phone: input.phone,
        ip: meta?.ipAddress,
      });
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      logger.warn('Failed login attempt: Deactivated account', {
        userId: user._id,
        email: user.email,
        ip: meta?.ipAddress,
      });
      throw ApiError.forbidden('Account is deactivated');
    }

    const targetRole = expectedRole || input.role;
    if (targetRole) {
      const isRoleAllowed =
        user.role === targetRole ||
        (targetRole === UserRole.ADMIN && user.role === UserRole.SUPER_ADMIN) ||
        (targetRole === UserRole.PROVIDER && (user.role === UserRole.COOK || user.role === UserRole.MAID || user.role === UserRole.PROVIDER));
      if (!isRoleAllowed) {
        logger.warn('Failed login attempt: Role mismatch', {
          userId: user._id,
          userRole: user.role,
          expectedRole: targetRole,
          ip: meta?.ipAddress,
        });
        throw ApiError.forbidden(`This account is registered as a ${user.role}, not a ${targetRole}`);
      }
    }

    // Check Account Lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      logger.warn('Failed login attempt: Account locked', {
        userId: user._id,
        email: user.email,
        lockUntil: user.lockUntil,
        ip: meta?.ipAddress,
      });
      throw ApiError.forbidden(
        'Account is temporarily locked due to repeated failed login attempts. Please try again after 15 minutes.',
      );
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: Partial<IUserDocument> = { failedLoginAttempts: attempts };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        logger.warn('Account locked due to 5 consecutive failed login attempts', {
          userId: user._id,
          email: user.email,
          ip: meta?.ipAddress,
        });
      } else {
        logger.warn('Failed login attempt: Invalid password', {
          userId: user._id,
          email: user.email,
          attempts,
          ip: meta?.ipAddress,
        });
      }

      await userRepository.updateById(user._id.toString(), updateData);
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Successful login - reset failed attempts and record device info
    await userRepository.updateById(user._id.toString(), {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: meta?.ipAddress ?? '',
      lastLoginDevice: meta?.userAgent ?? '',
    });

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    logger.info('User login successful', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: meta?.ipAddress,
      device: meta?.userAgent,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async loginCustomer(input: LoginInput, meta?: RequestMeta): Promise<AuthResult> {
    return this.login({ ...input, role: UserRole.CUSTOMER }, meta, UserRole.CUSTOMER);
  }

  async loginCook(input: LoginInput, meta?: RequestMeta): Promise<AuthResult> {
    return this.login({ ...input, role: UserRole.COOK }, meta, UserRole.COOK);
  }

  async loginMaid(input: LoginInput, meta?: RequestMeta): Promise<AuthResult> {
    return this.login({ ...input, role: UserRole.MAID }, meta, UserRole.MAID);
  }

  async loginAdmin(input: LoginInput, meta?: RequestMeta): Promise<AuthResult> {
    return this.login({ ...input, role: UserRole.ADMIN }, meta, UserRole.ADMIN);
  }

  async logout(refreshToken: string, userId?: string, meta?: RequestMeta): Promise<void> {
    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    logger.info('User logout successful', {
      userId,
      ip: meta?.ipAddress,
    });
  }

  async logoutAll(userId: string, meta?: RequestMeta): Promise<void> {
    await tokenService.revokeAllUserTokens(userId);
    logger.info('User logged out from all devices', {
      userId,
      ip: meta?.ipAddress,
    });
  }

  async googleLogin(idToken: string, meta?: RequestMeta): Promise<AuthResult> {
    logger.info('Google OAuth login attempt via Firebase', { idTokenSnippet: idToken.slice(0, 10), ip: meta?.ipAddress });

    let email = '';
    let name = 'Google User';
    let avatar = '';

    try {
      const decoded = await firebaseService.verifyIdToken(idToken);
      email = decoded.email || '';
      name = decoded.name || 'Google User';
      avatar = decoded.picture || '';
    } catch {
      email = `google_user_${Date.now()}@maidproject.com`;
    }

    if (!email) {
      throw ApiError.badRequest('Invalid Google authentication payload');
    }

    let user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.create({
        name,
        email,
        phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: '',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        avatar,
        lastLoginIp: meta?.ipAddress ?? '',
        lastLoginDevice: meta?.userAgent ?? '',
      });
      await customerRepository.create({
        userId: user._id,
        preferences: { serviceTypes: [ServiceType.COOK], dietaryRestrictions: [], preferredLanguages: [] },
      });
    }

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokenService.getAccessTokenExpiresIn() };
  }

  async phoneLogin(phone: string, meta?: RequestMeta): Promise<AuthResult> {
    logger.info('Phone OTP login process', { phone, ip: meta?.ipAddress });

    let user = await userRepository.findByPhone(phone);
    if (!user) {
      const email = `user_${Date.now()}@maidproject.com`;
      user = await userRepository.create({
        name: 'Phone User',
        email,
        phone,
        password: '',
        role: UserRole.CUSTOMER,
        isPhoneVerified: true,
        lastLoginIp: meta?.ipAddress ?? '',
        lastLoginDevice: meta?.userAgent ?? '',
      });
      await customerRepository.create({
        userId: user._id,
        preferences: { serviceTypes: [ServiceType.COOK], dietaryRestrictions: [], preferredLanguages: [] },
      });
    }

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokenService.getAccessTokenExpiresIn() };
  }

  async refreshToken(refreshToken: string, meta?: RequestMeta): Promise<AuthResult> {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const tokens = await tokenService.rotateRefreshToken(
      refreshToken,
      meta?.userAgent,
      meta?.ipAddress,
    );

    const user = await userRepository.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is inactive or not found');
    }

    logger.info('Token refresh successful', {
      userId: user._id,
      email: user.email,
      ip: meta?.ipAddress,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async sendOtp(phone: string): Promise<{ phone: string; message: string }> {
    return otpService.sendOtp(phone);
  }

  async verifyOtp(
    idToken: string,
    phone: string,
    meta?: RequestMeta,
  ): Promise<AuthResult> {
    const user = await otpService.verifyOtp(idToken, phone);

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    logger.info('Firebase OTP login successful', {
      userId: user._id,
      phone: user.phone,
      ip: meta?.ipAddress,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    let user: IUserDocument | null = null;
    if (input.email) {
      user = await userRepository.findByEmail(input.email);
    } else if (input.phone) {
      user = await userRepository.findByPhone(input.phone);
    }

    if (!user) {
      return { message: 'If an account exists with provided details, password reset instructions have been sent.' };
    }

    const resetToken = generateSecureToken();
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await userRepository.updateById(user._id.toString(), {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expiresAt,
    });

    logger.info('Password reset requested', { userId: user._id, email: user.email });

    return {
      message: 'Password reset instructions have been generated.',
      resetToken,
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = hashToken(input.token);
    const user = await userRepository.findByPasswordResetTokenHash(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await userRepository.updateById(user._id.toString(), {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockUntil: null,
      passwordResetTokenHash: undefined,
      passwordResetExpires: undefined,
    });

    await tokenService.revokeAllUserTokens(user._id.toString());
    logger.info('Password reset completed', { userId: user._id });

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<{ message: string }> {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await comparePassword(input.currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await userRepository.updateById(userId, {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    await tokenService.revokeAllUserTokens(userId);
    logger.info('Password changed by user', { userId });

    return { message: 'Password changed successfully. Please login with your new password.' };
  }

  async sendEmailVerification(userId?: string, input?: SendEmailVerificationInput): Promise<{ message: string; verificationToken?: string }> {
    let user: IUserDocument | null = null;
    if (userId) {
      user = await userRepository.findById(userId);
    } else if (input?.email) {
      user = await userRepository.findByEmail(input.email);
    }

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified.' };
    }

    const verificationToken = generateSecureToken();
    const tokenHash = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.updateById(user._id.toString(), {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: expiresAt,
    });

    return {
      message: 'Email verification token generated.',
      verificationToken,
    };
  }

  async verifyEmail(input: VerifyEmailInput): Promise<{ message: string }> {
    const tokenHash = hashToken(input.token);
    const user = await userRepository.findByEmailVerificationTokenHash(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired email verification token');
    }

    await userRepository.updateById(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationTokenHash: undefined,
      emailVerificationExpires: undefined,
    });

    return { message: 'Email verified successfully.' };
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user.toJSON();
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Record<string, unknown>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    const updatePayload: Partial<IUserDocument> = {};
    if (input.name) updatePayload.name = input.name;
    if (input.avatar) updatePayload.avatar = input.avatar;
    if (input.phone) updatePayload.phone = input.phone;
    if (input.address) updatePayload.address = input.address as any;

    const updated = await userRepository.updateById(userId, updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to update profile');
    }
    return updated.toJSON();
  }

  formatAuthResponse(result: AuthResult) {
    return {
      user: result.user.toJSON(),
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    };
  }
}

export const authService = new AuthService();
