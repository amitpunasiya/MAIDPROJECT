import { logger } from '../../utils/logger.js';
import { emailService } from '../email/email.service.js';
import { smsService } from '../sms/sms.service.js';
import { firebaseService } from '../firebase/firebase.service.js';

// ─── Queue Job Types ──────────────────────────────────────────────────────────

export type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp';

export type NotificationJobType =
  | 'welcome_email'
  | 'otp_email'
  | 'otp_sms'
  | 'booking_confirmed_email'
  | 'booking_confirmed_sms'
  | 'booking_assigned_sms'
  | 'booking_cancelled_email'
  | 'booking_cancelled_sms'
  | 'booking_completed_email'
  | 'booking_completed_sms'
  | 'booking_reminder_sms'
  | 'password_reset_email'
  | 'invoice_email'
  | 'push_notification'
  | 'wallet_credited_sms';

export interface NotificationJob {
  id: string;
  type: NotificationJobType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

// ─── Queue Config ─────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;       // 5 seconds base delay
const MAX_RETRY_DELAY_MS = 60_000;  // 60 seconds cap (exponential back-off)
const QUEUE_PROCESS_INTERVAL_MS = 2_000;

// ─── Notification Queue ───────────────────────────────────────────────────────

export class NotificationQueue {
  private queue: NotificationJob[] = [];
  private failedJobs: NotificationJob[] = [];
  private isProcessing = false;
  private retryTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {
    logger.info('NotificationQueue initialized (in-process queue — use BullMQ/Redis for production)');
  }

