import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().default(5000),

  API_PREFIX: z.string().default('/api/v1'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGINS: z.string().default(
    'http://localhost:5173,http://localhost:5174'
  ),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),

  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),

  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'debug'])
    .default('info'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),

  CLOUDINARY_API_KEY: z.string().optional().default(''),

  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  REFRESH_TOKEN_COOKIE_NAME: z.string().default('refreshToken'),

  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('lax'),

  LOCAL_UPLOAD_DIR: z.string().default('uploads'),

  // ─── Redis ──────────────────────────────────────────────────────────────────
  // Leave empty to disable the cache layer entirely (graceful no-op)
  REDIS_URL: z.string().default(''),

  // ─── Observability ──────────────────────────────────────────────────────────
  /** Log a warning for any MongoDB query exceeding this threshold (ms). 0 = disabled. */
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().int().min(0).default(100),

  /** Expose Prometheus metrics at GET /api/v1/metrics */
  PROMETHEUS_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // ─── Scheduler ──────────────────────────────────────────────────────────────
  /** Enable the cron job scheduler on startup */
  CRON_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;

  const messages = Object.entries(formatted)
    .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
    .join('\n');

  throw new Error(`Environment validation failed:\n${messages}`);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',').map((origin) =>
  origin.trim()
);