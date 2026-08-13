import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import { updateGlobalSettingsSchema } from '../validators/settings.validator.js';

const router = Router();

// Public Read Access for App Config
router.get('/', settingsController.getSettings);

// Admin / Super Admin Authorization Guard for Settings Updates
router.use(authenticate);
router.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.put('/', validate(updateGlobalSettingsSchema), settingsController.updateSettings);
router.patch('/', validate(updateGlobalSettingsSchema), settingsController.updateSettings);

export default router;