  // ── Start / Stop ──────────────────────────────────────────────────────────

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      void this.process();
    }, QUEUE_PROCESS_INTERVAL_MS);
    logger.info('NotificationQueue started', { intervalMs: QUEUE_PROCESS_INTERVAL_MS });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();
    logger.info('NotificationQueue stopped');
  }

  // ── Enqueue ───────────────────────────────────────────────────────────────

  enqueue(type: NotificationJobType, channel: NotificationChannel, payload: Record<string, unknown>): string {
    const job: NotificationJob = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      channel,
      payload,
      attempts: 0,
      maxAttempts: MAX_RETRIES,
      createdAt: new Date(),
    };
    this.queue.push(job);
    logger.debug('Notification job enqueued', { jobId: job.id, type, channel });
    return job.id;
  }

  // ── Batch Enqueue Helpers ─────────────────────────────────────────────────

  enqueueWelcomeEmail(to: string, name: string): string {
    return this.enqueue('welcome_email', 'email', { to, name });
  }

  enqueueOtpEmail(to: string, otp: string, expiryMinutes?: number): string {
    return this.enqueue('otp_email', 'email', { to, otp, expiryMinutes });
  }

  enqueueOtpSms(phone: string, otp: string, expiryMinutes?: number): string {
    return this.enqueue('otp_sms', 'sms', { phone, otp, expiryMinutes });
  }

  enqueueBookingConfirmed(
    email: string,
    phone: string,
    bookingNumber: string,
    serviceName: string,
    date: string,
    providerName?: string,
  ): void {
    this.enqueue('booking_confirmed_email', 'email', { to: email, bookingNumber, serviceName, date, providerName });
    this.enqueue('booking_confirmed_sms', 'sms', { phone, bookingNumber, serviceName, date });
  }

  enqueueBookingCancelled(email: string, phone: string, bookingNumber: string, serviceName: string, reason?: string): void {
    this.enqueue('booking_cancelled_email', 'email', { to: email, bookingNumber, serviceName, reason });
    this.enqueue('booking_cancelled_sms', 'sms', { phone, bookingNumber });
  }

  enqueueBookingCompleted(email: string, phone: string, bookingNumber: string, serviceName: string, amount: number): void {
    this.enqueue('booking_completed_email', 'email', { to: email, bookingNumber, serviceName, amount });
    this.enqueue('booking_completed_sms', 'sms', { phone, bookingNumber });
  }

  enqueueBookingReminder(phone: string, bookingNumber: string, serviceName: string, timeLeft: string): string {
    return this.enqueue('booking_reminder_sms', 'sms', { phone, bookingNumber, serviceName, timeLeft });
  }

  enqueuePasswordReset(email: string, resetToken: string, expiryMinutes?: number): string {
    return this.enqueue('password_reset_email', 'email', { to: email, resetToken, expiryMinutes });
  }

  enqueueInvoice(email: string, bookingNumber: string, invoiceHtml: string): string {
    return this.enqueue('invoice_email', 'email', { to: email, bookingNumber, invoiceHtml });
  }

  enqueuePushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>): string {
    return this.enqueue('push_notification', 'push', { fcmToken, title, body, data: data ?? {} });
  }

  enqueueWalletCreditedSms(phone: string, amount: number, balance: number): string {
    return this.enqueue('wallet_credited_sms', 'sms', { phone, amount, balance });
  }

  // ── Queue Status ──────────────────────────────────────────────────────────

  getStats() {
    return {
      pending: this.queue.length,
      failed: this.failedJobs.length,
      isProcessing: this.isProcessing,
    };
  }

  getFailedJobs(): NotificationJob[] {
    return [...this.failedJobs];
  }

  // ── Process Loop ──────────────────────────────────────────────────────────

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const batch = this.queue.splice(0, 10); // Process up to 10 jobs per tick

    await Promise.allSettled(batch.map((job) => this.executeJob(job)));

    this.isProcessing = false;
  }

  private async executeJob(job: NotificationJob): Promise<void> {
    job.attempts += 1;
    job.lastAttemptAt = new Date();

    try {
      const success = await this.dispatch(job);

      if (success) {
        logger.info('Notification job completed', { jobId: job.id, type: job.type, attempt: job.attempts });
      } else {
        throw new Error('Dispatch returned false');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      job.error = errMsg;

      logger.warn('Notification job failed', { jobId: job.id, type: job.type, attempt: job.attempts, error: errMsg });

      if (job.attempts < job.maxAttempts) {
        this.scheduleRetry(job);
      } else {
        logger.error('Notification job permanently failed after max retries', {
          jobId: job.id,
          type: job.type,
          attempts: job.attempts,
          error: errMsg,
        });
        this.failedJobs.push(job);
        // Keep last 200 failed jobs in memory
        if (this.failedJobs.length > 200) {
          this.failedJobs.shift();
        }
      }
    }
  }

  private scheduleRetry(job: NotificationJob): void {
    // Exponential back-off: 5s → 10s → 20s → ... capped at 60s
    const delay = Math.min(RETRY_DELAY_MS * Math.pow(2, job.attempts - 1), MAX_RETRY_DELAY_MS);

    logger.info('Scheduling notification retry', { jobId: job.id, type: job.type, delayMs: delay, nextAttempt: job.attempts + 1 });

    const timer = setTimeout(() => {
      this.retryTimers.delete(job.id);
      this.queue.unshift(job); // Re-queue at front for priority
    }, delay);

    this.retryTimers.set(job.id, timer);
  }

  // ── Job Dispatcher ────────────────────────────────────────────────────────

  private async dispatch(job: NotificationJob): Promise<boolean> {
    const p = job.payload;

    switch (job.type) {
      // Email jobs
      case 'welcome_email':
        return emailService.sendWelcomeEmail(String(p.to), String(p.name));

      case 'otp_email':
        return emailService.sendOtpEmail(String(p.to), String(p.otp), p.expiryMinutes ? Number(p.expiryMinutes) : undefined);

      case 'booking_confirmed_email':
        return emailService.sendBookingConfirmation(
          String(p.to),
          String(p.bookingNumber),
          String(p.date),
          String(p.serviceName),
          p.providerName ? String(p.providerName) : undefined,
        );

      case 'booking_cancelled_email':
        return emailService.sendBookingCancelled(
          String(p.to),
          String(p.bookingNumber),
          String(p.serviceName),
          p.reason ? String(p.reason) : undefined,
        );

      case 'booking_completed_email':
        return emailService.sendBookingCompleted(String(p.to), String(p.bookingNumber), String(p.serviceName), Number(p.amount));

      case 'password_reset_email':
        return emailService.sendPasswordReset(String(p.to), String(p.resetToken), p.expiryMinutes ? Number(p.expiryMinutes) : undefined);

      case 'invoice_email':
        return emailService.sendInvoiceEmail(String(p.to), String(p.bookingNumber), String(p.invoiceHtml));

      // SMS jobs
      case 'otp_sms':
        return smsService.sendOtpSms(String(p.phone), String(p.otp), p.expiryMinutes ? Number(p.expiryMinutes) : undefined);

      case 'booking_confirmed_sms':
        return smsService.sendBookingConfirmed(String(p.phone), String(p.bookingNumber), String(p.serviceName), String(p.date));

      case 'booking_assigned_sms':
        return smsService.sendBookingAssigned(String(p.phone), String(p.bookingNumber), String(p.providerName));

      case 'booking_cancelled_sms':
        return smsService.sendBookingCancelled(String(p.phone), String(p.bookingNumber));

      case 'booking_completed_sms':
        return smsService.sendBookingCompleted(String(p.phone), String(p.bookingNumber));

      case 'booking_reminder_sms':
        return smsService.sendBookingReminder(String(p.phone), String(p.bookingNumber), String(p.serviceName), String(p.timeLeft));

      case 'wallet_credited_sms':
        return smsService.sendWalletCredited(String(p.phone), Number(p.amount), Number(p.balance));

      // Push Notification jobs
      case 'push_notification':
        return firebaseService.sendPushNotification(
          String(p.fcmToken),
          String(p.title),
          String(p.body),
          p.data as Record<string, string>,
        );

      default: {
        const exhaustive: never = job.type as never;
        logger.warn('Unknown notification job type', { type: exhaustive });
        return false;
      }
    }
  }
}

// ─── Singleton Instance ───────────────────────────────────────────────────────

export const notificationQueue = new NotificationQueue();
