import './setup';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader } from './helpers/uploadTestHelpers';
import ContactMessage from '../src/models/ContactMessage';
import { LOGIN_FAILURES_PER_WINDOW, PUBLIC_SUBMISSIONS_PER_HOUR, resolveTrustProxy } from '../src/middleware/rateLimits';
import { replaceStatic, restoreAll } from './helpers/contractTestHelpers';

const remaining = (response: Response) => Number(response.headers.get('x-ratelimit-remaining'));

test('uploaded images are served without using the rate limit', async () => {
  const imageDir = path.join(__dirname, '..', 'uploads', 'images');
  fs.mkdirSync(imageDir, { recursive: true });
  const fileName = `rate-limit-test-${process.pid}.png`;
  const filePath = path.join(imageDir, fileName);
  fs.writeFileSync(filePath, 'image-bytes');
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/uploads/images/${fileName}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-ratelimit-remaining'), null);
    assert.match(response.headers.get('cache-control') ?? '', /max-age=604800/);
  } finally {
    await server.close();
    fs.rmSync(filePath, { force: true });
  }
});

test('each visitor behind the local proxy gets a separate limit', async () => {
  const server = await createTestServer();

  try {
    const first = await fetch(`${server.baseUrl}/health`, { headers: { 'X-Forwarded-For': '203.0.113.10' } });
    const firstAgain = await fetch(`${server.baseUrl}/health`, { headers: { 'X-Forwarded-For': '203.0.113.10' } });
    const second = await fetch(`${server.baseUrl}/health`, { headers: { 'X-Forwarded-For': '203.0.113.20' } });

    assert.equal(remaining(firstAgain), remaining(first) - 1);
    assert.equal(remaining(second), remaining(first), 'a different visitor starts with a full limit');
  } finally {
    await server.close();
  }
});

test('a visitor cannot dodge the limit by faking X-Forwarded-For entries', async () => {
  const server = await createTestServer();

  try {
    // nginx appends the real client IP last; anything before it is client-controlled.
    const a = await fetch(`${server.baseUrl}/health`, { headers: { 'X-Forwarded-For': '198.51.100.1, 203.0.113.30' } });
    const b = await fetch(`${server.baseUrl}/health`, { headers: { 'X-Forwarded-For': '198.51.100.2, 203.0.113.30' } });

    assert.equal(remaining(b), remaining(a) - 1);
  } finally {
    await server.close();
  }
});

test('signed-in admins skip the limit, made-up tokens do not', async () => {
  const server = await createTestServer();

  try {
    const admin = await fetch(`${server.baseUrl}/health`, { headers: { Authorization: authHeader() } });
    assert.equal(admin.headers.get('x-ratelimit-remaining'), null);

    const fake = await fetch(`${server.baseUrl}/health`, { headers: { Authorization: 'Bearer not-a-real-token' } });
    assert.ok(Number.isFinite(remaining(fake)), 'an invalid token is still rate limited');
  } finally {
    await server.close();
  }
});

test('repeated failed logins are blocked', async () => {
  const server = await createTestServer();
  const attempt = () =>
    fetch(`${server.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.40' },
      body: JSON.stringify({ username: '', password: '' }),
    });

  try {
    for (let i = 0; i < LOGIN_FAILURES_PER_WINDOW; i += 1) {
      const response = await attempt();
      assert.equal(response.status, 400);
    }

    const blocked = await attempt();
    const body = (await blocked.json()) as { code?: string };
    assert.equal(blocked.status, 429);
    assert.equal(body.code, 'LOGIN_RATE_LIMITED');
  } finally {
    await server.close();
  }
});

test('applicant CVs are served with no caching', async () => {
  const cvDir = path.join(__dirname, '..', 'uploads', 'cvs');
  fs.mkdirSync(cvDir, { recursive: true });
  const fileName = `rate-limit-test-${process.pid}.pdf`;
  const filePath = path.join(cvDir, fileName);
  fs.writeFileSync(filePath, 'cv-bytes');
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/uploads/cvs/${fileName}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  } finally {
    await server.close();
    fs.rmSync(filePath, { force: true });
  }
});

test('public form submissions are limited per visitor', async () => {
  const restores = [replaceStatic(ContactMessage, 'create', async (body: object) => body)];
  const server = await createTestServer();
  const submit = (ip: string) =>
    fetch(`${server.baseUrl}/api/messages/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
      body: JSON.stringify({ name: 'Visitor', email: 'visitor@example.com', message: 'Hello' }),
    });

  try {
    for (let i = 0; i < PUBLIC_SUBMISSIONS_PER_HOUR; i += 1) {
      assert.equal((await submit('203.0.113.50')).status, 201);
    }
    const blocked = await submit('203.0.113.50');
    assert.equal(blocked.status, 429);
    assert.equal(((await blocked.json()) as { code?: string }).code, 'SUBMISSION_RATE_LIMITED');

    assert.equal((await submit('203.0.113.51')).status, 201, 'another visitor is not affected');
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('TRUST_PROXY defaults to the local proxy and accepts other setups', () => {
  assert.equal(resolveTrustProxy(undefined), 'loopback');
  assert.equal(resolveTrustProxy('  '), 'loopback');
  assert.equal(resolveTrustProxy('1'), 1);
  assert.equal(resolveTrustProxy('false'), false);
  assert.equal(resolveTrustProxy('10.0.0.0/8'), '10.0.0.0/8');
});
