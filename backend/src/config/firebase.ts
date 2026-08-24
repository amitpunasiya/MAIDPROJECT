import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

let initialized = false;

export const initializeFirebase = (): void => {
  if (initialized) return;

  const serviceAccountPath = path.resolve(
    process.cwd(),
    'secrets',
    'firebase-service-account.json'
  );

  try {
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      initialized = true;
      logger.info('Firebase Admin initialized using secrets file');
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (
      projectId &&
      clientEmail &&
      privateKey &&
      !projectId.includes('demo') &&
      !clientEmail.includes('demo')
    ) {
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      initialized = true;
      logger.info('Firebase Admin initialized using environment variables');
      return;
    }

    logger.warn(
      'Firebase Admin SDK skipped: secrets/firebase-service-account.json file not found and environment credentials not configured'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('Firebase Admin initialization failed:', { error: message });
  }
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!initialized) {
    initializeFirebase();
  }

  return admin.auth();
};