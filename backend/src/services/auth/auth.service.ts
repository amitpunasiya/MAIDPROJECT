import { userRepository } from '../../repositories/user.repository.js';
import { customerRepository } from '../../repositories/customer.repository.js';
import { cookRepository } from '../../repositories/cook.repository.js';
import { tokenService } from './token.service.js';
import { otpService } from './otp.service.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateSecureToken, hashToken } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { UserRole } from '../../types/auth.types.js';
import { ServiceType } from '../../types/domain.enums.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  SendEmailVerificationInput,
  VerifyEmailInput,
} from '../../validators/auth.validator.js';
import type { IUserDocument } from '../../models/user.model.js';

interface AuthResult {
  user: IUserDocument;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

const sanitizeUser = (user: IUserDocument) => {
  return user.toJSON();
};

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
    } else if (role === UserRole.COOK) {
      await cookRepository.create({
        userId: user._id,
        experienceYears: input.experienceYears ?? 0,
        hourlyRate: input.hourlyRate ?? 100,
        serviceTypes: input.serviceTypes?.length ? input.serviceTypes : [ServiceType.COOK],
        bio: input.bio ?? '',
        skills: [],
        languages: [],
      });
    } else if (role === UserRole.MAID) {
      await cookRepository.create({
        userId: user._id,
        experienceYears: input.experienceYears ?? 0,
        hourlyRate: input.hourlyRate ?? 100,
        serviceTypes: input.serviceTypes?.length ? input.serviceTypes : [ServiceType.MAID],
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

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async login(input: LoginInput, meta?: RequestMeta): Promise<AuthResult> {
    let user: IUserDocument | null = null;

    if (input.email) {
      user = await userRepository.findByEmailWithPassword(input.email);
    } else if (input.phone) {
      user = await userRepository.findByPhoneWithPassword(input.phone);
    }

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    await userRepository.updateById(user._id.toString(), {
      lastLoginAt: new Date(),
    });

    const tokens = await tokenService.createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
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

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
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

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokenService.getAccessTokenExpiresIn(),
    };
  }

  async logout(refreshToken: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    if (userId) {
      await tokenService.revokeAllUserTokens(userId);
    }
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
      passwordResetTokenHash: undefined,
      passwordResetExpires: undefined,
    });

    await tokenService.revokeAllUserTokens(user._id.toString());

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
    });

    await tokenService.revokeAllUserTokens(userId);

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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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

  formatAuthResponse(result: AuthResult) {
    return {
      user: sanitizeUser(result.user),
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    };
  }
}

export const authService = new AuthService();
