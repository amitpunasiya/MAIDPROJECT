import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// ─── Client ───────────────────────────────────────────────────────────────────

let _redisClient: Redis | null = null;

if (env.REDIS_URL) {
  try {
    _redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      connectTimeout: 5_000,
      commandTimeout: 3_000,
    });

    _redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    _redisClient.on('ready', () => {
      logger.info('Redis ready');
    });

    _redisClient.on('error', (err: Error) => {
      logger.warn('Redis error', { message: err.message });
    });

    _redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    _redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  } catch (err) {
    logger.warn('Failed to initialize Redis — cache will be disabled', {
      error: err instanceof Error ? err.message : String(err),
    });
    _redisClient = null;
  }
} else {
  logger.info('REDIS_URL not configured — cache layer disabled (no-op mode)');
}

export const redisClient: Redis | null = _redisClient;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export const disconnectRedis = async (): Promise<void> => {
  if (_redisClient) {
    await _redisClient.quit();
    logger.info('Redis disconnected');
  }
};
