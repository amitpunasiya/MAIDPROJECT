import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../types/auth.types.js';
import { requireRoles, requireAdmin, requireCustomer, requireProvider } from '../../modules/auth/middlewares/auth.middleware.js';

export const authorize =
  (...allowedRoles: (UserRole | string)[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    return requireRoles(...allowedRoles)(req, res, next);
  };

export const authorizeAdmin = requireAdmin;
export const authorizeCustomer = requireCustomer;
export const authorizeProvider = requireProvider;
export const authorizeCook = requireRoles(UserRole.COOK, UserRole.ADMIN, UserRole.PROVIDER);
export const authorizeMaid = requireRoles(UserRole.MAID, UserRole.ADMIN, UserRole.PROVIDER);

export { requireRoles, requireAdmin, requireCustomer, requireProvider };

