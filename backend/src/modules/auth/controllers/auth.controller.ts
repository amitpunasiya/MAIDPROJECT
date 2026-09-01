import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  SendEmailVerificationInput,
  VerifyEmailInput,
  UpdateProfileInput,
} from '../validators/auth.validator.js';

const getRequestMeta = (req: Request) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip || req.socket.remoteAddress,
});

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const meta = getRequestMeta(req);
    const result = await authService.register(input, meta);

    // Set refresh token cookie if applicable
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.created(res, 'User registered successfully', responseData);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const meta = getRequestMeta(req);
    const result = await authService.login(input, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Login successful', responseData);
  });

  loginCustomer = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const meta = getRequestMeta(req);
    const result = await authService.loginCustomer(input, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Customer login successful', responseData);
  });

  loginCook = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const meta = getRequestMeta(req);
    const result = await authService.loginCook(input, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Cook login successful', responseData);
  });

  loginMaid = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const meta = getRequestMeta(req);
    const result = await authService.loginMaid(input, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Maid login successful', responseData);
  });

  loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const meta = getRequestMeta(req);
    const result = await authService.loginAdmin(input, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Admin login successful', responseData);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = (req.body?.refreshToken || req.cookies?.refreshToken) as string | undefined;
    const meta = getRequestMeta(req);

    await authService.logout(refreshToken || '', req.user?.id, meta);

    res.clearCookie('refreshToken');
    return ApiResponse.ok(res, 'Logged out successfully');
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const meta = getRequestMeta(req);
    await authService.logoutAll(req.user.id, meta);

    res.clearCookie('refreshToken');
    return ApiResponse.ok(res, 'Logged out from all devices successfully');
  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body as { idToken: string };
    const meta = getRequestMeta(req);
    const result = await authService.googleLogin(idToken, meta);

    return ApiResponse.ok(res, 'Google login successful', result);
  });

  phoneLogin = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body as { phone: string };
    const meta = getRequestMeta(req);
    const result = await authService.phoneLogin(phone, meta);

    return ApiResponse.ok(res, 'Phone login successful', result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = (req.body?.refreshToken || req.cookies?.refreshToken) as string | undefined;
    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const meta = getRequestMeta(req);
    const result = await authService.refreshToken(token, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Token refreshed successfully', responseData);
  });

  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body as { phone: string };
    const result = await authService.sendOtp(phone);
    return ApiResponse.ok(res, result.message, { phone: result.phone });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { idToken, phone } = req.body as { idToken: string; phone: string };
    const meta = getRequestMeta(req);
    const result = await authService.verifyOtp(idToken, phone, meta);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'OTP verification and login successful', responseData);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ForgotPasswordInput;
    const result = await authService.forgotPassword(input);
    return ApiResponse.ok(res, result.message, result.resetToken ? { resetToken: result.resetToken } : undefined);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ResetPasswordInput;
    const result = await authService.resetPassword(input);
    return ApiResponse.ok(res, result.message);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as ChangePasswordInput;
    const result = await authService.changePassword(req.user.id, input);
    return ApiResponse.ok(res, result.message);
  });

  sendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as SendEmailVerificationInput;
    const result = await authService.sendEmailVerification(req.user?.id, input);
    return ApiResponse.ok(res, result.message, result.verificationToken ? { verificationToken: result.verificationToken } : undefined);
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as VerifyEmailInput;
    const result = await authService.verifyEmail(input);
    return ApiResponse.ok(res, result.message);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await authService.getProfile(req.user.id);
    return ApiResponse.ok(res, 'Profile retrieved successfully', { user });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as UpdateProfileInput;
    const user = await authService.updateProfile(req.user.id, input);
    return ApiResponse.ok(res, 'Profile updated successfully', { user });
  });

  becomeProvider = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const { services, experienceYears, bio, hourlyRate } = req.body;
    const meta = getRequestMeta(req);
    const result = await authService.becomeProvider(
      req.user.id,
      services,
      { experienceYears, bio, hourlyRate },
      meta,
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = authService.formatAuthResponse(result);
    return ApiResponse.ok(res, 'Successfully upgraded to Provider role', responseData);
  });
}

export const authController = new AuthController();
