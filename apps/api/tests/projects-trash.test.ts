import './setup';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Project, { INCLUDE_DELETED_PROJECTS, PROJECT_TRASH_RETENTION_SECONDS } from '../src/models/Project';
import ProjectCategory from '../src/models/ProjectCategory';
import { createTestServer, TestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson } from './helpers/contractTestHelpers';

// These tests run against a real (in-memory) MongoDB: the trash relies on query middleware,
// a TTL index and atomic updates, which mocked model statics would not exercise.

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type Row = Record<string, unknown>;

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
  // deleteMany is not filtered by the trash middleware, so this clears trashed projects too.
  await Project.deleteMany({});
  await ProjectCategory.deleteMany({});
});

async function createProject(overrides: Row = {}): Promise<string> {
  const project = await Project.create({
    title: 'Mzuzu Road Upgrade',
    category: 'Roads',
    location: 'Mzuzu',
    status: 'Ongoing',
    ...overrides,
  });
  return String(project._id);
}

async function rawProject(id: string): Promise<Row | null> {
  return Project.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
}

function trash(id: string): Promise<Response> {
  return fetch(`${baseUrl()}/api/projects/${id}`, { method: 'DELETE', headers: authHeader() });
}

test('DELETE /api/projects/:id moves the project to the trash instead of deleting it', async () => {
  const trashedId = await createProject({ title: 'Lilongwe Bridge' });
  const liveId = await createProject({ title: 'Blantyre Market' });

  const before = Date.now();
  const response = await trash(trashedId);
  const body = await readJson<{ message: string; deletedAt: string }>(response);

  assert.equal(response.status, 200);
  assert.equal(body.message, 'Project moved to trash');
  const deletedAt = new Date(body.deletedAt).getTime();
  assert.ok(deletedAt >= before - 1000 && deletedAt <= Date.now() + 1000, 'deletedAt is the time of the delete');

  // The data is still in the database.
  const stored = await rawProject(trashedId);
  assert.ok(stored, 'trashed project is kept in the database');
  assert.equal(stored.title, 'Lilongwe Bridge');
  assert.equal((stored.deletedAt as Date).toISOString(), body.deletedAt);

  // Hidden from the public list, the public detail page, the dashboard stats and the sitemap.
  const list = await readJson<Row[]>(await fetch(`${baseUrl()}/api/projects`));
  assert.deepEqual(list.map((project) => project._id), [liveId]);

  const detail = await fetch(`${baseUrl()}/api/projects/${trashedId}`);
  assert.equal(detail.status, 404);

  const stats = await readJson<{ projects: number }>(await fetch(`${baseUrl()}/api/stats`, { headers: authHeader() }));
  assert.equal(stats.projects, 1);

  const sitemap = await (await fetch(`${baseUrl()}/sitemap.xml`)).text();
  assert.equal(sitemap.includes(`/projects/${liveId}`), true);
  assert.equal(sitemap.includes(`/projects/${trashedId}`), false);

  // Listed in the trash with the date it will be removed for good.
  const trashResponse = await fetch(`${baseUrl()}/api/projects/trash`, { headers: authHeader() });
  const trashList = await readJson<Row[]>(trashResponse);
  assert.equal(trashResponse.status, 200);
  assert.equal(trashList.length, 1);
  assert.equal(trashList[0]._id, trashedId);
  assert.equal(trashList[0].title, 'Lilongwe Bridge');
  assert.equal(trashList[0].deletedAt, body.deletedAt);
  assert.equal(trashList[0].purgeAt, new Date(deletedAt + THIRTY_DAYS_MS).toISOString());
});

test('GET /api/projects/trash lists the most recently deleted first and never live projects', async () => {
  const firstId = await createProject({ title: 'First deleted' });
  const secondId = await createProject({ title: 'Second deleted' });
  await createProject({ title: 'Still live' });

  assert.equal((await trash(firstId)).status, 200);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.equal((await trash(secondId)).status, 200);

  const trashList = await readJson<Row[]>(await fetch(`${baseUrl()}/api/projects/trash`, { headers: authHeader() }));
  assert.deepEqual(trashList.map((project) => project.title), ['Second deleted', 'First deleted']);
  for (const project of trashList) {
    assert.equal(
      new Date(project.purgeAt as string).getTime() - new Date(project.deletedAt as string).getTime(),
      THIRTY_DAYS_MS
    );
  }
});

