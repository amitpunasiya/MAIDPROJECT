import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { httpRequestsTotal, httpRequestDurationSeconds } from '../services/metrics/metrics.service.js';
import { env } from '../config/env.js';

// ─── Request ID Middleware ────────────────────────────────────────────────────

/**
 * Assigns a unique `X-Request-ID` to every incoming request:
 *  - Reuses the client-supplied header if present (propagation for distributed tracing).
 *  - Otherwise generates a new UUID v4.
 *
 * Also records Prometheus HTTP metrics (counter + histogram) on response finish.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Assign / propagate request ID
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.length > 0
      ? incomingId
      : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Prometheus instrumentation
  if (env.PROMETHEUS_ENABLED) {
    const startNs = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
      const durationSec = durationMs / 1000;

      // Use the route pattern (e.g. /users/:id) — NOT the raw URL — to avoid label explosion
      const routePath = req.route?.path as string | RegExp | undefined;
      const route =
        typeof routePath === 'string'
          ? routePath
          : req.path;

      const labels = {
        method: req.method,
        route: route.slice(0, 100),
        status_code: String(res.statusCode),
      };

      httpRequestsTotal.inc(labels);
      httpRequestDurationSeconds.observe(labels, durationSec);
    });
  }

  next();
};
