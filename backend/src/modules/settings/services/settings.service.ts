import { settingsRepository } from '../repositories/settings.repository.js';
import { activityLogService } from '../../activityLogs/services/activityLog.service.js';
import { logger } from '../../../utils/logger.js';
import type { UpdateGlobalSettingsInput } from '../validators/settings.validator.js';

export class SettingsService {
  async getSettings() {
    return settingsRepository.getSettings();
  }

  async updateSettings(input: UpdateGlobalSettingsInput, adminUserId: string) {
    const updatedSettings = await settingsRepository.updateSettings(input as any);

    void activityLogService.log({
      userId: adminUserId,
      userRole: 'admin',
      action: 'GLOBAL_SETTINGS_UPDATED',
      module: 'settings',
      details: input as Record<string, unknown>,
    });

    logger.info('Global Platform Settings updated', { adminUserId });
    return updatedSettings;
  }
}

export const settingsService = new SettingsService();
