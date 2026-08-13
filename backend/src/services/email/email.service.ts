import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  replyTo?: string;
}

// ─── HTML Email Templates ─────────────────────────────────────────────────────

const baseTemplate = (content: string, title: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:28px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:1px;">
                🏠 MaidProject
              </h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Your trusted home service partner</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#374151;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} MaidProject Inc. · All rights reserved<br/>
                Questions? Email <a href="mailto:support@maidproject.com" style="color:#4f46e5;text-decoration:none;">support@maidproject.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Template Builders ────────────────────────────────────────────────────────

function welcomeTemplate(name: string): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Welcome, ${name}! 🎉</h2>
     <p>Thank you for joining <strong>MaidProject</strong>. Your account has been created successfully.</p>
     <p>You can now book professional maids and cooks right from your home with just a few taps.</p>
     <div style="text-align:center;margin:28px 0;">
       <a href="${process.env.APP_URL || 'https://maidproject.com'}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
         Get Started →
       </a>
     </div>
     <p style="color:#6b7280;font-size:13px;">If you did not create this account, please ignore this email.</p>`,
    'Welcome to MaidProject',
  );
}

function otpTemplate(otp: string, expiryMinutes = 10): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Your Verification Code 🔑</h2>
     <p>Use the OTP below to verify your identity. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
     <div style="text-align:center;margin:28px 0;">
       <div style="display:inline-block;background:#f3f4f6;border:2px dashed #4f46e5;border-radius:10px;padding:18px 40px;">
         <span style="font-size:38px;font-weight:700;color:#4f46e5;letter-spacing:8px;">${otp}</span>
       </div>
     </div>
     <p style="color:#ef4444;font-size:13px;">⚠️ Never share this code with anyone. MaidProject will never ask for your OTP.</p>`,
    'Your Verification OTP',
  );
}

function bookingConfirmationTemplate(bookingNumber: string, serviceName: string, date: string, providerName?: string): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Booking Confirmed! ✅</h2>
     <p>Your booking has been successfully placed. Here are the details:</p>
     <table style="width:100%;border-collapse:collapse;margin:16px 0;">
       <tr style="background:#f9fafb;">
         <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Booking #</td>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#4f46e5;font-weight:700;">${bookingNumber}</td>
       </tr>
       <tr>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Service</td>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;">${serviceName}</td>
       </tr>
       <tr style="background:#f9fafb;">
         <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Date & Time</td>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;">${date}</td>
       </tr>
       ${providerName ? `<tr>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Provider</td>
         <td style="padding:10px 14px;border:1px solid #e5e7eb;">${providerName}</td>
       </tr>` : ''}
     </table>
     <p>We will notify you when a provider is assigned. Thank you for choosing MaidProject! 🏠</p>`,
    `Booking Confirmed #${bookingNumber}`,
  );
}

function bookingCancelledTemplate(bookingNumber: string, serviceName: string, reason?: string): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Booking Cancelled ❌</h2>
     <p>Your booking <strong>#${bookingNumber}</strong> for <strong>${serviceName}</strong> has been cancelled.</p>
     ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
     <p>If you did not cancel this booking or need assistance, please contact our support team.</p>
     <div style="text-align:center;margin:28px 0;">
       <a href="mailto:support@maidproject.com" style="background:#ef4444;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
         Contact Support
       </a>
     </div>`,
    `Booking Cancelled #${bookingNumber}`,
  );
}

function bookingCompletedTemplate(bookingNumber: string, serviceName: string, amount: number): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Booking Completed! 🎊</h2>
     <p>Your booking <strong>#${bookingNumber}</strong> for <strong>${serviceName}</strong> has been marked as completed.</p>
     <p><strong>Amount Paid:</strong> ₹${amount.toFixed(2)}</p>
     <p>We hope you had a great experience! Please take a moment to rate your provider.</p>
     <div style="text-align:center;margin:28px 0;">
       <a href="${process.env.APP_URL || 'https://maidproject.com'}/rate" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
         Rate Your Experience ⭐
       </a>
     </div>`,
    `Booking Completed #${bookingNumber}`,
  );
}

