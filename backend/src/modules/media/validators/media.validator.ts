import { z } from 'zod';
import { MediaContext, MediaType, MediaVerificationStatus } from '../../../models/media.model.js';

// ─── Upload validator ─────────────────────────────────────────────────────────

export const uploadMediaSchema = z.object({
  context: z
    .nativeEnum(MediaContext, {
      errorMap: () => ({
        message: `context must be one of: ${Object.values(MediaContext).join(', ')}`,
      }),
    })
    .default(MediaContext.OTHER),
});

// ─── List query validator ─────────────────────────────────────────────────────

export const listMediaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  context: z.nativeEnum(MediaContext).optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
  verificationStatus: z.nativeEnum(MediaVerificationStatus).optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type ListMediaInput = z.infer<typeof listMediaSchema>;
