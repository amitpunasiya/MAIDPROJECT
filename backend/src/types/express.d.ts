import type { UserRole } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      /** UUID assigned by requestIdMiddleware; echoed in X-Request-ID response header */
      requestId?: string;
    }
  }
}

export {};
