import { Router } from 'express';
import { referralController } from '../controllers/referral.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { applyReferralSchema, referralQuerySchema } from '../validators/referral.validator.js';

const router = Router();

router.use(authenticate);

router.post('/generate', referralController.generateCode);
router.get('/', validate(referralQuerySchema, 'query'), referralController.getReferrals);
router.post('/apply', validate(applyReferralSchema), referralController.applyReferral);

export default router;
