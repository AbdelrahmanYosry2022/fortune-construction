import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import Project from '../src/models/Project';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { projectFixture } from './helpers/projectIntegrationTestHelpers';
import { readJson, replaceStatic, restoreAll, sortedResult } from './helpers/contractTestHelpers';

test('projects public reads and dashboard writes preserve response shapes and string category contract', async () => {
  const project = projectFixture({ category: 'Roads' });
  const updated = projectFixture({ title: 'Updated Road', category: 'Bridges' });
  const created = projectFixture({ _id: '507f1f77bcf86cd799439202', title: 'New Road', category: 'Roads' });
  const restores = [
    replaceStatic(Project, 'find', () => sortedResult([project])),
    replaceStatic(Project, 'findById', async () => project),
    replaceStatic(Project, 'create', async (body: object) => ({ ...created, ...body })),
    replaceStatic(Project, 'findByIdAndUpdate', async (_id: string, body: { $set?: object }) => ({ ...updated, ...body, ...body.$set })),
  ];
  const server = await createTestServer();

  try {
    const listResponse = await fetch(`${server.baseUrl}/api/projects`);
    const list = await readJson<Array<Record<string, unknown>>>(listResponse);
    assert.equal(listResponse.status, 200);
    assert.equal(Array.isArray(list), true);
    assert.equal(list[0].category, 'Roads');
    assert.equal(typeof list[0].category, 'string');
    assert.equal('categoryId' in list[0], false);

    const detailResponse = await fetch(`${server.baseUrl}/api/projects/${project._id}`);
    const detail = await readJson<Record<string, unknown>>(detailResponse);
    assert.equal(detailResponse.status, 200);
    assert.equal(detail._id, project._id);
    assert.equal(detail.category, 'Roads');

    const createResponse = await jsonRequest(server.baseUrl, '/api/projects', 'POST', { title: 'New Road', category: 'Roads', location: 'Mzuzu' }, authHeader());
    const createBody = await readJson<Record<string, unknown>>(createResponse);
    assert.equal(createResponse.status, 201);
    assert.equal(createBody.title, 'New Road');
    assert.equal(createBody.category, 'Roads');

    const updateResponse = await jsonRequest(server.baseUrl, `/api/projects/${project._id}`, 'PUT', { title: 'Updated Road', category: 'Bridges' }, authHeader());
    const updateBody = await readJson<Record<string, unknown>>(updateResponse);
    assert.equal(updateResponse.status, 200);
    assert.equal(updateBody.title, 'Updated Road');
    assert.equal(updateBody.category, 'Bridges');

    const deleteResponse = await fetch(`${server.baseUrl}/api/projects/${project._id}`, { method: 'DELETE', headers: authHeader() });
    // DELETE moves the project to the trash (restorable for 30 days) instead of deleting it.
    const deleteBody = await readJson<Record<string, unknown>>(deleteResponse);
    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteBody.message, 'Project moved to trash');
    assert.equal(typeof deleteBody.deletedAt, 'string');
  } finally {
    await server.close();
    restoreAll(restores);
  }
});
