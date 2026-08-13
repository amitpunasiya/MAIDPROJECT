import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { applySlowQueryLogging } from './mongoosePlugins.js';

// Resolve MongoDB SRV records reliably on Windows/Node.js using public DNS resolvers
try {
  dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);
} catch (err: unknown) {
  logger.warn('Failed to set custom DNS servers, using system default DNS', {
    error: err instanceof Error ? err.message : String(err),
  });
}

// Apply slow query logging BEFORE connecting (patches Query.prototype globally)
applySlowQueryLogging(env.SLOW_QUERY_THRESHOLD_MS);

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

export const connectDatabase = async (): Promise<void> => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (error: Error) => {
    logger.error('MongoDB connection error:', { error: error.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  try {
    await mongoose.connect(env.MONGODB_URI, connectionOptions);
  } catch (error: unknown) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
