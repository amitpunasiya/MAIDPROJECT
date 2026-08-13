import { Router } from 'express';
import { saasController } from '../controllers/saas.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';

const router = Router();

// Public Plan & City Branch routes
router.get('/plans', saasController.getPlans);
router.get('/branches/city/:city', saasController.getCityBranches);

// Provider Authenticated Branch management routes
router.post('/branches', authenticate, saasController.createBranch);
router.get('/branches/my', authenticate, saasController.getProviderBranches);

// Admin Plan Management
router.post('/plans', authenticate, saasController.createPlan);

export default router;
