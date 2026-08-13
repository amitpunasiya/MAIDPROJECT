import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
  couponQuerySchema,
} from '../validators/coupon.validator.js';

const router = Router();

// Customer / Public Endpoints
router.get('/active', couponController.getActiveCoupons);
router.post('/apply', validate(applyCouponSchema), couponController.applyCoupon);

// Admin Only Endpoints
router.use(authenticate);
router.use(requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', validate(couponQuerySchema, 'query'), couponController.getAllCoupons);
router.post('/', validate(createCouponSchema), couponController.createCoupon);
router.put('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.patch('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.patch('/:id/status', couponController.toggleStatus);

export default router;
