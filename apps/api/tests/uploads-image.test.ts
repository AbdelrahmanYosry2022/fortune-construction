import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader, filePart, oversizedFilePart, postMultipart } from './helpers/uploadTestHelpers';

interface UploadBody {
  url?: string;
  type?: string;
  code?: string;
  details?: Array<{ field?: string; message: string }>;
}

test('image upload accepts valid image MIME and extension with sanitized filename', async () => {
  const server = await createTestServer();
  const form = new FormData();
  form.append('image', filePart('image-bytes', 'image/png'), '../../My Unsafe Image.png');

  try {
    const response = await postMultipart(server.baseUrl, '/api/upload', form, authHeader());
    const body = (await response.json()) as UploadBody;

    assert.equal(response.status, 200);
    assert.equal(body.type, 'image');
    assert.match(body.url ?? '', /^\/uploads\/images\/[a-z0-9-]+\.png$/);
    assert.equal(body.url?.includes('..'), false);
    assert.equal(body.url?.includes(' '), false);
  } finally {
    await server.close();
  }
});

test('image upload rejects mismatched MIME and extension', async () => {
  const server = await createTestServer();
  const form = new FormData();
  form.append('image', filePart('not-image', 'text/plain'), 'fake.png');

  try {
    const response = await postMultipart(server.baseUrl, '/api/upload', form, authHeader());
    const body = (await response.json()) as UploadBody;

    assert.equal(response.status, 400);
    assert.equal(body.code, 'UPLOAD_VALIDATION_ERROR');
    assert.match(body.details?.[0]?.message ?? '', /Unsupported file type/);
  } finally {
    await server.close();
  }
});

test('image upload rejects files over the configured image size limit', async () => {
  const server = await createTestServer();
  const form = new FormData();
  form.append('image', oversizedFilePart(10 * 1024 * 1024 + 1, 'image/png'), 'large.png');

  try {
    const response = await postMultipart(server.baseUrl, '/api/upload', form, authHeader());
    const body = (await response.json()) as UploadBody;

    assert.equal(response.status, 400);
    assert.equal(body.code, 'UPLOAD_VALIDATION_ERROR');
    assert.equal(body.details?.[0]?.message, 'File is too large (max 10 MB)');
  } finally {
    await server.close();
  }
});
