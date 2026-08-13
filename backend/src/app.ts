import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, corsOrigins } from './config/env.js';
import { initializeFirebase } from './config/firebase.js';
import {
  serveOpenApiJson,
  swaggerUiMiddleware,
  swaggerUiSetup,
} from './config/swagger.js';
import apiRoutes from './routes/index.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/error/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { morganStream } from './utils/logger.js';
import {
  mongoSanitizeMiddleware,
  performanceMetricsMiddleware,
  getSystemMetrics,
} from './middleware/security.middleware.js';
import { metricsController } from './controllers/metrics.controller.js';

initializeFirebase();

const app = express();

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Core Security Headers ────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
    // Additional hardening
    crossOriginEmbedderPolicy: false,        // Allow Swagger UI embeds
    referrerPolicy: { policy: 'same-origin' },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  }),
);

// ─── Request ID & Correlation (must be FIRST after security headers) ──────────
app.use(requestIdMiddleware);

// ─── Body Parsing & Compression ───────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Sanitization & Metrics ───────────────────────────────────────────────────
app.use(mongoSanitizeMiddleware);
app.use(performanceMetricsMiddleware);

// ─── HTTP Access Logging ──────────────────────────────────────────────────────
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ─── Root Ping ────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cook & Maid Booking API',
    data: {
      version: 'v1',
      health: `${env.API_PREFIX}/health`,
      docs: `${env.API_PREFIX}/docs`,
      metrics: `${env.API_PREFIX}/health/metrics`,
      prometheus: env.PROMETHEUS_ENABLED ? `${env.API_PREFIX}/metrics` : 'disabled',
    },
  });
});

// ─── Internal Metrics ─────────────────────────────────────────────────────────
app.get(`${env.API_PREFIX}/health/metrics`, (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      ...getSystemMetrics(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
    },
  });
});

// ─── Prometheus Scrape Endpoint ───────────────────────────────────────────────
app.get(`${env.API_PREFIX}/metrics`, metricsController.expose);

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────
app.get(`${env.API_PREFIX}/docs/openapi.json`, serveOpenApiJson);
app.use(`${env.API_PREFIX}/docs`, swaggerUiMiddleware, swaggerUiSetup);

// ─── Static Media Uploads (local fallback) ────────────────────────────────────
app.use(
  `/${env.LOCAL_UPLOAD_DIR}`,
  express.static(path.join(process.cwd(), env.LOCAL_UPLOAD_DIR)),
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(env.API_PREFIX, apiRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
