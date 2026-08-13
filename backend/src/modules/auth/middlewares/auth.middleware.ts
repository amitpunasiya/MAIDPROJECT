import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { UserRole } from '../../../types/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing');
    }

    const payload = tokenService.verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account is inactive or no longer exists');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (...allowedRoles: (UserRole | string)[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    const userRole = req.user.role;

    const isAllowed = allowedRoles.some((role) => {
      if (userRole === UserRole.SUPER_ADMIN) {
        return true;
      }
      if (role === 'provider' || role === UserRole.PROVIDER) {
        return (
          userRole === UserRole.PROVIDER ||
          userRole === UserRole.COOK ||
          userRole === UserRole.MAID
        );
      }
      return userRole === role;
    });

    if (!isAllowed) {
      next(ApiError.forbidden('Forbidden: insufficient permissions for this resource'));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles(UserRole.ADMIN);
export const requireCustomer = requireRoles(UserRole.CUSTOMER);
export const requireProvider = requireRoles('provider');
