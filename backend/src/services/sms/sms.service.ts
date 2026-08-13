import { logger } from '../../utils/logger.js';

// ─── SMS Templates ────────────────────────────────────────────────────────────

const SMS_TEMPLATES = {
  OTP: (otp: string, expiryMinutes = 10) =>
    `${otp} is your MaidProject verification code. Valid for ${expiryMinutes} min. Do NOT share this code with anyone. -MaidProject`,

  BOOKING_CONFIRMED: (bookingNumber: string, serviceName: string, date: string) =>
    `Booking #${bookingNumber} CONFIRMED! Service: ${serviceName} on ${date}. Track in app. -MaidProject`,

  BOOKING_ASSIGNED: (bookingNumber: string, providerName: string) =>
    `Good news! ${providerName} has been assigned to your Booking #${bookingNumber}. They will arrive shortly. -MaidProject`,

  BOOKING_CANCELLED: (bookingNumber: string) =>
    `Your Booking #${bookingNumber} has been cancelled. For help call: ${process.env.SUPPORT_PHONE ?? '+91 9999999999'}. -MaidProject`,

  BOOKING_COMPLETED: (bookingNumber: string) =>
    `Booking #${bookingNumber} is complete! Rate your experience in the app. Thank you for choosing MaidProject!`,

  BOOKING_REMINDER: (bookingNumber: string, serviceName: string, timeLeft: string) =>
    `Reminder: Your booking #${bookingNumber} for ${serviceName} is in ${timeLeft}. Please be available. -MaidProject`,

  PROVIDER_ASSIGNED: (bookingNumber: string, customerAddress: string) =>
    `New job assigned! Booking #${bookingNumber}. Customer address: ${customerAddress}. Open app for details. -MaidProject`,

  WALLET_CREDITED: (amount: number, balance: number) =>
    `₹${amount} credited to your MaidProject wallet. New balance: ₹${balance}. -MaidProject`,
};

// ─── SMS Provider Interface ───────────────────────────────────────────────────

interface SmsProvider {
  send(phone: string, message: string): Promise<boolean>;
}

// ─── Mock / Development SMS Provider ─────────────────────────────────────────
// Swap this class implementation with a real provider (Twilio, MSG91, Fast2SMS, etc.)

class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    logger.info('[SMS LOG — Development Mode]', { phone, message });
    return true;
  }
}

// Production example stub — connect MSG91 / Twilio by filling credentials in .env
class ProductionSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    // Example: MSG91 API
    // const response = await fetch(`https://api.msg91.com/api/sendhttp.php?...`);
    // Example: Twilio
    // await twilioClient.messages.create({ to: phone, from: process.env.TWILIO_FROM, body: message });
    logger.info('Production SMS dispatch placeholder', { phone, messageLength: message.length });
    return true;
  }
}

// ─── SMS Service ──────────────────────────────────────────────────────────────

export class SmsService {
  private provider: SmsProvider;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' && !!process.env.SMS_PROVIDER_KEY;
    this.provider = this.isProduction ? new ProductionSmsProvider() : new ConsoleSmsProvider();

    logger.info(`SmsService initialized in ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  }

  // ── Core Send ────────────────────────────────────────────────────────────

  async sendSms(phone: string, message: string): Promise<boolean> {
    const normalised = this.normalisePhone(phone);
    if (!normalised) {
      logger.warn('SMS skipped: invalid phone number', { phone });
      return false;
    }

    try {
      const result = await this.provider.send(normalised, message);
      if (result) {
        logger.info('SMS dispatched', { phone: normalised, messageLength: message.length });
      }
      return result;
    } catch (error) {
      logger.error('SMS dispatch failed', { error, phone: normalised });
      return false;
    }
  }

  // ── Template Methods ─────────────────────────────────────────────────────

  async sendOtpSms(phone: string, otp: string, expiryMinutes = 10): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.OTP(otp, expiryMinutes));
  }

  async sendBookingConfirmed(phone: string, bookingNumber: string, serviceName: string, date: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.BOOKING_CONFIRMED(bookingNumber, serviceName, date));
  }

  async sendBookingAssigned(phone: string, bookingNumber: string, providerName: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.BOOKING_ASSIGNED(bookingNumber, providerName));
  }

  async sendBookingCancelled(phone: string, bookingNumber: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.BOOKING_CANCELLED(bookingNumber));
  }

  async sendBookingCompleted(phone: string, bookingNumber: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.BOOKING_COMPLETED(bookingNumber));
  }

  async sendBookingReminder(phone: string, bookingNumber: string, serviceName: string, timeLeft: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.BOOKING_REMINDER(bookingNumber, serviceName, timeLeft));
  }

  async sendProviderAssigned(phone: string, bookingNumber: string, customerAddress: string): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.PROVIDER_ASSIGNED(bookingNumber, customerAddress));
  }

  async sendWalletCredited(phone: string, amount: number, balance: number): Promise<boolean> {
    return this.sendSms(phone, SMS_TEMPLATES.WALLET_CREDITED(amount, balance));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private normalisePhone(phone: string): string | null {
    // Strip all non-digit chars except leading +
    const cleaned = phone.trim().replace(/[\s\-().]/g, '');
    // Must be 10+ digits (with optional leading +91 or similar)
    if (/^\+?\d{10,15}$/.test(cleaned)) {
      return cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0/, '')}`;
    }
    return null;
  }
}

export const smsService = new SmsService();
export { SMS_TEMPLATES };
