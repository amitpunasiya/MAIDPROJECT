import type { Request, Response } from 'express';
import { documentService } from '../services/document/document.service.js';
import { VerificationStatus } from '../types/domain.enums.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class DocumentController {
  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { documentType } = req.body;
    const file = req.file;

    if (!documentType || !file) {
      throw ApiError.badRequest('documentType and file payload are required');
    }

    const doc = await documentService.uploadProviderDocument({
      userId: req.user.id,
      documentType,
      fileBuffer: file.buffer,
    });

    return ApiResponse.created(res, 'Document uploaded successfully', doc);
  });

  verifyDocument = asyncHandler(async (req: Request, res: Response) => {
    const { cookId, status, rejectionReason } = req.body;
    if (!cookId || !status) {
      throw ApiError.badRequest('cookId and status are required');
    }

    const result = await documentService.verifyProviderDocument(
      cookId,
      status as VerificationStatus,
      rejectionReason
    );

    return ApiResponse.ok(res, `Provider verification status updated to ${status}`, result);
  });
}

export const documentController = new DocumentController();
