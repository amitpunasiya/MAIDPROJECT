import { Cook } from '../../models/cook.model.js';
import { cloudinaryService } from '../cloudinary/cloudinary.service.js';
import { VerificationStatus } from '../../types/domain.enums.js';
import { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export interface DocumentUploadInput {
  userId: string;
  documentType: 'aadhaar' | 'pan' | 'certificate' | 'photo';
  fileBuffer: Buffer;
}

export class DocumentService {
  async uploadProviderDocument(input: DocumentUploadInput) {
    const cook = await Cook.findOne({ userId: new Types.ObjectId(input.userId) });
    if (!cook) throw ApiError.notFound('Provider profile not found');

    const result = await cloudinaryService.uploadDocument(input.fileBuffer, `documents/${cook._id}`);

    logger.info('Provider document uploaded', { cookId: cook._id, documentType: input.documentType, url: result.url });

    return {
      cookId: cook._id,
      documentType: input.documentType,
      url: result.url,
      publicId: result.publicId,
      status: VerificationStatus.PENDING,
      uploadedAt: new Date(),
    };
  }

  async verifyProviderDocument(cookId: string, status: VerificationStatus, rejectionReason?: string) {
    const cook = await Cook.findById(cookId);
    if (!cook) throw ApiError.notFound('Cook profile not found');

    cook.verificationStatus = status;
    if (status === VerificationStatus.VERIFIED) {
      cook.verifiedAt = new Date();
    } else if (status === VerificationStatus.REJECTED) {
      cook.rejectionReason = rejectionReason || 'Document verification failed';
    }

    await cook.save();
    return cook;
  }
}

export const documentService = new DocumentService();
