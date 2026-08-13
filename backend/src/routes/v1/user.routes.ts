import { Router } from 'express';
import { userController } from '../../controllers/user.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';
import { validate } from '../../middleware/validation/validate.js';
import { uploadSingleImage } from '../../middleware/upload/upload.middleware.js';
import { updateProfileSchema } from '../../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/avatar', uploadSingleImage('avatar'), userController.uploadAvatar);
router.post('/profile/avatar', uploadSingleImage('avatar'), userController.uploadAvatar);

export default router;
