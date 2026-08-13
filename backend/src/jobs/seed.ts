/**
 * Seed runner — populates the database with essential initial data.
 *
 * Usage:
 *   npm run seed                          # run all seeds
 *   npm run seed -- --only=admin          # run a specific seed group
 *
 * Run: tsx src/jobs/seed.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/user.model.js';
import { GlobalSettings } from '../models/globalSetting.model.js';
import { ServiceCategory } from '../models/serviceCategory.model.js';
import { UserRole } from '../types/auth.types.js';
import bcrypt from 'bcryptjs';

// ─── Seed Definitions ─────────────────────────────────────────────────────────

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@maidapp.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';

  const exists = await User.findOne({ email });
  if (exists) {
    logger.info('Super admin already exists — skipping', { email });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    name: 'Super Admin',
    email,
    phone: '+919999999999',
    password: hashed,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    isEmailVerified: true,
  });

  logger.info('Super admin seeded', { email });
}

async function seedGlobalSettings(): Promise<void> {
  const count = await GlobalSettings.countDocuments();
  if (count > 0) {
    logger.info('Global settings already exist — skipping');
    return;
  }

  await GlobalSettings.create({
    general: {
      appName: 'Cook & Maid Booking',
      companyName: 'MaidProject Inc.',
      supportEmail: 'support@maidapp.com',
      supportPhone: '+91 9999999999',
      logoUrl: '',
      faviconUrl: '',
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
      razorpayKeyId: '',
      razorpayKeySecret: '',
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
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      twitter: '',
    },
  });

  logger.info('Global settings seeded');
}

async function seedServiceCategories(): Promise<void> {
  const count = await ServiceCategory.countDocuments();
  if (count > 0) {
    logger.info('Service categories already exist — skipping');
    return;
  }

  const categories = [
    { name: 'Cooking', description: 'Professional cooking services', isActive: true },
    { name: 'House Cleaning', description: 'Deep and regular cleaning', isActive: true },
    { name: 'Babysitting', description: 'Child care services', isActive: true },
    { name: 'Elder Care', description: 'Senior citizen care', isActive: true },
    { name: 'Laundry', description: 'Washing and ironing', isActive: true },
  ];

  await ServiceCategory.insertMany(categories);
  logger.info('Service categories seeded', { count: categories.length });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const seeds: Array<{ name: string; fn: () => Promise<void> }> = [
  { name: 'super-admin', fn: seedSuperAdmin },
  { name: 'global-settings', fn: seedGlobalSettings },
  { name: 'service-categories', fn: seedServiceCategories },
];

const main = async (): Promise<void> => {
  logger.info('═══ Seed runner starting ═══');

  const onlyFlag = process.argv.find((a) => a.startsWith('--only='));
  const onlyName = onlyFlag ? onlyFlag.split('=')[1] : null;

  await connectDatabase();

  const toRun = onlyName ? seeds.filter((s) => s.name === onlyName) : seeds;

  if (toRun.length === 0) {
    logger.warn('No matching seeds found', { filter: onlyName });
  }

  for (const seed of toRun) {
    try {
      logger.info(`Running seed: ${seed.name}`);
      await seed.fn();
      logger.info(`✓ Seed completed: ${seed.name}`);
    } catch (err) {
      logger.error(`✗ Seed failed: ${seed.name}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await disconnectDatabase();
  logger.info('═══ Seed runner finished ═══');
};

main().catch((err: unknown) => {
  logger.error('Seed runner crashed', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
