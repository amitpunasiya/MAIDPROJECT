import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { authRateLimiter } from '../../../middleware/rateLimiter.js';
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
  updateProfileSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.use(authRateLimiter);

// Public Auth Endpoints
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/login/customer', validate(loginSchema), authController.loginCustomer);
router.post('/login/cook', validate(loginSchema), authController.loginCook);
router.post('/login/maid', validate(loginSchema), authController.loginMaid);
router.post('/login/admin', validate(loginSchema), authController.loginAdmin);
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/google-login', authController.googleLogin);
router.post('/phone-login', authController.phoneLogin);

// Refresh Token Endpoints (supports both /refresh and /refresh-token)
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Logout & Password Recovery
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Email Verification (Placeholders)
router.post('/send-email-verification', validate(sendEmailVerificationSchema), authController.sendEmailVerification);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// Authenticated User Endpoints
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
