import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/messages', chatController.sendMessage);
router.get('/conversations/:userId', chatController.getConversation);
router.get('/booking/:bookingId', chatController.getBookingMessages);
router.post('/booking/:bookingId', chatController.sendBookingMessage);

export default router;
