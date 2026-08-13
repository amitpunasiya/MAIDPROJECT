import { userRepository } from '../../repositories/user.repository.js';
import { customerRepository } from '../../repositories/customer.repository.js';
import { cookRepository } from '../../repositories/cook.repository.js';
import { cloudinaryService } from '../cloudinary/cloudinary.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { UserRole } from '../../types/auth.types.js';
import type { UpdateProfileInput } from '../../validators/user.validator.js';

export class UserService {
  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const userData = user.toJSON();
    let roleProfile = null;

    if (user.role === UserRole.CUSTOMER) {
      roleProfile = await customerRepository.findByUserId(userId);
    } else if (user.role === UserRole.COOK || user.role === UserRole.MAID) {
      roleProfile = await cookRepository.findByUserId(userId);
    }

    return {
      ...userData,
      roleProfile,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Record<string, unknown>> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const { preferences, bio, experienceYears, hourlyRate, serviceTypes, skills, languages, isAvailable, ...userUpdates } = input;

    if (Object.keys(userUpdates).length > 0) {
      await userRepository.updateById(userId, userUpdates);
    }

    if (user.role === UserRole.CUSTOMER && preferences) {
      await customerRepository.updateByUserId(userId, { preferences } as any);
    } else if ((user.role === UserRole.COOK || user.role === UserRole.MAID)) {
      const cookUpdates: Record<string, unknown> = {};
      if (bio !== undefined) cookUpdates.bio = bio;
      if (experienceYears !== undefined) cookUpdates.experienceYears = experienceYears;
      if (hourlyRate !== undefined) cookUpdates.hourlyRate = hourlyRate;
      if (serviceTypes !== undefined) cookUpdates.serviceTypes = serviceTypes;
      if (skills !== undefined) cookUpdates.skills = skills;
      if (languages !== undefined) cookUpdates.languages = languages;
      if (isAvailable !== undefined) cookUpdates.isAvailable = isAvailable;

      if (Object.keys(cookUpdates).length > 0) {
        await cookRepository.updateByUserId(userId, cookUpdates as any);
      }
    }

    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer): Promise<{ avatar: string }> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const uploadResult = await cloudinaryService.uploadImage(fileBuffer, 'avatars');

    await userRepository.updateById(userId, {
      avatar: uploadResult.url,
    });

    return { avatar: uploadResult.url };
  }
}

export const userService = new UserService();