function passwordResetTemplate(resetToken: string, expiryMinutes = 30): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Password Reset Request 🔒</h2>
     <p>We received a request to reset your MaidProject account password.</p>
     <p>Use the token below to reset your password. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
     <div style="text-align:center;margin:28px 0;">
       <div style="display:inline-block;background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:14px 32px;">
         <code style="font-size:16px;font-weight:700;color:#dc2626;letter-spacing:2px;">${resetToken}</code>
       </div>
     </div>
     <p style="color:#6b7280;font-size:13px;">If you did not request a password reset, please ignore this email or contact support immediately.</p>`,
    'Reset Your Password',
  );
}

function invoiceTemplate(bookingNumber: string, invoiceHtml: string): string {
  return baseTemplate(
    `<h2 style="color:#111827;margin-top:0;">Tax Invoice — #${bookingNumber} 🧾</h2>
     <p>Please find your invoice details for booking <strong>#${bookingNumber}</strong> below:</p>
     <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#fafafa;margin:16px 0;">
       ${invoiceHtml}
     </div>
     <p style="color:#6b7280;font-size:13px;">Keep this for your records. Thank you for using MaidProject!</p>`,
    `Invoice #${bookingNumber}`,
  );
}

// ─── Email Service Class ──────────────────────────────────────────────────────

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;
  private fromName: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'noreply@maidproject.com';
    this.fromName = process.env.EMAIL_FROM_NAME ?? 'MaidProject';

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      logger.info('Nodemailer SMTP Transporter initialized', { host, port });
    } else {
      logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  // ── Core Send Method ─────────────────────────────────────────────────────

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.info('[EMAIL LOG — Development Mode]', {
        to: options.to,
        subject: options.subject,
        preview: options.html.slice(0, 120).replace(/<[^>]+>/g, ''),
      });
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: options.to,
        cc: options.cc,
        replyTo: options.replyTo ?? this.fromAddress,
        subject: options.subject,
        html: options.html,
      });
      logger.info('Email dispatched successfully', { to: options.to, subject: options.subject });
      return true;
    } catch (error) {
      logger.error('SMTP email dispatch failed', { error, to: options.to, subject: options.subject });
      return false;
    }
  }

  // ── Template Methods ─────────────────────────────────────────────────────

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '🎉 Welcome to MaidProject!',
      html: welcomeTemplate(name),
    });
  }

  async sendOtpEmail(to: string, otp: string, expiryMinutes = 10): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `${otp} is your MaidProject verification code`,
      html: otpTemplate(otp, expiryMinutes),
    });
  }

  async sendBookingConfirmation(
    to: string,
    bookingNumber: string,
    date: string,
    serviceName: string,
    providerName?: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Booking Confirmed #${bookingNumber}`,
      html: bookingConfirmationTemplate(bookingNumber, serviceName, date, providerName),
    });
  }

  async sendBookingCancelled(to: string, bookingNumber: string, serviceName: string, reason?: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Booking Cancelled #${bookingNumber}`,
      html: bookingCancelledTemplate(bookingNumber, serviceName, reason),
    });
  }

  async sendBookingCompleted(to: string, bookingNumber: string, serviceName: string, amount: number): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Booking Completed #${bookingNumber} ✅`,
      html: bookingCompletedTemplate(bookingNumber, serviceName, amount),
    });
  }

  async sendPasswordReset(to: string, resetToken: string, expiryMinutes = 30): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Reset Your MaidProject Password',
      html: passwordResetTemplate(resetToken, expiryMinutes),
    });
  }

  async sendInvoiceEmail(to: string, bookingNumber: string, invoiceHtml: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Tax Invoice — Booking #${bookingNumber}`,
      html: invoiceTemplate(bookingNumber, invoiceHtml),
    });
  }
}

export const emailService = new EmailService();