test('POST /api/projects/:id/restore brings a trashed project back unchanged', async () => {
  const id = await createProject({
    title: 'Kasungu Water Scheme',
    category: 'Government',
    status: 'Completed',
    location: 'Kasungu',
    clientName: 'Ministry of Water',
    overview: 'Boreholes and a treatment plant.',
    scopeOfWork: ['Drilling', 'Pipework'],
    technologies: ['Solar pumps'],
    coverImage: '/uploads/images/cover.jpg',
    galleryImages: ['/uploads/images/one.jpg', 'https://images.unsplash.com/photo-1?q=80&w=800'],
    coordinates: { lat: -13.03, lng: 33.48 },
  });
  const original = await readJson<Row>(await fetch(`${baseUrl()}/api/projects/${id}`));
  assert.equal(original.deletedAt, null);

  assert.equal((await trash(id)).status, 200);

  const restoreResponse = await fetch(`${baseUrl()}/api/projects/${id}/restore`, { method: 'POST', headers: authHeader() });
  const restored = await readJson<Row>(restoreResponse);
  assert.equal(restoreResponse.status, 200);
  // Every field, updatedAt included, is exactly as it was before the delete.
  assert.deepEqual(restored, original);

  assert.deepEqual(await readJson<Row>(await fetch(`${baseUrl()}/api/projects/${id}`)), original);
  const list = await readJson<Row[]>(await fetch(`${baseUrl()}/api/projects`));
  assert.deepEqual(list.map((project) => project._id), [id]);
  const trashList = await readJson<Row[]>(await fetch(`${baseUrl()}/api/projects/trash`, { headers: authHeader() }));
  assert.deepEqual(trashList, []);

  // A live project is not in the trash.
  const again = await fetch(`${baseUrl()}/api/projects/${id}/restore`, { method: 'POST', headers: authHeader() });
  assert.equal(again.status, 404);
  assert.deepEqual(await readJson(again), { message: 'Project not found in trash', code: 'NOT_FOUND' });
});

test('DELETE /api/projects/:id/permanent only deletes a project that is already in the trash', async () => {
  const id = await createProject();

  const liveResponse = await fetch(`${baseUrl()}/api/projects/${id}/permanent`, { method: 'DELETE', headers: authHeader() });
  assert.equal(liveResponse.status, 404);
  assert.deepEqual(await readJson(liveResponse), { message: 'Project not found in trash', code: 'NOT_FOUND' });
  assert.ok(await rawProject(id), 'a live project is never hard-deleted');
  assert.equal((await fetch(`${baseUrl()}/api/projects/${id}`)).status, 200);

  assert.equal((await trash(id)).status, 200);

  const permanentResponse = await fetch(`${baseUrl()}/api/projects/${id}/permanent`, { method: 'DELETE', headers: authHeader() });
  assert.equal(permanentResponse.status, 200);
  assert.deepEqual(await readJson(permanentResponse), { message: 'Project permanently deleted' });
  assert.equal(await rawProject(id), null);

  const trashList = await readJson<Row[]>(await fetch(`${baseUrl()}/api/projects/trash`, { headers: authHeader() }));
  assert.deepEqual(trashList, []);
  assert.equal((await fetch(`${baseUrl()}/api/projects/${id}/restore`, { method: 'POST', headers: authHeader() })).status, 404);
  assert.equal((await fetch(`${baseUrl()}/api/projects/${id}/permanent`, { method: 'DELETE', headers: authHeader() })).status, 404);
});

test('deleting a project twice returns 404 and keeps the first deletedAt', async () => {
  const id = await createProject();

  const first = await trash(id);
  const { deletedAt } = await readJson<{ deletedAt: string }>(first);
  assert.equal(first.status, 200);

  const second = await trash(id);
  assert.equal(second.status, 404);
  assert.deepEqual(await readJson(second), { message: 'Project not found', code: 'NOT_FOUND' });
  assert.equal(((await rawProject(id))?.deletedAt as Date).toISOString(), deletedAt);

  assert.equal((await trash('507f1f77bcf86cd799439999')).status, 404);
  assert.equal((await trash('not-an-id')).status, 404);
});

test('PUT /api/projects/:id cannot edit or resurrect a trashed project', async () => {
  const id = await createProject({ title: 'Original title' });
  assert.equal((await trash(id)).status, 200);

  const response = await jsonRequest(
    baseUrl(),
    `/api/projects/${id}`,
    'PUT',
    { title: 'Edited after delete', deletedAt: null },
    authHeader()
  );
  assert.equal(response.status, 404);

  const stored = await rawProject(id);
  assert.equal(stored?.title, 'Original title');
  assert.ok(stored?.deletedAt instanceof Date, 'project stays in the trash');
  assert.equal((await fetch(`${baseUrl()}/api/projects/${id}`)).status, 404);

  // The dashboard form cannot move a live project to the trash through PUT either.
  const liveId = await createProject();
  const liveUpdate = await jsonRequest(baseUrl(), `/api/projects/${liveId}`, 'PUT', { title: 'Renamed', deletedAt: '2020-01-01' }, authHeader());
  assert.equal(liveUpdate.status, 200);
  assert.equal((await rawProject(liveId))?.deletedAt, null);
});

