import { Router } from 'express';
import { reviewController } from '../../controllers/review.controller.js';
import { authenticate } from '../../modules/auth/middlewares/auth.middleware.js';

const router = Router();

router.get('/cook/:cookId', reviewController.getCookReviews);

router.use(authenticate);
router.post('/', reviewController.createReview);

export default router;
