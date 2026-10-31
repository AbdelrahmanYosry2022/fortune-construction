import './setup';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Project from '../src/models/Project';
import { createTestServer, TestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson } from './helpers/contractTestHelpers';

// Real (in-memory) MongoDB: the point of these endpoints is that concurrent writes made with
// atomic operators do not lose each other's images, which mocked model statics cannot show.

type Row = Record<string, unknown>;

interface ValidationErrorBody {
  message: string;
  code: string;
  details?: Array<{ field?: string; message: string }>;
}

let mongo: MongoMemoryServer | undefined;
let server: TestServer | undefined;

// In this workspace the MongoDB binary is cached next to the hoisted mongodb-memory-server
// package; point the library there so the tests do not try to download it again.
function useInstalledMongoBinaryCache(): void {
  if (process.env.MONGOMS_DOWNLOAD_DIR || process.env.MONGOMS_SYSTEM_BINARY) return;
  const packageDir = path.dirname(require.resolve('mongodb-memory-server/package.json'));
  const cacheDir = path.join(packageDir, '..', '.cache', 'mongodb-memory-server');
  if (fs.existsSync(cacheDir)) process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
}

function baseUrl(): string {
  if (!server) throw new Error('Test server is not running');
  return server.baseUrl;
}

before(async () => {
  useInstalledMongoBinaryCache();
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Project.init();
  server = await createTestServer();
});

after(async () => {
  await server?.close();
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
});

async function createProject(overrides: Row = {}): Promise<string> {
  const project = await Project.create({
    title: 'Mzuzu Road Upgrade',
    category: 'Roads',
    location: 'Mzuzu',
    ...overrides,
  });
  return String(project._id);
}

async function storedGallery(id: string): Promise<string[] | undefined> {
  const stored = await Project.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
  return stored?.galleryImages as string[] | undefined;
}

function addImages(id: string, body: unknown, headers: Record<string, string> = authHeader()): Promise<Response> {
  return jsonRequest(baseUrl(), `/api/projects/${id}/gallery`, 'POST', body as object, headers);
}

function removeImage(id: string, body: unknown, headers: Record<string, string> = authHeader()): Promise<Response> {
  return jsonRequest(baseUrl(), `/api/projects/${id}/gallery`, 'DELETE', body as object, headers);
}

