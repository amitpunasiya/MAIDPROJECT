import { schedule } from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { logger } from '../../utils/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CronJobConfig {
  /** Unique name for the job — used for logging and deduplication */
  name: string;
  /** Standard cron expression (e.g. '0 * * * *' for hourly) */
  schedule: string;
  /** The async or sync task to run */
  task: () => void | Promise<void>;
  /** If true, run the task immediately on registration */
  runOnStart?: boolean;
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export class CronScheduler {
  private readonly jobs = new Map<string, ScheduledTask>();

  /**
   * Register a new cron job. Safe to call multiple times — duplicate names are ignored.
   */
  register(config: CronJobConfig): void {
    if (this.jobs.has(config.name)) {
      logger.warn('Cron job already registered — skipping', { name: config.name });
      return;
    }

    const task = schedule(config.schedule, () => {
      void (async () => {
        try {
          logger.debug('Cron job starting', { name: config.name });
          await Promise.resolve(config.task());
          logger.debug('Cron job completed', { name: config.name });
        } catch (err) {
          logger.error('Cron job failed', {
            name: config.name,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    });

    // Pause until start() is explicitly invoked
    task.stop();

    this.jobs.set(config.name, task);
    logger.info('Cron job registered', { name: config.name, schedule: config.schedule });

    if (config.runOnStart) {
      void (async () => {
        try {
          await Promise.resolve(config.task());
        } catch (err) {
          logger.error('Cron runOnStart failed', {
            name: config.name,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    }
  }

  /** Start all registered cron jobs */
  start(): void {
    if (this.jobs.size === 0) {
      logger.info('CronScheduler: no jobs registered');
      return;
    }
    for (const [name, task] of this.jobs) {
      task.start();
      logger.info('Cron job started', { name });
    }
  }

  /** Stop all running cron jobs */
  stop(): void {
    for (const [name, task] of this.jobs) {
      task.stop();
      logger.info('Cron job stopped', { name });
    }
  }

  /** Get names of all registered jobs */
  getRegisteredJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

export const cronScheduler = new CronScheduler();
