import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
  resourceType?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Array<Record<string, unknown>>;
  publicId?: string;
  overwrite?: boolean;
  eager?: Array<Record<string, unknown>>;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const isConfigured = (): boolean =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (isConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CloudinaryService {
  // ── Core upload ─────────────────────────────────────────────────────────────

  async uploadImage(
    fileBuffer: Buffer,
    folder = 'avatars',
  ): Promise<{ url: string; publicId: string }> {
    if (!isConfigured()) {
      logger.warn('Cloudinary credentials missing, returning placeholder image URL');
      return {
        url: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
        publicId: 'sample',
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error('Cloudinary upload error', { error });
            return reject(ApiError.internal('Image upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(fileBuffer);
    });
  }

  async uploadGallery(
    fileBuffers: Buffer[],
    folder = 'gallery',
  ): Promise<{ url: string; publicId: string }[]> {
    return Promise.all(fileBuffers.map((buf) => this.uploadImage(buf, folder)));
  }

  async uploadDocument(
    fileBuffer: Buffer,
    folder = 'documents',
  ): Promise<{ url: string; publicId: string }> {
    if (!isConfigured()) {
      return {
        url: `https://res.cloudinary.com/demo/image/upload/sample_doc.pdf`,
        publicId: 'sample_doc',
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error('Cloudinary document upload error', { error });
            return reject(ApiError.internal('Document upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!isConfigured()) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.warn('Failed to delete image from Cloudinary', { publicId, error });
    }
  }

  // ── Extended upload with full metadata ──────────────────────────────────────

  async uploadMediaWithOptions(
    fileBuffer: Buffer,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    if (!isConfigured()) {
      logger.warn('Cloudinary not configured — returning placeholder result');
      return {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: `demo/${Date.now()}`,
        width: 800,
        height: 600,
        format: 'jpg',
        sizeBytes: fileBuffer.length,
      };
    }

    const uploadOptions = {
      folder: options.folder ?? 'media',
      resource_type: (options.resourceType ?? 'auto') as 'image' | 'video' | 'raw' | 'auto',
      overwrite: options.overwrite ?? false,
      ...(options.transformation && { transformation: options.transformation }),
      ...(options.publicId && { public_id: options.publicId }),
      ...(options.eager && { eager: options.eager }),
    };

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error('Cloudinary uploadMediaWithOptions error', { error });
            return reject(ApiError.internal('Media upload to Cloudinary failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            sizeBytes: result.bytes,
            resourceType: result.resource_type,
          });
        },
      );
      stream.end(fileBuffer);
    });
  }

  // ── Signed URL ───────────────────────────────────────────────────────────────

  generateSignedUrl(publicId: string, expiresInSeconds = 3600): string {
    if (!isConfigured()) {
      logger.warn('Cloudinary not configured — cannot generate signed URL');
      return `https://res.cloudinary.com/demo/image/upload/${publicId}`;
    }

    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      type: 'authenticated',
    });
  }

  // ── Delete unified resource ──────────────────────────────────────────────────

  async deleteResource(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image',
  ): Promise<void> {
    if (!isConfigured() || !publicId) return;
    try {
      const type = resourceType === 'auto' ? 'raw' : resourceType;
      await cloudinary.uploader.destroy(publicId, { resource_type: type });
      logger.info('Cloudinary resource deleted', { publicId, resourceType });
    } catch (error) {
      logger.warn('Failed to delete resource from Cloudinary', { publicId, error });
    }
  }
}

export const cloudinaryService = new CloudinaryService();
