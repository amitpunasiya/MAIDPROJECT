import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// ─── Slow Query Logging ───────────────────────────────────────────────────────

/**
 * Monkey-patches `mongoose.Query.prototype.exec` to measure execution time.
 * Logs a warning for any query exceeding `thresholdMs`.
 *
 * IMPORTANT: Call this BEFORE `mongoose.connect()` and any model imports
 * to ensure the patch is applied globally.
 */
export function applySlowQueryLogging(thresholdMs: number): void {
  if (thresholdMs <= 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origExec = (mongoose.Query.prototype as any).exec as (
    ...args: unknown[]
  ) => Promise<unknown>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mongoose.Query.prototype as any).exec = async function (
    this: mongoose.Query<unknown, unknown>,
    ...args: unknown[]
  ): Promise<unknown> {
    const start = Date.now();
    const result = await origExec.apply(this, args);
    const duration = Date.now() - start;

    if (duration >= thresholdMs) {
      logger.warn('🐢 Slow MongoDB query detected', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        op: (this as any).op as string | undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: ((this as any).mongooseCollection as { name?: string } | undefined)?.name,
        durationMs: duration,
        threshold: thresholdMs,
      });
    }

    return result;
  };

  logger.info('Slow query logging enabled', { thresholdMs });
}