test('trashed projects expire through a 30-day TTL index on deletedAt', async () => {
  assert.equal(PROJECT_TRASH_RETENTION_SECONDS, 2592000);

  const indexes = await Project.collection.indexes();
  const ttlIndex = indexes.find((index) => {
    const keys = Object.keys(index.key);
    return keys.length === 1 && keys[0] === 'deletedAt';
  });
  assert.ok(ttlIndex, 'deletedAt index exists');
  assert.equal(ttlIndex.key.deletedAt, 1);
  assert.equal(ttlIndex.expireAfterSeconds, 2592000);
});

test('the Project model hides trashed projects unless the query asks for them', async () => {
  const liveId = await createProject({ title: 'Live' });
  const trashedId = await createProject({ title: 'Trashed', deletedAt: new Date() });
  // A project saved before the trash existed has no deletedAt field at all: still live.
  await Project.collection.insertOne({ title: 'Legacy', category: 'Roads', location: 'Zomba' });

  assert.equal(await Project.countDocuments(), 2);
  assert.equal(await Project.countDocuments({}, INCLUDE_DELETED_PROJECTS), 3);
  assert.equal(await Project.findById(trashedId), null);
  assert.equal((await Project.findById(trashedId).setOptions({ includeDeleted: true }))?.title, 'Trashed');
  assert.deepEqual((await Project.find().sort({ title: 1 })).map((project) => project.title), ['Legacy', 'Live']);
  assert.deepEqual((await Project.find({ deletedAt: { $ne: null } })).map((project) => String(project._id)), [trashedId]);

  const updated = await Project.updateMany({}, { $set: { clientName: 'Updated' } });
  assert.equal(updated.modifiedCount, 2);
  assert.equal((await rawProject(trashedId))?.clientName, '');
  assert.equal((await rawProject(liveId))?.clientName, 'Updated');
});

test('a category used only by a trashed project is disabled, not deleted', async () => {
  const category = await ProjectCategory.create({ name: 'Healthcare', slug: 'healthcare' });
  const projectId = await createProject({ category: 'Healthcare' });
  assert.equal((await trash(projectId)).status, 200);

  const response = await fetch(`${baseUrl()}/api/project-categories/${category._id}`, { method: 'DELETE', headers: authHeader() });
  const body = await readJson<{ message: string }>(response);
  assert.equal(response.status, 200);
  assert.equal(body.message, 'Category disabled because it is used by projects');

  const stored = await ProjectCategory.findById(category._id);
  assert.ok(stored, 'category is kept');
  assert.equal(stored.isActive, false);

  const restored = await readJson<Row>(
    await fetch(`${baseUrl()}/api/projects/${projectId}/restore`, { method: 'POST', headers: authHeader() })
  );
  assert.equal(restored.category, 'Healthcare');

  // A category no project uses, live or trashed, is still deleted.
  const unused = await ProjectCategory.create({ name: 'Unused', slug: 'unused' });
  const unusedResponse = await fetch(`${baseUrl()}/api/project-categories/${unused._id}`, { method: 'DELETE', headers: authHeader() });
  assert.deepEqual(await readJson(unusedResponse), { message: 'Category deleted' });
  assert.equal(await ProjectCategory.findById(unused._id), null);
});

test('renaming a category also renames trashed projects so a restore keeps a valid category', async () => {
  const category = await ProjectCategory.create({ name: 'Water', slug: 'water' });
  const liveId = await createProject({ category: 'Water' });
  const trashedId = await createProject({ category: 'Water' });
  assert.equal((await trash(trashedId)).status, 200);

  const response = await jsonRequest(
    baseUrl(),
    `/api/project-categories/${category._id}`,
    'PUT',
    { name: 'Water Supply' },
    authHeader()
  );
  assert.equal(response.status, 200);

  assert.equal((await rawProject(liveId))?.category, 'Water Supply');
  assert.equal((await rawProject(trashedId))?.category, 'Water Supply');
  assert.ok((await rawProject(trashedId))?.deletedAt instanceof Date, 'rename does not restore the project');

  const restored = await readJson<Row>(
    await fetch(`${baseUrl()}/api/projects/${trashedId}/restore`, { method: 'POST', headers: authHeader() })
  );
  assert.equal(restored.category, 'Water Supply');
});

test('trash, restore and permanent delete require an admin token', async () => {
  const id = await createProject();
  const requests: Array<[string, string]> = [
    ['DELETE', `/api/projects/${id}`],
    ['GET', '/api/projects/trash'],
    ['POST', `/api/projects/${id}/restore`],
    ['DELETE', `/api/projects/${id}/permanent`],
  ];

  for (const [method, url] of requests) {
    const missing = await fetch(`${baseUrl()}${url}`, { method });
    assert.equal(missing.status, 401, `${method} ${url} without a token`);
    const invalid = await fetch(`${baseUrl()}${url}`, { method, headers: { Authorization: 'Bearer not-a-real-token' } });
    assert.equal(invalid.status, 401, `${method} ${url} with an invalid token`);
  }

  const stored = await rawProject(id);
  assert.equal(stored?.deletedAt, null);
});
