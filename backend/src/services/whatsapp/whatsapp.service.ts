import { logger } from '../../utils/logger.js';

export class WhatsappService {
  async sendBookingNotification(phone: string, bookingNumber: string, status: string): Promise<boolean> {
    logger.info('WhatsApp message dispatch placeholder', {
      phone,
      bookingNumber,
      status,
      type: 'BOOKING_UPDATE',
    });
    return true;
  }

  async sendProviderAlert(phone: string, message: string): Promise<boolean> {
    logger.info('WhatsApp provider alert dispatch placeholder', {
      phone,
      message,
      type: 'PROVIDER_ALERT',
    });
    return true;
  }

  async sendAdminAlert(message: string): Promise<boolean> {
    logger.info('WhatsApp admin alert dispatch placeholder', {
      message,
      type: 'ADMIN_ALERT',
    });
    return true;
  }
}

export const whatsappService = new WhatsappService();
