import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';
import { validate } from '../../middleware/validation/validate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sendEmailVerificationSchema,
  verifyEmailSchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.use(authRateLimiter);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validate(refreshTokenSchema), authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Authenticated auth routes
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/send-email-verification', validate(sendEmailVerificationSchema), authController.sendEmailVerification);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

export default router;
