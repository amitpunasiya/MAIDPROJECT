import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'demo-maid-cook-app'
);

let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
  } catch (err) {
    console.warn('Firebase Web SDK initialization warning:', err);
  }
}

export const auth = authInstance;

let confirmationResultStore: ConfirmationResult | null = null;
let recaptchaVerifierStore: RecaptchaVerifier | null = null;

/**
 * Initializes invisible or visible RecaptchaVerifier for Phone Auth
 */
export const setupRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier | null => {
  if (!auth) return null;

  try {
    if (recaptchaVerifierStore) {
      recaptchaVerifierStore.clear();
      recaptchaVerifierStore = null;
    }

    recaptchaVerifierStore = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
    });

    return recaptchaVerifierStore;
  } catch (err) {
    console.error('Failed to setup RecaptchaVerifier:', err);
    return null;
  }
};

/**
 * Sends Phone OTP via Firebase Client SDK
 */
export const sendFirebasePhoneOtp = async (
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<boolean> => {
  if (!auth || !isFirebaseConfigured) {
    console.info('Firebase Web SDK not fully configured — falling back to simulation mode');
    return false;
  }

  const verifier = setupRecaptcha(containerId);
  if (!verifier) {
    throw new Error('Failed to initialize reCAPTCHA verifier for Firebase Phone Auth');
  }

  try {
    confirmationResultStore = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return true;
  } catch (err: unknown) {
    if (recaptchaVerifierStore) {
      recaptchaVerifierStore.clear();
      recaptchaVerifierStore = null;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Firebase Phone Auth failed: ${message}`);
  }
};

/**
 * Verifies entered 6-digit OTP code against Firebase ConfirmationResult and retrieves Firebase ID token
 */
export const verifyFirebasePhoneOtpCode = async (otpCode: string): Promise<string | null> => {
  if (!confirmationResultStore) {
    return null;
  }

  try {
    const userCredential = await confirmationResultStore.confirm(otpCode);
    const idToken = await userCredential.user.getIdToken(true);
    return idToken;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Firebase OTP verification failed: ${message}`);
  }
};