test('POST /api/projects/:id/gallery appends images in order and skips duplicates', async () => {
  const id = await createProject({ galleryImages: ['/uploads/images/a.jpg'], overview: 'Keep me' });

  const response = await addImages(id, {
    urls: [
      '/uploads/images/b.jpg',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800',
      '/uploads/images/a.jpg',
      '/uploads/images/b.jpg',
    ],
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await readJson(response), {
    galleryImages: [
      '/uploads/images/a.jpg',
      '/uploads/images/b.jpg',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800',
    ],
  });

  const next = await addImages(id, { urls: ['/uploads/images/c.jpg'] });
  assert.deepEqual(await readJson(next), {
    galleryImages: [
      '/uploads/images/a.jpg',
      '/uploads/images/b.jpg',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800',
      '/uploads/images/c.jpg',
    ],
  });

  assert.deepEqual(await storedGallery(id), [
    '/uploads/images/a.jpg',
    '/uploads/images/b.jpg',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800',
    '/uploads/images/c.jpg',
  ]);
  const project = await readJson<Row>(await fetch(`${baseUrl()}/api/projects/${id}`));
  assert.equal(project.overview, 'Keep me');
  assert.equal(project.title, 'Mzuzu Road Upgrade');
});

test('POST /api/projects/:id/gallery rejects bad image URLs with a 400 that names the field', async () => {
  const id = await createProject({ galleryImages: ['/uploads/images/a.jpg'] });
  const tooMany = Array.from({ length: 51 }, (_, index) => `/uploads/images/${index}.jpg`);
  const badBodies: Array<[unknown, string]> = [
    [{}, 'urls'],
    [{ urls: [] }, 'urls'],
    [{ urls: '/uploads/images/b.jpg' }, 'urls'],
    [{ urls: tooMany }, 'urls'],
    [{ urls: ['javascript:alert(1)'] }, 'urls.0'],
    [{ urls: ['/uploads/images/ok.jpg', 'data:image/png;base64,AAAA'] }, 'urls.1'],
    [{ urls: ['//evil.example/x.jpg'] }, 'urls.0'],
    [{ urls: ['uploads/images/relative.jpg'] }, 'urls.0'],
    [{ urls: ['ftp://example.com/x.jpg'] }, 'urls.0'],
    [{ urls: ['/uploads/images/with space.jpg'] }, 'urls.0'],
    [{ urls: [''] }, 'urls.0'],
    [{ urls: [42] }, 'urls.0'],
    [{ urls: [`/uploads/${'x'.repeat(2100)}.jpg`] }, 'urls.0'],
  ];

  for (const [body, field] of badBodies) {
    const response = await addImages(id, body);
    const errorBody = await readJson<ValidationErrorBody>(response);
    assert.equal(response.status, 400, `${JSON.stringify(body).slice(0, 80)} is rejected`);
    assert.equal(errorBody.code, 'VALIDATION_ERROR');
    assert.ok(
      errorBody.details?.some((detail) => detail.field === field),
      `${JSON.stringify(body).slice(0, 80)} names ${field}: ${JSON.stringify(errorBody.details)}`
    );
  }

  assert.deepEqual(await storedGallery(id), ['/uploads/images/a.jpg']);

  // The largest allowed batch still works.
  const fifty = tooMany.slice(0, 50);
  const ok = await addImages(id, { urls: fifty });
  assert.equal(ok.status, 200);
  assert.equal((await storedGallery(id))?.length, 51);
});

test('20 concurrent single-image uploads all end up in the gallery', async () => {
  const id = await createProject({ galleryImages: ['/uploads/images/existing.jpg'] });
  const urls = Array.from({ length: 20 }, (_, index) => `/uploads/images/concurrent-${index}.jpg`);

  const responses = await Promise.all(urls.map((url) => addImages(id, { urls: [url] })));
  assert.deepEqual(responses.map((response) => response.status), urls.map(() => 200));

  const gallery = await storedGallery(id);
  assert.equal(gallery?.length, 21);
  assert.equal(gallery?.[0], '/uploads/images/existing.jpg');
  assert.deepEqual([...(gallery || [])].sort(), ['/uploads/images/existing.jpg', ...urls].sort());
});

test('DELETE /api/projects/:id/gallery removes one image and keeps the rest in order', async () => {
  const id = await createProject({
    galleryImages: ['/uploads/images/a.jpg', '/uploads/images/b.jpg', '/uploads/images/c.jpg', 'legacy image.jpg'],
  });

  const response = await removeImage(id, { url: '/uploads/images/b.jpg' });
  assert.equal(response.status, 200);
  assert.deepEqual(await readJson(response), {
    galleryImages: ['/uploads/images/a.jpg', '/uploads/images/c.jpg', 'legacy image.jpg'],
  });

  // Removing an image that is not there changes nothing.
  const missing = await removeImage(id, { url: '/uploads/images/zzz.jpg' });
  assert.equal(missing.status, 200);
  assert.deepEqual(await readJson(missing), {
    galleryImages: ['/uploads/images/a.jpg', '/uploads/images/c.jpg', 'legacy image.jpg'],
  });

  // An old entry that would not pass today's URL rules can still be removed.
  const legacy = await removeImage(id, { url: 'legacy image.jpg' });
  assert.deepEqual(await readJson(legacy), { galleryImages: ['/uploads/images/a.jpg', '/uploads/images/c.jpg'] });

  for (const body of [{}, { url: '' }, { url: 42 }]) {
    const bad = await removeImage(id, body);
    const errorBody = await readJson<ValidationErrorBody>(bad);
    assert.equal(bad.status, 400);
    assert.equal(errorBody.code, 'VALIDATION_ERROR');
    assert.ok(errorBody.details?.some((detail) => detail.field === 'url'));
  }

  assert.deepEqual(await storedGallery(id), ['/uploads/images/a.jpg', '/uploads/images/c.jpg']);
});

test('gallery changes return 404 for a missing or trashed project and leave the trash alone', async () => {
  const id = await createProject({ galleryImages: ['/uploads/images/a.jpg'] });
  const trashResponse = await fetch(`${baseUrl()}/api/projects/${id}`, { method: 'DELETE', headers: authHeader() });
  assert.equal(trashResponse.status, 200);

  const add = await addImages(id, { urls: ['/uploads/images/b.jpg'] });
  assert.equal(add.status, 404);
  assert.deepEqual(await readJson(add), { message: 'Project not found', code: 'NOT_FOUND' });

  const remove = await removeImage(id, { url: '/uploads/images/a.jpg' });
  assert.equal(remove.status, 404);

  assert.deepEqual(await storedGallery(id), ['/uploads/images/a.jpg']);

  assert.equal((await addImages('507f1f77bcf86cd799439999', { urls: ['/uploads/images/b.jpg'] })).status, 404);
  assert.equal((await addImages('not-an-id', { urls: ['/uploads/images/b.jpg'] })).status, 404);
  assert.equal((await removeImage('507f1f77bcf86cd799439999', { url: '/uploads/images/b.jpg' })).status, 404);
});

test('gallery routes require an admin token', async () => {
  const id = await createProject({ galleryImages: ['/uploads/images/a.jpg'] });

  const unauthenticated: Array<Record<string, string>> = [{}, { Authorization: 'Bearer not-a-real-token' }];
  for (const headers of unauthenticated) {
    const add = await addImages(id, { urls: ['/uploads/images/b.jpg'] }, headers);
    assert.equal(add.status, 401);
    // Authentication is checked before the body, so an invalid body is still a 401.
    const invalidAdd = await addImages(id, { urls: 'nope' }, headers);
    assert.equal(invalidAdd.status, 401);
    const remove = await removeImage(id, { url: '/uploads/images/a.jpg' }, headers);
    assert.equal(remove.status, 401);
  }

  assert.deepEqual(await storedGallery(id), ['/uploads/images/a.jpg']);
});

// PUT /api/projects/:id and the gallery. The dashboard saves an existing project without
// galleryImages and changes photos only through /:id/gallery, so a form opened earlier (another
// tab, another admin, the coming dashboard) cannot drop photos added meanwhile. A PUT that does
// carry galleryImages still replaces the whole stored list: legacy behaviour, kept for old clients.

const THREE_PHOTOS = ['/uploads/images/one.jpg', '/uploads/images/two.jpg', '/uploads/images/three.jpg'];

function updateProject(id: string, body: Row): Promise<Response> {
  return jsonRequest(baseUrl(), `/api/projects/${id}`, 'PUT', body, authHeader());
}

async function createProjectThroughApi(body: Row): Promise<string> {
  const response = await jsonRequest(baseUrl(), '/api/projects', 'POST', body, authHeader());
  assert.equal(response.status, 201);
  const created = await readJson<Row>(response);
  return String(created._id);
}

test('PUT /api/projects/:id without galleryImages leaves the stored gallery exactly as it is', async () => {
  // A new project still gets its photos from the create request.
  const id = await createProjectThroughApi({
    title: 'Mzuzu Road Upgrade',
    category: 'Roads',
    location: 'Mzuzu',
    galleryImages: THREE_PHOTOS,
  });
  assert.deepEqual(await storedGallery(id), THREE_PHOTOS);

  const titleOnly = await updateProject(id, { title: 'Mzuzu Road Upgrade, Phase 2' });
  assert.equal(titleOnly.status, 200);
  const updated = await readJson<Row>(titleOnly);
  assert.equal(updated.title, 'Mzuzu Road Upgrade, Phase 2');
  assert.deepEqual(updated.galleryImages, THREE_PHOTOS);
  assert.deepEqual(await storedGallery(id), THREE_PHOTOS);

  // The full body the dashboard sends when saving an existing project (no galleryImages key;
  // empty fields come through as "" or are left out by JSON).
  const fullForm = await updateProject(id, {
    title: 'Mzuzu Road Upgrade, Phase 2',
    category: 'Roads',
    status: 'Completed',
    location: 'Mzuzu',
    clientName: '',
    projectValue: 15000000,
    duration: '',
    overview: 'Resurfacing and drainage.',
    scopeOfWork: ['Asphalt surfacing'],
    technologies: [],
    coverImage: '/uploads/images/cover.jpg',
    challenge: '',
    solution: '',
    result: '',
    galleryImages: undefined,
    coordinates: {},
  });
  assert.equal(fullForm.status, 200);
  assert.deepEqual((await readJson<Row>(fullForm)).galleryImages, THREE_PHOTOS);
  assert.deepEqual(await storedGallery(id), THREE_PHOTOS);
  const stored = await Project.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
  assert.equal(stored?.coverImage, '/uploads/images/cover.jpg');
  assert.equal(stored?.status, 'Completed');
});

test('a photo added through POST /gallery survives a later PUT without galleryImages', async () => {
  const id = await createProject({ galleryImages: THREE_PHOTOS, overview: 'Before' });

  // Someone adds a photo while another form, opened before that, is still being edited.
  const added = await addImages(id, { urls: ['/uploads/images/four.jpg'] });
  assert.equal(added.status, 200);

  const save = await updateProject(id, { title: 'Renamed from an old form', overview: 'After' });
  assert.equal(save.status, 200);
  assert.deepEqual((await readJson<Row>(save)).galleryImages, [...THREE_PHOTOS, '/uploads/images/four.jpg']);
  assert.deepEqual(await storedGallery(id), [...THREE_PHOTOS, '/uploads/images/four.jpg']);

  // A removal made through DELETE /gallery is not undone by the next save either.
  assert.equal((await removeImage(id, { url: '/uploads/images/two.jpg' })).status, 200);
  assert.equal((await updateProject(id, { overview: 'Saved again' })).status, 200);
  assert.deepEqual(await storedGallery(id), ['/uploads/images/one.jpg', '/uploads/images/three.jpg', '/uploads/images/four.jpg']);
});

test('legacy: PUT /api/projects/:id with galleryImages still replaces the stored list', async () => {
  const id = await createProject({ galleryImages: THREE_PHOTOS });

  const replaced = await updateProject(id, { galleryImages: ['/uploads/images/two.jpg', '/uploads/images/new.jpg'] });
  assert.equal(replaced.status, 200);
  assert.deepEqual((await readJson<Row>(replaced)).galleryImages, ['/uploads/images/two.jpg', '/uploads/images/new.jpg']);
  assert.deepEqual(await storedGallery(id), ['/uploads/images/two.jpg', '/uploads/images/new.jpg']);

  // An explicit empty list still clears the gallery, as it always has.
  assert.equal((await updateProject(id, { galleryImages: [] })).status, 200);
  assert.deepEqual(await storedGallery(id), []);
});
