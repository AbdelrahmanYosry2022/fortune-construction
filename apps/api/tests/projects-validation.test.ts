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

test('project writes reject map coordinates outside the valid range and accept decimals', async () => {
  const restores = [
    replaceStatic(Project, 'create', async (body: object) => ({ _id: '507f1f77bcf86cd799439303', ...body })),
  ];
  const server = await createTestServer();
  const base = { title: 'Lunzu Training Centre', category: 'Government', location: 'Blantyre' };

  try {
    const broken = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      { ...base, coordinates: { lat: -15650044, lng: 35019929 } },
      authHeader()
    );
    const brokenBody = await readJson<Record<string, unknown>>(broken);
    assert.equal(broken.status, 400);
    assert.match(JSON.stringify(brokenBody), /Latitude must be between -90 and 90/);
    assert.match(JSON.stringify(brokenBody), /Longitude must be between -180 and 180/);

    const valid = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      { ...base, coordinates: { lat: '-15.650044', lng: 35.019929 } },
      authHeader()
    );
    const validBody = await readJson<{ coordinates?: { lat?: number; lng?: number } }>(valid);
    assert.equal(valid.status, 201);
    assert.deepEqual(validBody.coordinates, { lat: -15.650044, lng: 35.019929 });

    const empty = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      { ...base, coordinates: { lat: '', lng: '' } },
      authHeader()
    );
    const emptyBody = await readJson<{ coordinates?: { lat?: number; lng?: number } }>(empty);
    assert.equal(empty.status, 201);
    assert.equal(emptyBody.coordinates?.lat, undefined);
    assert.equal(emptyBody.coordinates?.lng, undefined);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('project writes accept empty optional fields (Year Completed, value, budget)', async () => {
  const restores = [
    replaceStatic(Project, 'create', async (body: object) => ({ _id: '507f1f77bcf86cd799439304', ...body })),
    replaceStatic(Project, 'findByIdAndUpdate', async (_id: string, body: object) => ({ _id, ...body })),
  ];
  const server = await createTestServer();
  // The dashboard sends "" for every optional field the admin leaves empty.
  const ongoingWithoutYear = {
    title: 'New Ongoing Project',
    category: 'Roads',
    status: 'Ongoing',
    location: 'Lilongwe',
    yearCompleted: '',
    projectValue: '',
    budget: '',
    coordinates: { lat: '  ', lng: '' },
  };

  try {
    const created = await jsonRequest(server.baseUrl, '/api/projects', 'POST', ongoingWithoutYear, authHeader());
    const createdBody = await readJson<Record<string, unknown>>(created);
    assert.equal(created.status, 201, JSON.stringify(createdBody));
    assert.equal(createdBody.yearCompleted, undefined);
    assert.equal(createdBody.projectValue, undefined);
    assert.deepEqual(createdBody.coordinates, {});

    const updated = await jsonRequest(
      server.baseUrl,
      '/api/projects/507f1f77bcf86cd799439304',
      'PUT',
      ongoingWithoutYear,
      authHeader()
    );
    assert.equal(updated.status, 200);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});
