/**
 * Backup utility — exports every MongoDB collection to timestamped JSON files.
 *
 * Uses the native MongoDB driver via Mongoose (no external `mongodump` required).
 * Output: ./backups/YYYY-MM-DD_HH-MM-SS/<collection>.json
 *
 * Usage:
 *   npm run backup                       # full backup
 *   npm run backup -- --col=users        # backup a single collection
 *
 * Run: tsx src/jobs/backup.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTimestamp(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  );
}

// ─── Backup Runner ────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  logger.info('═══ Backup runner starting ═══');

  const colFlag = process.argv.find((a) => a.startsWith('--col='));
  const onlyCol = colFlag ? colFlag.split('=')[1] : null;

  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not established');

  const timestamp = buildTimestamp();
  const backupRoot = path.join(process.cwd(), 'backups', timestamp);
  fs.mkdirSync(backupRoot, { recursive: true });

  logger.info('Backup directory created', { path: backupRoot });

  // List all collections
  const allCollections = await db.listCollections().toArray();
  const collections = onlyCol
    ? allCollections.filter((c) => c.name === onlyCol)
    : allCollections;

  if (collections.length === 0) {
    logger.warn('No matching collections found', { filter: onlyCol });
  }

  let totalDocs = 0;

  for (const { name } of collections) {
    try {
      const docs = await db.collection(name).find({}).toArray();
      const filePath = path.join(backupRoot, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
      totalDocs += docs.length;
      logger.info(`✓ Backed up: ${name}`, { documents: docs.length, file: filePath });
    } catch (err) {
      logger.error(`✗ Failed to back up: ${name}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await disconnectDatabase();

  logger.info('═══ Backup runner finished ═══', {
    collections: collections.length,
    totalDocuments: totalDocs,
    outputDir: backupRoot,
  });
};

main().catch((err: unknown) => {
  logger.error('Backup runner crashed', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
