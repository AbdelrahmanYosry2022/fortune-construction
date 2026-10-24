import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import SiteSettings from '../src/models/SiteSettings';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson, replaceStatic, restoreAll } from './helpers/contractTestHelpers';

// Only the driver-level collection calls are faked, so the real model runs:
// its defaults, trimming, email validator and update-validator hook are all exercised.

type Row = Record<string, unknown>;

interface SettingsBody {
  phone?: string;
  email?: string;
}

interface ErrorBody {
  code: string;
  details?: Array<{ field?: string; message: string }>;
}

function fakeSettingsCollection(initial: Row | null) {
  const state: { row: Row | null; writes: number } = { row: initial ? { ...initial } : null, writes: 0 };
  const restores = [
    replaceStatic(SiteSettings.collection, 'findOne', async () => (state.row ? { ...state.row } : null)),
    replaceStatic(SiteSettings.collection, 'insertOne', async (doc: Row) => {
      state.writes += 1;
      state.row = { ...doc };
      return { acknowledged: true, insertedId: doc._id };
    }),
    replaceStatic(SiteSettings.collection, 'findOneAndUpdate', async (_filter: Row, update: { $set?: Row }) => {
      state.writes += 1;
      state.row = { ...(state.row || {}), ...(update.$set || {}) };
      return { ...state.row };
    }),
  ];
  return { state, restore: () => restoreAll(restores) };
}

const existingSettings = {
  _id: '507f1f77bcf86cd799439801',
  companyName: 'Fortune Construction',
  phone: '+265 999 000 111',
  email: 'office@example.test',
};

test('new site settings start with empty phone and email instead of placeholder values', async () => {
  const fake = fakeSettingsCollection(null);
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/settings`);
    const body = await readJson<SettingsBody>(response);

    assert.equal(response.status, 200);
    assert.equal(body.phone, '');
    assert.equal(body.email, '');
  } finally {
    await server.close();
    fake.restore();
  }
});

test('settings update with empty phone and email succeeds', async () => {
  const fake = fakeSettingsCollection(existingSettings);
  const server = await createTestServer();

  try {
    const response = await jsonRequest(
      server.baseUrl,
      '/api/settings',
      'PUT',
      { companyName: 'Fortune Construction', phone: '', email: '' },
      authHeader()
    );
    const body = await readJson<SettingsBody>(response);

    assert.equal(response.status, 200);
    assert.equal(body.phone, '');
    assert.equal(body.email, '');
    assert.equal(fake.state.row?.phone, '');
    assert.equal(fake.state.row?.email, '');
  } finally {
    await server.close();
    fake.restore();
  }
});

test('first settings save with empty phone and email succeeds', async () => {
  const fake = fakeSettingsCollection(null);
  const server = await createTestServer();

  try {
    const response = await jsonRequest(server.baseUrl, '/api/settings', 'PUT', { phone: '', email: '' }, authHeader());
    const body = await readJson<SettingsBody>(response);

    assert.equal(response.status, 200);
    assert.equal(body.phone, '');
    assert.equal(body.email, '');
    assert.equal(fake.state.writes, 1);
  } finally {
    await server.close();
    fake.restore();
  }
});

test('settings update with a valid email saves it trimmed', async () => {
  const fake = fakeSettingsCollection(existingSettings);
  const server = await createTestServer();

  try {
    const response = await jsonRequest(
      server.baseUrl,
      '/api/settings',
      'PUT',
      { email: '  info@example.test  ' },
      authHeader()
    );

    assert.equal(response.status, 200);
    assert.equal(fake.state.row?.email, 'info@example.test');
  } finally {
    await server.close();
    fake.restore();
  }
});

test('settings update with an invalid non-empty email fails and keeps the saved email', async () => {
  const fake = fakeSettingsCollection(existingSettings);
  const server = await createTestServer();

  try {
    const response = await jsonRequest(server.baseUrl, '/api/settings', 'PUT', { email: 'not-an-email' }, authHeader());
    const body = await readJson<ErrorBody>(response);

    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.deepEqual(body.details, [{ field: 'email', message: 'email must be valid' }]);
    assert.equal(fake.state.writes, 0);
    assert.equal(fake.state.row?.email, 'office@example.test');
  } finally {
    await server.close();
    fake.restore();
  }
});

test('first settings save with an invalid non-empty email fails', async () => {
  const fake = fakeSettingsCollection(null);
  const server = await createTestServer();

  try {
    const response = await jsonRequest(server.baseUrl, '/api/settings', 'PUT', { email: 'not-an-email' }, authHeader());
    const body = await readJson<ErrorBody>(response);

    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.deepEqual(body.details, [{ field: 'email', message: 'email must be valid' }]);
    assert.equal(fake.state.writes, 0);
  } finally {
    await server.close();
    fake.restore();
  }
});
