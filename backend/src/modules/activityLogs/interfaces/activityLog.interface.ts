import type { IActivityLogDocument } from '../../../models/activityLog.model.js';

export interface LogActivityDTO {
  userId?: string;
  userRole?: string;
  action: string;
  module: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityFilterDTO {
  userId?: string;
  module?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export type { IActivityLogDocument };
