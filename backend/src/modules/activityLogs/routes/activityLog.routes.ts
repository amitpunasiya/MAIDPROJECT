import { Router } from 'express';
import { activityLogController } from '../controllers/activityLog.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', activityLogController.getLogs);

export default router;
