import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { notificationQuerySchema } from '../validators/notification.validator.js';

const router = Router();

router.use(authenticate);

// List & Filter Notifications
router.get('/', validate(notificationQuerySchema, 'query'), notificationController.getNotifications);
router.get('/unread', notificationController.getUnread);

// Mark Read Endpoints
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

// Delete & Clear Endpoints
router.delete('/clear', notificationController.clearNotifications);
router.delete('/:id', notificationController.deleteNotification);

export default router;
