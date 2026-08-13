import { Router } from 'express';
import { documentController } from '../../controllers/document.controller.js';
import { authenticate } from '../../modules/auth/middlewares/auth.middleware.js';
import { uploadSingleDocument } from '../../middleware/upload/upload.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/upload', uploadSingleDocument('file'), documentController.uploadDocument);
router.put('/verify', documentController.verifyDocument);

export default router;
