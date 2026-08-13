import { Router } from 'express';
import { maidController } from '../../controllers/maid.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';
import { authorizeMaid } from '../../middleware/auth/authorize.js';
import { validate } from '../../middleware/validation/validate.js';
import {
  updateMaidProfileSchema,
  toggleMaidAvailabilitySchema,
} from '../../validators/maid.validator.js';

const router = Router();

// Public routes
router.get('/', maidController.getMaids);
router.get('/:id', maidController.getMaidById);

// Protected routes (Maid / Admin only)
router.get('/me', authenticate, authorizeMaid, maidController.getMyProfile);
router.patch(
  '/me',
  authenticate,
  authorizeMaid,
  validate(updateMaidProfileSchema),
  maidController.updateMyProfile,
);
router.patch(
  '/me/availability',
  authenticate,
  authorizeMaid,
  validate(toggleMaidAvailabilitySchema),
  maidController.toggleAvailability,
);

export default router;
