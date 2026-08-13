import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

// ─── OTP Store Entry ──────────────────────────────────────────────────────────

interface OtpEntry {
  hashedOtp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  purpose: OtpPurpose;
}

export type OtpPurpose =
  | 'login'
  | 'register'
  | 'phone_verify'
  | 'password_reset'
  | 'email_verify'
  | 'booking_confirm';

// ─── Config Defaults ──────────────────────────────────────────────────────────

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const BCRYPT_ROUNDS = 8; // lighter than password hash — OTP is short-lived

// ─── In-Memory Store (Replace with Redis in production) ──────────────────────
// Key: `${identifier}:${purpose}` where identifier = email or phone

const otpStore = new Map<string, OtpEntry>();

// Periodic cleanup of expired entries (runs every 5 minutes)
setInterval(() => {
  const now = new Date();
  for (const [key, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── OTP Service ──────────────────────────────────────────────────────────────

export class OtpService {
  // ── Generate & Store OTP ──────────────────────────────────────────────────

  async generateOtp(
    identifier: string,
    purpose: OtpPurpose,
    expiryMinutes = OTP_EXPIRY_MINUTES,
  ): Promise<{ otp: string; expiresAt: Date }> {
    this.validateIdentifier(identifier);

    const key = this.makeKey(identifier, purpose);
    const existing = otpStore.get(key);

    // Enforce resend cooldown
    if (existing) {
      const secondsSinceCreated = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSinceCreated < OTP_RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        throw ApiError.tooManyRequests(`Please wait ${remaining} seconds before requesting a new OTP`);
      }
    }

    const otp = this.generateSecureOtp();
    const hashedOtp = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    otpStore.set(key, {
      hashedOtp,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
      purpose,
    });

    logger.info('OTP generated', { identifier: this.maskIdentifier(identifier), purpose, expiresAt });
    return { otp, expiresAt };
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  async verifyOtp(identifier: string, purpose: OtpPurpose, inputOtp: string): Promise<true> {
    this.validateIdentifier(identifier);
    this.validateOtpFormat(inputOtp);

    const key = this.makeKey(identifier, purpose);
    const entry = otpStore.get(key);

    if (!entry) {
      throw ApiError.badRequest('OTP not found or already used. Please request a new one');
    }

    // Check expiry
    if (entry.expiresAt < new Date()) {
      otpStore.delete(key);
      throw ApiError.badRequest('OTP has expired. Please request a new one');
    }

    // Check max attempts
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(key);
      throw ApiError.tooManyRequests('Too many incorrect OTP attempts. Please request a new OTP');
    }

    // Increment attempts before checking (prevents timing attacks)
    entry.attempts += 1;

    const isValid = await bcrypt.compare(inputOtp, entry.hashedOtp);

    if (!isValid) {
      logger.warn('OTP verification failed', {
        identifier: this.maskIdentifier(identifier),
        purpose,
        attempt: entry.attempts,
      });
      throw ApiError.badRequest(
        `Invalid OTP. ${OTP_MAX_ATTEMPTS - entry.attempts} attempt(s) remaining`,
      );
    }

    // Success — consume the OTP
    otpStore.delete(key);
    logger.info('OTP verified successfully', { identifier: this.maskIdentifier(identifier), purpose });
    return true;
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────

  async resendOtp(
    identifier: string,
    purpose: OtpPurpose,
    expiryMinutes = OTP_EXPIRY_MINUTES,
  ): Promise<{ otp: string; expiresAt: Date }> {
    // Delete any existing (generateOtp will enforce cooldown before this)
    const key = this.makeKey(identifier, purpose);
    const existing = otpStore.get(key);

    if (existing) {
      const secondsSinceCreated = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSinceCreated < OTP_RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        throw ApiError.tooManyRequests(`Please wait ${remaining} seconds before resending OTP`);
      }
      otpStore.delete(key);
    }

    return this.generateOtp(identifier, purpose, expiryMinutes);
  }

  // ── Invalidate (logout / cancel) ──────────────────────────────────────────

  invalidateOtp(identifier: string, purpose: OtpPurpose): void {
    const key = this.makeKey(identifier, purpose);
    otpStore.delete(key);
    logger.info('OTP invalidated', { identifier: this.maskIdentifier(identifier), purpose });
  }

  // ── Check If OTP Exists ───────────────────────────────────────────────────

  hasActiveOtp(identifier: string, purpose: OtpPurpose): boolean {
    const key = this.makeKey(identifier, purpose);
    const entry = otpStore.get(key);
    if (!entry) return false;
    if (entry.expiresAt < new Date()) {
      otpStore.delete(key);
      return false;
    }
    return true;
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private generateSecureOtp(): string {
    // Cryptographically secure numeric OTP
    const bytes = crypto.randomBytes(4);
    const num = bytes.readUInt32BE(0) % Math.pow(10, OTP_LENGTH);
    return String(num).padStart(OTP_LENGTH, '0');
  }

  private makeKey(identifier: string, purpose: OtpPurpose): string {
    return `${identifier.toLowerCase().trim()}:${purpose}`;
  }

  private maskIdentifier(identifier: string): string {
    if (identifier.includes('@')) {
      const [local, domain] = identifier.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return `${identifier.slice(0, 4)}****${identifier.slice(-2)}`;
  }

  private validateIdentifier(identifier: string): void {
    if (!identifier || !identifier.trim()) {
      throw ApiError.badRequest('OTP identifier (email or phone) is required');
    }
  }

  private validateOtpFormat(otp: string): void {
    if (!otp || !/^\d{4,8}$/.test(otp.trim())) {
      throw ApiError.badRequest('OTP must be a 4–8 digit numeric code');
    }
  }
}

export const otpService = new OtpService();
