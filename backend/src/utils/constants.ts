// ─── HTTP Status Codes ────────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Error Codes ──────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
} as const;

// ─── Cache TTL (seconds) ──────────────────────────────────────────────────────

export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3_600,      // 1 hour
  DAY: 86_400,      // 24 hours
} as const;

// ─── File Limits ──────────────────────────────────────────────────────────────

export const FILE_LIMITS = {
  IMAGE_MAX_BYTES: 5 * 1024 * 1024,    // 5 MB
  DOCUMENT_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
} as const;

// ─── Queue Defaults ───────────────────────────────────────────────────────────

export const QUEUE = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5_000,
  MAX_RETRY_DELAY_MS: 60_000,
  PROCESS_INTERVAL_MS: 2_000,
  MAX_FAILED_JOBS: 200,
} as const;

// ─── Application ──────────────────────────────────────────────────────────────

export const APP = {
  NAME: 'Cook & Maid Booking API',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
} as const;

// ─── Slow Query ───────────────────────────────────────────────────────────────

export const SLOW_QUERY_DEFAULT_THRESHOLD_MS = 100;
