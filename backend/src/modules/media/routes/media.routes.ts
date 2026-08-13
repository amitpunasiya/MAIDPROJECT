import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';
import { uploadMedia } from '../../../middleware/upload/upload.middleware.js';

const router = Router();

// All media routes require authentication
router.use(authenticate);

/**
 * POST /media/upload
 * Upload a new media file (image or document).
 * Body: multipart/form-data — field `file` + field `context`
 */
router.post('/upload', uploadMedia('file', 'any'), mediaController.upload);

/**
 * GET /media/list
 * Paginated list of media files for the authenticated user.
 * Admins see all; regular users see only their own.
 * Query: page, limit, context, mediaType, verificationStatus
 */
router.get('/list', mediaController.list);

/**
 * GET /media/:id
 * Fetch a single media record by ID.
 */
router.get('/:id', mediaController.getById);

/**
 * GET /media/:id/signed-url
 * Generate a signed (time-limited) URL for a media record.
 * Query: expiresIn (seconds, default 3600)
 */
router.get('/:id/signed-url', mediaController.getSignedUrl);

/**
 * DELETE /media/:id
 * Soft-delete a media record and remove from cloud storage.
 */
router.delete('/:id', mediaController.delete);

/**
 * PUT /media/:id/replace
 * Replace an existing media file with a new upload.
 * Body: multipart/form-data — field `file`
 */
router.put('/:id/replace', uploadMedia('file', 'any'), mediaController.replace);

export default router;
