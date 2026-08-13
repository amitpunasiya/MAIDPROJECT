import type { Request } from 'express';

export const getRequestMeta = (req: Request) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});
