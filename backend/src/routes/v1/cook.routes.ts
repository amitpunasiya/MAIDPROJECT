import { Router } from 'express';
import { cookController } from '../../controllers/cook.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';
import { authorizeCook } from '../../middleware/auth/authorize.js';
import { validate } from '../../middleware/validation/validate.js';
import {
  updateCookProfileSchema,
  toggleAvailabilitySchema,
} from '../../validators/cook.validator.js';

const router = Router();

// Public routes
router.get('/', cookController.getCooks);
router.get('/:id', cookController.getCookById);

// Protected routes (Cook / Admin only)
router.get('/me', authenticate, authorizeCook, cookController.getMyProfile);
router.patch(
  '/me',
  authenticate,
  authorizeCook,
  validate(updateCookProfileSchema),
  cookController.updateMyProfile,
);
router.patch(
  '/me/availability',
  authenticate,
  authorizeCook,
  validate(toggleAvailabilitySchema),
  cookController.toggleAvailability,
);

export default router;
