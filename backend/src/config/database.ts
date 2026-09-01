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
  maxPoolSize: 100, // Scaled for high-concurrency enterprise workloads
  minPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

const sanitizeMongoUri = (uri: string): string => {
  return uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
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
    const { ensureAdminExists } = await import('../jobs/seedAdminHelper.js');
    await ensureAdminExists();
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to connect to primary MONGODB_URI (${sanitizeMongoUri(env.MONGODB_URI)}): ${errMessage}`);

    if (env.NODE_ENV === 'development') {
      try {
        const path = await import('path');
        const fs = await import('fs');
        const tempDbPath = path.resolve(process.cwd(), '.mongo_temp', `run_${Date.now()}`);
        if (!fs.existsSync(tempDbPath)) {
          fs.mkdirSync(tempDbPath, { recursive: true });
        }
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          instance: { dbName: 'maid_cook_db', dbPath: tempDbPath },
        });
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri, connectionOptions);
        logger.info(`Connected to In-Memory MongoDB successfully at ${memoryUri}`);
        const { ensureAdminExists } = await import('../jobs/seedAdminHelper.js');
        await ensureAdminExists();
        return;
      } catch (memErr) {
        logger.error('In-memory MongoDB fallback failed or module missing', {
          error: memErr instanceof Error ? memErr.message : String(memErr)
        });
      }
    }

    logger.error('Failed to connect to MongoDB. Please provide a valid MongoDB Atlas connection string in backend/.env', {
      error: errMessage,
    });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
