import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
});

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
    path: '/api/v1/auth',
  });
};

export const extractRefreshToken = (
  cookies: Record<string, string | undefined>,
  bodyToken?: string,
): string | undefined => {
  return cookies[env.REFRESH_TOKEN_COOKIE_NAME] ?? bodyToken;
};
