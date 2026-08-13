import { BaseRepository } from '../../../repositories/base.repository.js';
import { GlobalSettings, type IGlobalSettingsDocument } from '../../../models/globalSetting.model.js';

export class SettingsRepository extends BaseRepository<IGlobalSettingsDocument> {
  constructor() {
    super(GlobalSettings);
  }

  async getSettings(): Promise<IGlobalSettingsDocument> {
    let settings = await this.model.findOne({ isDeleted: { $ne: true } });
    if (!settings) {
      settings = await this.model.create({
        general: {
          appName: 'Maid & Cook Service Platform',
          companyName: 'MaidProject Inc.',
          supportEmail: 'support@maidproject.com',
          supportPhone: '+91 9999999999',
          defaultLanguage: 'en',
          timezone: 'Asia/Kolkata',
        },
        booking: {
          bookingRadiusKm: 15,
          cancellationTimeHours: 2,
          rescheduleLimit: 3,
          autoAssignProvider: false,
          bookingExpiryMinutes: 30,
        },
        payment: {
          platformCommissionPercentage: 10,
          gstPercentage: 5,
          currency: 'INR',
          walletEnabled: true,
          codEnabled: true,
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          whatsappEnabled: true,
        },
        security: {
          jwtExpiry: '1d',
          refreshTokenExpiry: '7d',
          otpExpiryMinutes: 10,
          maxLoginAttempts: 5,
        },
        maintenance: {
          maintenanceMode: false,
          maintenanceMessage: 'System under scheduled maintenance. Please check back soon.',
        },
        socialLinks: {},
      });
    }
    return settings;
  }

  async updateSettings(updateData: Partial<IGlobalSettingsDocument>): Promise<IGlobalSettingsDocument> {
    let settings = await this.getSettings();

    if (updateData.general) settings.general = { ...settings.general, ...updateData.general };
    if (updateData.booking) settings.booking = { ...settings.booking, ...updateData.booking };
    if (updateData.payment) settings.payment = { ...settings.payment, ...updateData.payment };
    if (updateData.notifications) settings.notifications = { ...settings.notifications, ...updateData.notifications };
    if (updateData.security) settings.security = { ...settings.security, ...updateData.security };
    if (updateData.maintenance) settings.maintenance = { ...settings.maintenance, ...updateData.maintenance };
    if (updateData.socialLinks) settings.socialLinks = { ...settings.socialLinks, ...updateData.socialLinks };

    await settings.save();
    return settings;
  }
}

export const settingsRepository = new SettingsRepository();
