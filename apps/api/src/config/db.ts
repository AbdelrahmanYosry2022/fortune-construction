import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { safeLogger } from '../utils/safeLogger';
import { allowsRemoteDatabase, isRemoteMongoUri } from './runtime';

let memServer: MongoMemoryServer | null = null;

export type DatabaseMode = 'remote' | 'local' | 'memory' | 'unavailable';

export interface DatabaseStatus {
  mode: DatabaseMode;
  ready: boolean;
  isNewDatabase: boolean;
  // Live check for /health; without it /health only reports the state at startup.
  isConnected?: () => boolean;
}

export const LOCAL_MONGO_URI = 'mongodb://localhost:27017/fortune-construction';

export interface ConnectOptions {
  production?: boolean;
  localUri?: string;
  attempts?: number;
  retryDelayMs?: number;
  serverSelectionTimeoutMS?: number;
}

const isConnected = () => mongoose.connection.readyState === 1;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectDB(options: ConnectOptions = {}): Promise<DatabaseStatus> {
  const production = options.production ?? process.env.NODE_ENV === 'production';
  const localUri = options.localUri ?? LOCAL_MONGO_URI;
  const serverSelectionTimeoutMS = options.serverSelectionTimeoutMS ?? 3000;
  const uri = process.env.MONGODB_URI;

  if (isRemoteMongoUri(uri)) {
    if (!allowsRemoteDatabase()) {
      safeLogger.warn('Remote MongoDB URI configured but not allowed for this local runtime; skipping remote connection.');
    } else if (uri) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        safeLogger.info('MongoDB connected (remote)');
        return { mode: 'remote', ready: true, isNewDatabase: false, isConnected };
      } catch (err) {
        safeLogger.error('Failed to connect to configured remote MongoDB; trying the local database.', err);
      }
    }
  }

  // Production never falls back to a throwaway database: after a reboot MongoDB may start
  // a little after the API, so keep retrying the real one, then stop and let pm2 restart us.
  if (production) {
    const attempts = options.attempts ?? 20;
    const retryDelayMs = options.retryDelayMs ?? 3000;
    let lastReason = 'unknown error';
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await mongoose.connect(localUri, { serverSelectionTimeoutMS });
        safeLogger.info('MongoDB connected (local)');
        return { mode: 'local', ready: true, isNewDatabase: false, isConnected };
      } catch (err) {
        lastReason = err instanceof Error ? err.message : String(err);
        // The driver's reason (refused, DNS, auth...) goes into the pm2 logs, redacted by safeLogger.
        safeLogger.warn(`MongoDB is not reachable yet (attempt ${attempt} of ${attempts}): ${lastReason}`);
        if (attempt < attempts) await wait(retryDelayMs);
      }
    }
    throw new Error(`MongoDB is not reachable (${lastReason}). Refusing to start without the production database.`);
  }

  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS });
    safeLogger.info('MongoDB connected (local)');
    return { mode: 'local', ready: true, isNewDatabase: false, isConnected };
  } catch {
    // development only: fall through to a persistent file-backed in-memory database
  }

  // Loaded on demand: mongodb-memory-server is a dev dependency and is never needed in production.
  const { MongoMemoryServer: MemoryServer } = await import('mongodb-memory-server');

  const dbPath = path.join(__dirname, '../../.mongodb-data');
  const isNewDb = !fs.existsSync(dbPath);
  if (isNewDb) fs.mkdirSync(dbPath, { recursive: true });

  try {
    safeLogger.info('Starting persistent local MongoDB...');
    memServer = await MemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
    const memUri = memServer.getUri();
    await mongoose.connect(memUri);
    safeLogger.info('MongoDB connected (persistent file storage at .mongodb-data/)');
    safeLogger.info('Data survives restarts. Set MONGODB_URI in .env for cloud Atlas.');
    return { mode: 'memory', ready: true, isNewDatabase: isNewDb, isConnected };
  } catch (err) {
    safeLogger.error('Failed to start persistent local MongoDB fallback.', err);
  }

  try {
    const tempDbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'fortune-api-mongo-'));
    safeLogger.warn('Starting temporary local MongoDB because persistent local storage is unavailable.');
    memServer = await MemoryServer.create({
      instance: {
        dbPath: tempDbPath,
        storageEngine: 'wiredTiger',
      },
    });
    const memUri = memServer.getUri();
    await mongoose.connect(memUri);
    safeLogger.info('MongoDB connected (temporary local storage)');
    return { mode: 'memory', ready: true, isNewDatabase: true, isConnected };
  } catch (err) {
    safeLogger.error('Failed to start any local MongoDB fallback.', err);
    return { mode: 'unavailable', ready: false, isNewDatabase: false };
  }
}

export async function stopDB(): Promise<void> {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
}
