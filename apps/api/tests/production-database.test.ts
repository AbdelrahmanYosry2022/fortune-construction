import './setup';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, LOCAL_MONGO_URI } from '../src/config/db';
import { createTestServer } from './helpers/appTestHarness';
import { seedRefusalReason } from '../src/utils/seedGuard';

// Before this fix, a production API that started before MongoDB silently switched to a
// throwaway database with demo projects and admin/admin123, and /health still said "ok".

test('production never falls back to a throwaway database and stops after retrying', async () => {
  const originalEnv = { ...process.env };
  const originalConnect = mongoose.connect;
  const originalCreate = MongoMemoryServer.create;
  const attemptedUris: string[] = [];
  let memoryCreateAttempts = 0;
  delete process.env.MONGODB_URI;

  (mongoose.connect as unknown as (uri: string) => Promise<unknown>) = async (uri: string) => {
    attemptedUris.push(uri);
    throw new Error('MongoDB is down');
  };
  MongoMemoryServer.create = (async () => {
    memoryCreateAttempts += 1;
    throw new Error('must not be called in production');
  }) as typeof MongoMemoryServer.create;

  try {
    await assert.rejects(connectDB({ production: true, attempts: 3, retryDelayMs: 1 }), /MongoDB is down.*Refusing to start/);
    assert.deepEqual(attemptedUris, [LOCAL_MONGO_URI, LOCAL_MONGO_URI, LOCAL_MONGO_URI]);
    assert.equal(memoryCreateAttempts, 0);
  } finally {
    mongoose.connect = originalConnect;
    MongoMemoryServer.create = originalCreate;
    process.env = originalEnv;
  }
});

test('production waits for MongoDB that starts a little after the API', async () => {
  const originalEnv = { ...process.env };
  const originalConnect = mongoose.connect;
  let calls = 0;
  delete process.env.MONGODB_URI;

  (mongoose.connect as unknown as (uri: string) => Promise<unknown>) = async () => {
    calls += 1;
    if (calls < 3) throw new Error('not up yet');
    return undefined;
  };

  try {
    const status = await connectDB({ production: true, attempts: 5, retryDelayMs: 1 });
    assert.equal(status.mode, 'local');
    assert.equal(status.ready, true);
    assert.equal(calls, 3);
  } finally {
    mongoose.connect = originalConnect;
    process.env = originalEnv;
  }
});

test('production uses the database MONGODB_URI names on this machine, not always the default one', async () => {
  const originalEnv = { ...process.env };
  const originalConnect = mongoose.connect;
  const attemptedUris: string[] = [];
  (mongoose.connect as unknown as (uri: string) => Promise<unknown>) = async (uri: string) => {
    attemptedUris.push(uri);
    return undefined;
  };

  try {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/separate-test-db';
    await connectDB({ production: true, attempts: 1 });
    // A URI naming the default database keeps using it.
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/fortune-construction';
    await connectDB({ production: true, attempts: 1 });
    process.env.MONGODB_URI = '  ';
    await connectDB({ production: true, attempts: 1 });
    assert.deepEqual(attemptedUris, [
      'mongodb://127.0.0.1:27017/separate-test-db',
      'mongodb://127.0.0.1:27017/fortune-construction',
      LOCAL_MONGO_URI,
    ]);
  } finally {
    mongoose.connect = originalConnect;
    process.env = originalEnv;
  }
});

// In this workspace the MongoDB binary is cached next to the hoisted mongodb-memory-server
// package; point the library there so the test does not download it again.
function useInstalledMongoBinaryCache(): void {
  if (process.env.MONGOMS_DOWNLOAD_DIR || process.env.MONGOMS_SYSTEM_BINARY) return;
  const packageDir = path.dirname(require.resolve('mongodb-memory-server/package.json'));
  const cacheDir = path.join(packageDir, '..', '.cache', 'mongodb-memory-server');
  if (fs.existsSync(cacheDir)) process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
}

test('a real connection lands in the database MONGODB_URI names', async () => {
  useInstalledMongoBinaryCache();
  const originalEnv = { ...process.env };
  const mongo = await MongoMemoryServer.create();
  try {
    process.env.MONGODB_URI = `${mongo.getUri()}separate-test-db`;
    const status = await connectDB({ production: true, attempts: 1 });
    assert.equal(status.mode, 'local');
    assert.equal(mongoose.connection.name, 'separate-test-db');
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    process.env = originalEnv;
  }
});

test('/health reports the live database connection, not only the state at startup', async () => {
  let connected = true;
  const server = await createTestServer({
    mode: 'local',
    ready: true,
    isNewDatabase: false,
    isConnected: () => connected,
  });

  try {
    const up = (await (await fetch(`${server.baseUrl}/health`)).json()) as { status: string; services: { database: string } };
    assert.equal(up.status, 'ok');

    connected = false;
    const down = (await (await fetch(`${server.baseUrl}/health`)).json()) as { status: string; services: { database: string } };
    assert.equal(down.status, 'degraded');
    assert.equal(down.services.database, 'unavailable');
  } finally {
    await server.close();
  }
});

test('the seed script refuses to run in production', () => {
  const apiDir = path.join(__dirname, '..');
  // block-mongo makes any connection attempt fail, in case the guard ever breaks.
  const result = spawnSync(process.execPath, ['-r', './tests/helpers/block-mongo.js', '-r', 'ts-node/register', 'src/seed.ts'], {
    cwd: apiDir,
    env: { ...process.env, NODE_ENV: 'production', TS_NODE_TRANSPILE_ONLY: 'true', MONGODB_URI: 'mongodb://127.0.0.1:1/never-used' },
    encoding: 'utf8',
    timeout: 60_000,
  });

  assert.equal(result.status, 1);
  assert.match(`${result.stdout}${result.stderr}`, /Refusing to run the seed script in production/);
});

test('the seed script refuses to wipe a database that already has content', () => {
  assert.match(seedRefusalReason({ nodeEnv: 'development', existingDocuments: 3 }) ?? '', /already holds 3/);
  assert.match(seedRefusalReason({ nodeEnv: undefined, existingDocuments: 1, allowWipe: 'no' }) ?? '', /SEED_ALLOW_WIPE=yes/);
  assert.equal(seedRefusalReason({ nodeEnv: 'development', existingDocuments: 0 }), undefined);
  assert.equal(seedRefusalReason({ nodeEnv: 'development', existingDocuments: 5, allowWipe: 'yes' }), undefined);
  assert.match(seedRefusalReason({ nodeEnv: 'production', existingDocuments: 0, allowWipe: 'yes' }) ?? '', /production/);
});
