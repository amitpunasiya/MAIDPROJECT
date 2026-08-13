import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { notificationQueue } from './services/queue/notification.queue.js';
import { cronScheduler } from './services/scheduler/cron.scheduler.js';
import { disconnectRedis } from './config/redis.js';

// ─── Register Cron Jobs ───────────────────────────────────────────────────────
// Add application cron jobs here before calling cronScheduler.start().
// Example:
//
// cronScheduler.register({
//   name: 'cleanup-expired-otps',
//   schedule: '0 * * * *',          // every hour
//   task: async () => { await otpService.removeExpired(); },
// });
//
// cronScheduler.register({
//   name: 'send-booking-reminders',
//   schedule: '*/15 * * * *',       // every 15 minutes
//   task: async () => { await bookingService.sendReminders(); },
// });

// ─── Server Bootstrap ─────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  await connectDatabase();

  // Start background notification queue
  notificationQueue.start();

  // Start cron scheduler (only if enabled in env)
  if (env.CRON_ENABLED) {
    cronScheduler.start();
    logger.info('CronScheduler started', { jobs: cronScheduler.getRegisteredJobs() });
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API available at http://localhost:${env.PORT}${env.API_PREFIX}`);
    if (env.PROMETHEUS_ENABLED) {
      logger.info(`Prometheus metrics at http://localhost:${env.PORT}${env.API_PREFIX}/metrics`);
    }
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      try {
        notificationQueue.stop();

        if (env.CRON_ENABLED) {
          cronScheduler.stop();
        }

        await disconnectRedis();
        await disconnectDatabase();

        logger.info('Server shut down cleanly');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown', {
          error: err instanceof Error ? err.message : String(err),
        });
        process.exit(1);
      }
    });

    // Force kill after 15 s if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 15_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    void shutdown('UNCAUGHT_EXCEPTION');
  });
};

// ─── Entry Point ──────────────────────────────────────────────────────────────

startServer().catch((error: Error) => {
  logger.error('Failed to start server', { error: error.message, stack: error.stack });
  process.exit(1);
});
