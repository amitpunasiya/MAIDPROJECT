import admin from 'firebase-admin';
import { getFirebaseAuth } from '../../config/firebase.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export class FirebaseService {
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const auth = getFirebaseAuth();
      return await auth.verifyIdToken(idToken);
    } catch (error) {
      logger.error('Firebase ID token verification failed', { error });
      throw ApiError.unauthorized('Invalid or expired Firebase ID token');
    }
  }

  async verifyPhoneOtpToken(idToken: string): Promise<{ uid: string; phoneNumber?: string }> {
    const decoded = await this.verifyIdToken(idToken);
    if (!decoded.phone_number) {
      throw ApiError.badRequest('Firebase token does not contain a verified phone number');
    }
    return {
      uid: decoded.uid,
      phoneNumber: decoded.phone_number,
    };
  }

  async sendPushNotification(
    targetToken: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<boolean> {
    try {
      if (!targetToken) {
        logger.warn('Push notification skipped: Empty target token');
        return false;
      }

      await admin.messaging().send({
        token: targetToken,
        notification: { title, body },
        data,
      });

      logger.info('Firebase push notification sent successfully', { targetToken: targetToken.slice(0, 10), title });
      return true;
    } catch (error) {
      logger.error('Firebase push notification failed', { error });
      return false;
    }
  }

  async sendBookingNotification(targetToken: string, bookingNumber: string, status: string): Promise<boolean> {
    const title = `Booking Update #${bookingNumber}`;
    const body = `Your booking status is now: ${status.toUpperCase()}`;
    return this.sendPushNotification(targetToken, title, body, { type: 'booking_update', bookingNumber, status });
  }

  async sendPaymentNotification(targetToken: string, paymentId: string, amount: number, status: string): Promise<boolean> {
    const title = `Payment ${status === 'completed' ? 'Successful' : 'Failed'}`;
    const body = `Payment of ₹${amount} was ${status}. ID: ${paymentId}`;
    return this.sendPushNotification(targetToken, title, body, { type: 'payment_update', paymentId, status });
  }

  async sendPromotionalBroadcast(title: string, body: string): Promise<boolean> {
    return this.sendTopicNotification('promotions', title, body);
  }

  async sendTopicNotification(topic: string, title: string, body: string): Promise<boolean> {
    try {
      await admin.messaging().send({
        topic,
        notification: { title, body },
      });
      logger.info('Firebase topic notification sent', { topic, title });
      return true;
    } catch (error) {
      logger.error('Firebase topic notification failed', { topic, error });
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
