import { getFirebaseAuth } from '../../config/firebase.js';
import { userRepository } from '../../repositories/user.repository.js';
import { customerRepository } from '../../repositories/customer.repository.js';
import { hashPassword } from '../../utils/password.js';
import { generateSecureToken } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { UserRole } from '../../types/auth.types.js';
import { ServiceType } from '../../types/domain.enums.js';
import type { IUserDocument } from '../../models/user.model.js';

export class OtpService {
  async sendOtp(phone: string): Promise<{ phone: string; message: string }> {
    const user = await userRepository.findByPhone(phone);

    if (user && !user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    return {
      phone,
      message:
        'OTP initiation acknowledged. Use the Firebase client SDK to send the OTP to this phone number.',
    };
  }

  async verifyOtp(idToken: string, phone: string): Promise<IUserDocument> {
    let decodedToken;

    try {
      decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
    } catch (error) {
      logger.warn('Firebase ID token verification failed', {
        error: (error as Error).message,
      });
      throw ApiError.unauthorized('Invalid or expired OTP token');
    }

    if (!decodedToken.phone_number) {
      throw ApiError.badRequest('Phone number not found in Firebase token');
    }

    if (decodedToken.phone_number !== phone) {
      throw ApiError.badRequest('Phone number does not match the verified token');
    }

    let user = await userRepository.findByPhone(phone);

    if (!user) {
      // Auto-register user via Firebase OTP
      const randomPassword = await hashPassword(generateSecureToken());
      const cleanPhone = phone.replace(/\+/g, '');
      user = await userRepository.create({
        name: `User_${cleanPhone.slice(-4)}`,
        email: `${cleanPhone}@otp.local`,
        phone,
        password: randomPassword,
        role: UserRole.CUSTOMER,
        isPhoneVerified: true,
        firebaseUid: decodedToken.uid,
      });

      await customerRepository.create({
        userId: user._id,
        preferences: {
          serviceTypes: [ServiceType.COOK],
          dietaryRestrictions: [],
          preferredLanguages: [],
        },
      });

      return user;
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const updatedUser = await userRepository.updateById(user._id.toString(), {
      isPhoneVerified: true,
      firebaseUid: decodedToken.uid,
      lastLoginAt: new Date(),
    });

    if (!updatedUser) {
      throw ApiError.internal('Failed to update phone verification status');
    }

    return updatedUser;
  }
}

export const otpService = new OtpService();
