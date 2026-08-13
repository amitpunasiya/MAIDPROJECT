import { logger } from './logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds for exponential back-off cap (default: 30000) */
  maxDelayMs?: number;
  /** Multiplier for exponential back-off (default: 2) */
  backoffMultiplier?: number;
  /** Optional per-attempt error callback */
  onError?: (err: unknown, attempt: number, nextDelayMs: number) => void;
  /** Optional predicate — return false to stop retrying early */
  shouldRetry?: (err: unknown) => boolean;
}

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Execute `fn` with exponential back-off retry.
 *
 * @example
 * const result = await withRetry(() => fetchFromExternalApi(), { maxAttempts: 5 });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1_000,
    maxDelayMs = 30_000,
    backoffMultiplier = 2,
    onError,
    shouldRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Check if we should stop retrying
      if (shouldRetry && !shouldRetry(err)) {
        throw err;
      }

      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt) break;

      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs,
      );

      if (onError) {
        onError(err, attempt, delay);
      } else {
        logger.warn('Retry attempt failed', {
          attempt,
          maxAttempts,
          nextDelayMs: delay,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Sleep for a given number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
