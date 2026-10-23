import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Project from '../src/models/Project';
import ContactMessage from '../src/models/ContactMessage';
import { createTestServer } from './helpers/appTestHarness';
import { readJson, replaceStatic, restoreAll } from './helpers/contractTestHelpers';

// Before the fix, an async route that rejected (e.g. a malformed id) was not caught by
// Express 4, the Node process exited, and every in-flight upload died with it.

test('a malformed project id returns 404 instead of crashing the API', async () => {
  const restores = [
    replaceStatic(Project, 'findById', async (id: string) => {
      throw new mongoose.Error.CastError('ObjectId', id, '_id');
    }),
  ];
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/projects/not-an-id`);
    assert.equal(response.status, 404);
    assert.equal((await readJson<{ code?: string }>(response)).code, 'NOT_FOUND');

    const stillAlive = await fetch(`${server.baseUrl}/health`);
    assert.equal(stillAlive.status, 200);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('an unexpected database error in a public route returns 500 and the API keeps running', async () => {
  const restores = [
    replaceStatic(Project, 'find', () => {
      throw new Error('database unavailable');
    }),
  ];
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/projects`);
    assert.equal(response.status, 500);
    assert.equal((await readJson<{ code?: string }>(response)).code, 'INTERNAL_ERROR');

    const stillAlive = await fetch(`${server.baseUrl}/health`);
    assert.equal(stillAlive.status, 200);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('an invalid contact message returns 400 with the missing fields', async () => {
  const restores = [
    replaceStatic(ContactMessage, 'create', async (body: Record<string, unknown>) => {
      await new ContactMessage(body).validate();
      return body;
    }),
  ];
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/messages/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const body = await readJson<{ code?: string; details?: Array<{ field?: string }> }>(response);
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok((body.details ?? []).length > 0);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('a wrong value type in any other field returns 400 naming the field', async () => {
  const restores = [
    replaceStatic(Project, 'find', () => {
      throw new mongoose.Error.CastError('Number', 'abc', 'yearCompleted');
    }),
  ];
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/projects`);
    const body = await readJson<{ code?: string; details?: Array<{ field?: string }> }>(response);
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.equal(body.details?.[0]?.field, 'yearCompleted');
  } finally {
    await server.close();
    restoreAll(restores);
  }
});
