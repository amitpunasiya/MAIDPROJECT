import { redisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';

// ─── Cache Service ────────────────────────────────────────────────────────────

/**
 * Redis-backed cache with automatic JSON (de)serialisation.
 * All methods are no-ops when Redis is not configured, so callers
 * never need to guard against a missing Redis connection.
 */
export class CacheService {
  /**
   * Retrieve a cached value. Returns `null` on miss or when cache is unavailable.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient) return null;
    try {
      const raw = await redisClient.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.warn('Cache GET error', { key, error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  }

  /**
   * Store a value in the cache with an optional TTL (default: 5 minutes).
   */
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisClient) return;
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn('Cache SET error', { key, error: err instanceof Error ? err.message : String(err) });
    }
  }

  /**
   * Delete a specific key from the cache.
   */
  async del(key: string): Promise<void> {
    if (!redisClient) return;
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn('Cache DEL error', { key, error: err instanceof Error ? err.message : String(err) });
    }
  }

  /**
   * Delete all keys matching a glob pattern (default: all keys).
   * Use with care in production — scans the entire keyspace.
   */
  async flush(pattern = '*'): Promise<void> {
    if (!redisClient) return;
    try {
      const keys = await redisClient.keys(pattern);
      for (const key of keys) {
        await redisClient.del(key);
      }
    } catch (err) {
      logger.warn('Cache FLUSH error', { pattern, error: err instanceof Error ? err.message : String(err) });
    }
  }

  /**
   * Get-or-set: return cached value, or call `fn`, cache the result, and return it.
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /** Returns true when Redis is connected and available */
  isAvailable(): boolean {
    return redisClient !== null;
  }
}

export const cacheService = new CacheService();
