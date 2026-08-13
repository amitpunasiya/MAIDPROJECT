import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import {
  createOrderSchema,
  createPaymentIntentSchema,
  verifyPaymentSchema,
  confirmCodSchema,
  refundPaymentSchema,
  paymentFilterSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.use(authenticate);

// Order Creation Endpoints
router.post('/create-order', validate(createOrderSchema), paymentController.createOrder);
router.post('/create-intent', validate(createPaymentIntentSchema), paymentController.createIntent);

// Verification & Refund Endpoints
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);
router.post('/cod-confirm', validate(confirmCodSchema), paymentController.confirmCod);
router.post('/refund', validate(refundPaymentSchema), paymentController.refundPayment);

// History & Details Endpoints
router.get('/history', validate(paymentFilterSchema, 'query'), paymentController.getHistory);
router.get('/:id', paymentController.getById);

export default router;
