import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { seedLocationData } from './seedLocations.js';

const run = async () => {
  try {
    logger.info('Connecting to MongoDB for location seeding...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected.');

    const result = await seedLocationData();
    logger.info('Location seeding finished successfully:', result);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding locations:', error);
    process.exit(1);
  }
};

run();
