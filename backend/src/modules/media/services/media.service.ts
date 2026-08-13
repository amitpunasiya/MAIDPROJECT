import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import { cloudinaryService } from '../../../services/cloudinary/cloudinary.service.js';
import { mediaRepository, type MediaListOptions } from '../repositories/media.repository.js';
import {
  MediaContext,
  MediaType,
  StorageProvider,
  MediaVerificationStatus,
  type IMediaDocument,
} from '../../../models/media.model.js';
import { isImageMime } from '../../../middleware/upload/upload.middleware.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { env } from '../../../config/env.js';
import { UserRole } from '../../../types/auth.types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadMediaPayload {
  userId: string;
  file: Express.Multer.File;
  context: MediaContext;
}

export interface ListMediaQuery {
  page?: number;
  limit?: number;
  context?: MediaContext;
  mediaType?: MediaType;
  verificationStatus?: MediaVerificationStatus;
}

// ─── Image processing constants ───────────────────────────────────────────────

const IMAGE_MAX_WIDTH = 1200;
const IMAGE_MAX_HEIGHT = 1200;
const IMAGE_QUALITY = 85;
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 200;
const THUMBNAIL_QUALITY = 75;

// ─── Local storage helpers ────────────────────────────────────────────────────

function ensureUploadDir(subDir: string): string {
  const dir = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, subDir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeLocalFile(dir: string, filename: string, buffer: Buffer): string {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

function buildLocalUrl(subPath: string): string {
  // Returns a relative URL that maps to the static /uploads route
  return `/${env.LOCAL_UPLOAD_DIR}/${subPath}`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MediaService {
  /**
   * Compress image buffer with sharp.
   * Returns compressed buffer (converted to webp) + dimensions.
   */
  private async compressImage(
    buffer: Buffer,
  ): Promise<{ buffer: Buffer; width: number; height: number }> {
    const compressed = await sharp(buffer)
      .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: compressed.data,
      width: compressed.info.width,
      height: compressed.info.height,
    };
  }

  /**
   * Generate thumbnail buffer with sharp.
   */
  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: 'cover' })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer();
  }

  // ── Upload ──────────────────────────────────────────────────────────────────

  async uploadMedia(payload: UploadMediaPayload): Promise<IMediaDocument> {
    const { userId, file, context } = payload;
    const isImage = isImageMime(file.mimetype);
    const mediaType: MediaType = isImage ? MediaType.IMAGE : MediaType.DOCUMENT;
    const folder = `media/${context}`;
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    let url = '';
    let publicId = '';
    let thumbnailUrl = '';
    let localPath = '';
    let storageProvider: StorageProvider = StorageProvider.CLOUDINARY;
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;
    let processedBuffer = file.buffer;

    // ── Image processing ─────────────────────────────────────────────────────
    if (isImage) {
      try {
        const compressed = await this.compressImage(file.buffer);
        processedBuffer = compressed.buffer;
        width = compressed.width;
        height = compressed.height;
        format = 'webp';
      } catch (err) {
        logger.warn('Image compression failed, using raw buffer', { err });
        processedBuffer = file.buffer;
      }
    }

    // ── Try Cloudinary ───────────────────────────────────────────────────────
    try {
      const result = await cloudinaryService.uploadMediaWithOptions(processedBuffer, {
        folder,
        resourceType: isImage ? 'image' : 'auto',
        transformation: isImage
          ? [{ width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_HEIGHT, crop: 'limit', quality: IMAGE_QUALITY }]
          : undefined,
      });

      url = result.url;
      publicId = result.publicId;
      storageProvider = StorageProvider.CLOUDINARY;
      if (result.width) width = result.width;
      if (result.height) height = result.height;
      if (result.format) format = result.format;

      // Generate and upload thumbnail for images
      if (isImage) {
        try {
          const thumbBuffer = await this.generateThumbnail(file.buffer);
          const thumbResult = await cloudinaryService.uploadMediaWithOptions(thumbBuffer, {
            folder: `${folder}/thumbnails`,
            resourceType: 'image',
          });
          thumbnailUrl = thumbResult.url;
        } catch (thumbErr) {
          logger.warn('Thumbnail upload failed', { thumbErr });
        }
      }
    } catch (cloudErr) {
      // ── Fallback: local storage ───────────────────────────────────────────
      logger.warn('Cloudinary upload failed, falling back to local storage', { cloudErr });
      storageProvider = StorageProvider.LOCAL;

      try {
        const subDir = `${context}/${userId}`;
        const dir = ensureUploadDir(subDir);
        const filename = `${timestamp}_${safeOriginalName}`;
        writeLocalFile(dir, filename, processedBuffer);
        localPath = `${subDir}/${filename}`;
        url = buildLocalUrl(localPath);
        publicId = '';

        // Local thumbnail
        if (isImage) {
          try {
            const thumbBuffer = await this.generateThumbnail(file.buffer);
            const thumbFilename = `thumb_${timestamp}_${safeOriginalName}`;
            writeLocalFile(dir, thumbFilename, thumbBuffer);
            thumbnailUrl = buildLocalUrl(`${subDir}/${thumbFilename}`);
          } catch (thumbErr) {
            logger.warn('Local thumbnail generation failed', { thumbErr });
          }
        }
      } catch (localErr) {
        logger.error('Local storage fallback also failed', { localErr });
        throw ApiError.internal('Media upload failed. Please try again.');
      }
    }

    // ── Persist metadata to MongoDB ──────────────────────────────────────────
    const media = await mediaRepository.create({
      uploadedBy: new Types.ObjectId(userId),
      context,
      mediaType,
      originalName: file.originalname,
      mimeType: isImage ? 'image/webp' : file.mimetype,
      sizeBytes: processedBuffer.length,
      storageProvider,
      url,
      publicId,
      thumbnailUrl: thumbnailUrl || undefined,
      localPath: localPath || undefined,
      width,
      height,
      format,
      verificationStatus: MediaVerificationStatus.PENDING,
      isDeleted: false,
    } as Partial<IMediaDocument>);

    logger.info('Media uploaded successfully', {
      mediaId: media._id,
      userId,
      context,
      storageProvider,
    });

    return media;
  }

  // ── Get single ──────────────────────────────────────────────────────────────

  async getMedia(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<IMediaDocument> {
    const media = await mediaRepository.findById(id);
    if (!media) throw ApiError.notFound('Media not found');

    const isAdmin =
      requestingUserRole === UserRole.ADMIN || requestingUserRole === UserRole.SUPER_ADMIN;
    const isOwner = media.uploadedBy.toString() === requestingUserId;

    if (!isAdmin && !isOwner) {
      throw ApiError.forbidden('You do not have permission to access this media');
    }

    return media;
  }

  // ── List ────────────────────────────────────────────────────────────────────

  async listMedia(
    requestingUserId: string,
    requestingUserRole: UserRole,
    query: ListMediaQuery,
  ): Promise<{
    items: IMediaDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const isAdmin =
      requestingUserRole === UserRole.ADMIN || requestingUserRole === UserRole.SUPER_ADMIN;

    if (isAdmin) {
      return mediaRepository.findAllPaginated(page, limit, {
        context: query.context,
        mediaType: query.mediaType,
        verificationStatus: query.verificationStatus,
      });
    }

    // Regular users see only their own media
    const filterOptions: MediaListOptions = {
      context: query.context,
      mediaType: query.mediaType,
      verificationStatus: query.verificationStatus,
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit,
    };

    const [items, total] = await Promise.all([
      mediaRepository.findByUploadedBy(requestingUserId, filterOptions),
      mediaRepository.countByUploadedBy(requestingUserId, filterOptions),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async deleteMedia(id: string, requestingUserId: string, requestingUserRole: UserRole): Promise<void> {
    const media = await mediaRepository.findById(id);
    if (!media) throw ApiError.notFound('Media not found');

    const isAdmin =
      requestingUserRole === UserRole.ADMIN || requestingUserRole === UserRole.SUPER_ADMIN;
    const isOwner = media.uploadedBy.toString() === requestingUserId;

    if (!isAdmin && !isOwner) {
      throw ApiError.forbidden('You do not have permission to delete this media');
    }

    // Delete from cloud storage if applicable
    if (media.storageProvider === StorageProvider.CLOUDINARY && media.publicId) {
      const resourceType = media.mediaType === MediaType.IMAGE ? 'image' : 'raw';
      await cloudinaryService.deleteResource(media.publicId, resourceType);
    }

    // Delete local file if applicable
    if (media.storageProvider === StorageProvider.LOCAL && media.localPath) {
      try {
        const fullPath = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, media.localPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (err) {
        logger.warn('Failed to delete local media file', { localPath: media.localPath, err });
      }
    }

    // Soft-delete record
    await mediaRepository.softDeleteById(id);

    logger.info('Media deleted', { mediaId: id, userId: requestingUserId });
  }

  // ── Replace ─────────────────────────────────────────────────────────────────

  async replaceMedia(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
    newFile: Express.Multer.File,
  ): Promise<IMediaDocument> {
    // Fetch context before deleting (soft-delete keeps the record)
    const oldMedia = await mediaRepository.findByIdIncludeDeleted(id);
    const context = (oldMedia?.context as MediaContext) ?? MediaContext.OTHER;

    // Delete old record (cloud + DB)
    await this.deleteMedia(id, requestingUserId, requestingUserRole);

    // Upload new file with the same context
    return this.uploadMedia({ userId: requestingUserId, file: newFile, context });
  }

  // ── Signed URL ──────────────────────────────────────────────────────────────

  async getSignedUrl(
    id: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const media = await this.getMedia(id, requestingUserId, requestingUserRole);

    if (media.storageProvider !== StorageProvider.CLOUDINARY || !media.publicId) {
      return media.url; // local or placeholder URL, return as-is
    }

    return cloudinaryService.generateSignedUrl(media.publicId, expiresInSeconds);
  }
}

export const mediaService = new MediaService();
