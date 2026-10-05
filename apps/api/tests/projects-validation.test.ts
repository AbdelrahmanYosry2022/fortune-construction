import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import Project from '../src/models/Project';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson, replaceStatic, restoreAll } from './helpers/contractTestHelpers';

test('project writes reject invalid timelines and non-numeric commercial fields', async () => {
  const restores = [
    replaceStatic(Project, 'create', async (body: object) => ({ _id: '507f1f77bcf86cd799439301', ...body })),
    replaceStatic(Project, 'findByIdAndUpdate', async (_id: string, body: object) => ({ _id, ...body })),
  ];
  const server = await createTestServer();

  try {
    const invalidDateResponse = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      {
        title: 'Invalid Project',
        category: 'Roads',
        location: 'Lilongwe',
        startDate: '2026-08-01',
        endDate: '2026-07-01',
      },
      authHeader()
    );
    const invalidDateBody = await readJson<Record<string, unknown>>(invalidDateResponse);
    assert.equal(invalidDateResponse.status, 400);
    assert.match(JSON.stringify(invalidDateBody), /End date must be after start date/);

    const invalidMoneyResponse = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      {
        title: 'Invalid Money',
        category: 'Roads',
        location: 'Lilongwe',
        projectValue: '15M USD',
      },
      authHeader()
    );
    const invalidMoneyBody = await readJson<Record<string, unknown>>(invalidMoneyResponse);
    assert.equal(invalidMoneyResponse.status, 400);
    assert.match(JSON.stringify(invalidMoneyBody), /Project value must be a number/);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('project writes normalize USD values and calculate duration from dates', async () => {
  const restores = [
    replaceStatic(Project, 'create', async (body: object) => ({ _id: '507f1f77bcf86cd799439302', ...body })),
  ];
  const server = await createTestServer();

  try {
    const response = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      {
        title: 'Valid Project',
        category: 'Roads',
        status: 'Completed',
        location: 'Lilongwe',
        projectValue: 15000000,
        budget: '12500000',
        startDate: '2025-01-01',
        endDate: '2026-07-01',
      },
      authHeader()
    );
    const body = await readJson<Record<string, unknown>>(response);
    assert.equal(response.status, 201);
    assert.equal(body.projectValue, '$15,000,000 USD');
    assert.equal(body.budget, '$12,500,000 USD');
    assert.equal(body.duration, '~1 year 6 months');
    assert.equal(body.yearCompleted, '2026');
  } finally {
    await server.close();
    restoreAll(restores);
  }
});
