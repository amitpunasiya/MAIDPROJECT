import { activityLogRepository } from '../repositories/activityLog.repository.js';
import type { LogActivityDTO, ActivityFilterDTO } from '../interfaces/activityLog.interface.js';
import type { Types } from 'mongoose';

export class ActivityLogService {
  async log(input: LogActivityDTO) {
    return activityLogRepository.create({
      userId: input.userId ? (input.userId as unknown as Types.ObjectId) : undefined,
      userRole: input.userRole ?? 'system',
      action: input.action,
      module: input.module,
      entityId: input.entityId,
      details: input.details ?? {},
      ipAddress: input.ipAddress ?? '',
      userAgent: input.userAgent ?? '',
    });
  }

  async getLogs(filter: ActivityFilterDTO) {
    return activityLogRepository.findWithFilters(filter);
  }
}

export const activityLogService = new ActivityLogService();
