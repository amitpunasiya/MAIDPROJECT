import admin from 'firebase-admin';
import path from 'path';
import { logger } from '../utils/logger.js';

let initialized = false;

export const initializeFirebase = (): void => {
  if (initialized) return;

  const serviceAccount = path.resolve(
    process.cwd(),
    'secrets',
    'firebase-service-account.json'
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  logger.info('Firebase Admin initialized');
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!initialized) {
    initializeFirebase();
  }

  return admin.auth();
};