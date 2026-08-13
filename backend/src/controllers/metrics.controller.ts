import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { metricsRegistry } from '../services/metrics/metrics.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// ─── Metrics Controller ───────────────────────────────────────────────────────

export class MetricsController {
  /**
   * GET /api/v1/metrics
   *
   * Exposes Prometheus text-format metrics for scraping.
   * Only active when `PROMETHEUS_ENABLED=true` in the environment.
   *
   * No authentication required — protect at the network level (e.g. internal-only ingress).
   */
  expose = asyncHandler(async (_req: Request, res: Response) => {
    if (!env.PROMETHEUS_ENABLED) {
      throw ApiError.notFound('Prometheus metrics endpoint is not enabled. Set PROMETHEUS_ENABLED=true.');
    }

    const output = await metricsRegistry.metrics();
    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.end(output);
  });
}

export const metricsController = new MetricsController();
