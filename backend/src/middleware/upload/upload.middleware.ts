import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { ApiError } from '../../utils/ApiError.js';

// ─── Allowed MIME types ───────────────────────────────────────────────────────

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const ALLOWED_ALL_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES];

// ─── File size limits ─────────────────────────────────────────────────────────

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MEDIA_MAX_SIZE = 10 * 1024 * 1024; // 10 MB (generous for unified handler)

// ─── Storage (memory — buffers passed to sharp / cloudinary) ──────────────────

const memStorage = multer.memoryStorage();

// ─── Image-only upload (existing, preserved) ─────────────────────────────────

export const uploadSingleImage = (fieldName = 'avatar') => {
  const upload = multer({
    storage: memStorage,
    limits: { fileSize: IMAGE_MAX_SIZE },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        cb(ApiError.badRequest('Only JPG, PNG, and WebP image files are allowed'));
        return;
      }
      cb(null, true);
    },
  });
  return upload.single(fieldName);
};

// ─── Document upload (existing, preserved) ────────────────────────────────────

export const uploadSingleDocument = (fieldName = 'document') => {
  const upload = multer({
    storage: memStorage,
    limits: { fileSize: DOCUMENT_MAX_SIZE },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const isAllowed = ALLOWED_ALL_MIMES.includes(file.mimetype);
      if (!isAllowed) {
        cb(ApiError.badRequest('Only PDF, Word (.doc/.docx), and Image documents are allowed'));
        return;
      }
      cb(null, true);
    },
  });
  return upload.single(fieldName);
};

// ─── Unified media upload (new) ───────────────────────────────────────────────

/**
 * Accepts images (jpg/png/webp) OR documents (pdf/doc/docx).
 * Pass `mediaType = 'image'` to restrict to images only,
 * `mediaType = 'document'` for documents only, or omit for both.
 */
export const uploadMedia = (
  fieldName = 'file',
  mediaType: 'image' | 'document' | 'any' = 'any',
) => {
  const allowedMimes =
    mediaType === 'image'
      ? ALLOWED_IMAGE_MIMES
      : mediaType === 'document'
        ? ALLOWED_DOCUMENT_MIMES
        : ALLOWED_ALL_MIMES;

  const upload = multer({
    storage: memStorage,
    limits: { fileSize: MEDIA_MAX_SIZE },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!allowedMimes.includes(file.mimetype)) {
        const hint =
          mediaType === 'image'
            ? 'JPG, PNG, WebP'
            : mediaType === 'document'
              ? 'PDF, DOC, DOCX'
              : 'JPG, PNG, WebP, PDF, DOC, DOCX';
        cb(ApiError.badRequest(`Invalid file type. Allowed formats: ${hint}`));
        return;
      }
      cb(null, true);
    },
  });
  return upload.single(fieldName);
};

/**
 * Multiple file upload for gallery / batch operations.
 */
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  const upload = multer({
    storage: memStorage,
    limits: { fileSize: IMAGE_MAX_SIZE },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        cb(ApiError.badRequest('Only JPG, PNG, and WebP images are allowed for batch upload'));
        return;
      }
      cb(null, true);
    },
  });
  return upload.array(fieldName, maxCount);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isImageMime = (mime: string): boolean => ALLOWED_IMAGE_MIMES.includes(mime);
export const isDocumentMime = (mime: string): boolean => ALLOWED_DOCUMENT_MIMES.includes(mime);
