import type { Request, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import { uploadMediaSchema, listMediaSchema } from '../validators/media.validator.js';
import { MediaContext } from '../../../models/media.model.js';
import { UserRole } from '../../../types/auth.types.js';

export class MediaController {
  /**
   * POST /media/upload
   * Multipart form: field `file` (binary) + field `context` (string)
   */
  upload = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const file = req.file;
    if (!file) throw ApiError.badRequest('No file provided. Send a file in the `file` field.');

    const parsed = uploadMediaSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw ApiError.badRequest('Invalid request body', errors as Record<string, string[]>);
    }

    const media = await mediaService.uploadMedia({
      userId: req.user.id,
      file,
      context: parsed.data.context as MediaContext,
    });

    return ApiResponse.created(res, 'Media uploaded successfully', media);
  });

  /**
   * GET /media/list
   * Query params: page, limit, context, mediaType, verificationStatus
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const parsed = listMediaSchema.safeParse(req.query);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw ApiError.badRequest('Invalid query parameters', errors as Record<string, string[]>);
    }

    const result = await mediaService.listMedia(
      req.user.id,
      req.user.role as UserRole,
      parsed.data,
    );

    return ApiResponse.success(res, 200, 'Media list fetched successfully', result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  });

  /**
   * GET /media/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const id = String(req.params.id);
    const media = await mediaService.getMedia(id, req.user.id, req.user.role as UserRole);

    return ApiResponse.ok(res, 'Media fetched successfully', media);
  });

  /**
   * GET /media/:id/signed-url
   * Returns a time-limited signed URL (Cloudinary) or the plain URL (local).
   */
  getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const id = String(req.params.id);
    const rawExpiry = req.query.expiresIn;
    const expiresIn = rawExpiry ? parseInt(String(rawExpiry), 10) : 3600;

    const signedUrl = await mediaService.getSignedUrl(
      id,
      req.user.id,
      req.user.role as UserRole,
      expiresIn,
    );

    return ApiResponse.ok(res, 'Signed URL generated successfully', { signedUrl, expiresIn });
  });

  /**
   * DELETE /media/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const id = String(req.params.id);
    await mediaService.deleteMedia(id, req.user.id, req.user.role as UserRole);

    return ApiResponse.ok(res, 'Media deleted successfully');
  });

  /**
   * PUT /media/:id/replace
   * Multipart form: field `file` (binary) — replaces an existing media record.
   */
  replace = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const file = req.file;
    if (!file)
      throw ApiError.badRequest('No replacement file provided. Send a file in the `file` field.');

    const id = String(req.params.id);
    const media = await mediaService.replaceMedia(
      id,
      req.user.id,
      req.user.role as UserRole,
      file,
    );

    return ApiResponse.ok(res, 'Media replaced successfully', media);
  });
}

export const mediaController = new MediaController();
