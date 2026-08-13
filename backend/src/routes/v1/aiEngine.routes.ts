import { Router } from 'express';
import { aiEngineController } from '../../controllers/aiEngine.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';

const router = Router();

router.get('/recommendations', aiEngineController.getServiceRecommendations);
router.post('/price-suggestion', aiEngineController.suggestPrice);
router.post('/assistant-chat', aiEngineController.assistantChat);

router.use(authenticate);
router.post('/detect-fraud', aiEngineController.detectFraud);
router.get('/predict-demand', aiEngineController.predictDemand);
router.post('/analyze-complaint', aiEngineController.analyzeComplaint);

export default router;
