import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Dedicated Prometheus registry for the application.
 * Use `metricsRegistry.metrics()` to get the scrape output.
 */
export const metricsRegistry = new Registry();

// Register Node.js default metrics:
// process_cpu_user_seconds_total, process_heap_bytes, nodejs_event_loop_lag_seconds, etc.
collectDefaultMetrics({ register: metricsRegistry });

// ─── HTTP Metrics ─────────────────────────────────────────────────────────────

/**
 * Counter: total HTTP requests segmented by method, route pattern, and status code.
 */
export const httpRequestsTotal = new Counter<string>({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

/**
 * Histogram: request duration in seconds.
 * Buckets cover 5 ms → 10 s, suitable for web API latency distribution.
 */
export const httpRequestDurationSeconds = new Histogram<string>({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});
