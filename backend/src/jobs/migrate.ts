/**
 * Migration runner — applies version-tracked, idempotent schema changes.
 *
 * Applied migrations are stored in the `_migrations` collection.
 * Add new migrations to the `migrations` array below in ascending version order.
 *
 * Usage:
 *   npm run migrate            # run all pending migrations
 *   npm run migrate -- --dry   # dry run (preview without applying)
 *
 * Run: tsx src/jobs/migrate.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

// ─── Migration Record Schema ───────────────────────────────────────────────────

interface MigrationRecord {
  version: number;
  name: string;
  appliedAt: Date;
}

// ─── Migration Definitions ────────────────────────────────────────────────────

interface Migration {
  version: number;
  name: string;
  up: (db: mongoose.mongo.Db) => Promise<void>;
}

const migrations: Migration[] = [
  /**
   * Example migration — uncomment and increment version as needed:
   *
   * {
   *   version: 1,
   *   name: 'add_user_phone_index',
   *   up: async (db) => {
   *     await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
   *   },
   * },
   */
];

// ─── Runner ───────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  const isDryRun = process.argv.includes('--dry');
  logger.info('═══ Migration runner starting ═══', { dryRun: isDryRun });

  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not established');

  // Ensure migrations collection exists
  const migrationsCol = db.collection<MigrationRecord>('_migrations');

  // Fetch applied migration versions
  const applied = await migrationsCol.find({}).toArray();
  const appliedVersions = new Set(applied.map((m) => m.version));

  const pending = migrations.filter((m) => !appliedVersions.has(m.version));

  if (pending.length === 0) {
    logger.info('All migrations are up to date — nothing to run');
    await disconnectDatabase();
    return;
  }

  logger.info(`Found ${pending.length} pending migration(s)`);

  for (const migration of pending) {
    logger.info(`Running migration v${migration.version}: ${migration.name}`, { dryRun: isDryRun });

    if (isDryRun) {
      logger.info('[DRY RUN] Would apply migration', { version: migration.version, name: migration.name });
      continue;
    }

    try {
      await migration.up(db);
      await migrationsCol.insertOne({
        version: migration.version,
        name: migration.name,
        appliedAt: new Date(),
      });
      logger.info(`✓ Migration applied: v${migration.version} — ${migration.name}`);
    } catch (err) {
      logger.error(`✗ Migration failed: v${migration.version} — ${migration.name}`, {
        error: err instanceof Error ? err.message : String(err),
      });
      // Stop on first failure to avoid partial state
      break;
    }
  }

  await disconnectDatabase();
  logger.info('═══ Migration runner finished ═══');
};

main().catch((err: unknown) => {
  logger.error('Migration runner crashed', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
