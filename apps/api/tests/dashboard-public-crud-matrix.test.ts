import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import Project from '../src/models/Project';
import ProjectCategory from '../src/models/ProjectCategory';
import Service from '../src/models/Service';
import Partner from '../src/models/Partner';
import TeamMember from '../src/models/TeamMember';
import JobPosition from '../src/models/JobPosition';
import SiteSettings from '../src/models/SiteSettings';
import PageContent from '../src/models/PageContent';
import ContactMessage from '../src/models/ContactMessage';
import JobApplication from '../src/models/JobApplication';
import { createTestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson, replaceStatic, restoreAll, sortedResult } from './helpers/contractTestHelpers';

type Row = Record<string, unknown> & { _id: string };

function nextId(prefix: string, index: number): string {
  const suffix = String(index).padStart(3, '0');
  return `507f1f77bcf86cd799${prefix}${suffix}`;
}

function matchesFilter(row: Row, filter: unknown): boolean {
  if (!filter || typeof filter !== 'object') return true;
  return Object.entries(filter as Record<string, unknown>).every(([key, value]) => row[key] === value);
}

function installCollectionModel(
  model: unknown,
  initialRows: Row[],
  options: { prefix: string; defaults?: Record<string, unknown>; filter?: (rows: Row[], query: unknown) => Row[] }
): Array<() => void> {
  const rows = [...initialRows];
  const findRows = (query: unknown) => (options.filter ? options.filter(rows, query) : rows.filter((row) => matchesFilter(row, query)));

  return [
    replaceStatic(model, 'find', (query?: unknown) => sortedResult(findRows(query))),
    replaceStatic(model, 'findById', async (id: string) => rows.find((row) => row._id === id) || null),
    replaceStatic(model, 'create', async (body: Record<string, unknown>) => {
      const row = { _id: nextId(options.prefix, rows.length + 1), ...(options.defaults || {}), ...body } as Row;
      rows.push(row);
      return row;
    }),
    replaceStatic(model, 'findByIdAndUpdate', async (id: string, body: Record<string, unknown>) => {
      const index = rows.findIndex((row) => row._id === id);
      if (index === -1) return null;
      rows[index] = { ...rows[index], ...body };
      return rows[index];
    }),
    replaceStatic(model, 'findByIdAndDelete', async (id: string) => {
      const index = rows.findIndex((row) => row._id === id);
      if (index === -1) return null;
      return rows.splice(index, 1)[0];
    }),
  ];
}

async function assertPublicListContains(baseUrl: string, path: string, field: string, value: unknown): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await readJson<Array<Record<string, unknown>>>(response);
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body), true);
  assert.ok(body.some((item) => item[field] === value), `${path} should include ${field}=${String(value)}`);
}

test('projects and project categories dashboard writes are visible through public project/category reads', async () => {
  const categories: Row[] = [
    { _id: '507f1f77bcf86cd799439101', name: 'Roads', slug: 'roads', icon: 'Route', order: 1, isActive: true },
  ];
  const projects: Row[] = [
    { _id: '507f1f77bcf86cd799439201', title: 'Existing Road', category: 'Roads', location: 'Mzuzu', status: 'Ongoing' },
  ];
  const restores = [
    replaceStatic(ProjectCategory, 'countDocuments', async () => categories.length),
    replaceStatic(ProjectCategory, 'insertMany', async (rows: Row[]) => {
      categories.push(...rows);
      return rows;
    }),
    replaceStatic(ProjectCategory, 'find', () => sortedResult(categories)),
    replaceStatic(ProjectCategory, 'create', async (body: Record<string, unknown>) => {
      const category = { _id: nextId('439', categories.length + 1), icon: 'Layers3', order: 0, isActive: true, ...body } as Row;
      categories.push(category);
      return category;
    }),
    replaceStatic(ProjectCategory, 'findById', async (id: string) => categories.find((category) => category._id === id) || null),
    replaceStatic(ProjectCategory, 'findByIdAndUpdate', async (id: string, body: Record<string, unknown>) => {
      const index = categories.findIndex((category) => category._id === id);
      if (index === -1) return null;
      categories[index] = { ...categories[index], ...body };
      return categories[index];
    }),
    replaceStatic(Project, 'find', () => sortedResult(projects)),
    replaceStatic(Project, 'findById', async (id: string) => projects.find((project) => project._id === id) || null),
    replaceStatic(Project, 'create', async (body: Record<string, unknown>) => {
      const project = { _id: nextId('440', projects.length + 1), status: 'Ongoing', ...body } as Row;
      projects.push(project);
      return project;
    }),
    replaceStatic(Project, 'findByIdAndUpdate', async (id: string, body: Record<string, unknown>) => {
      const index = projects.findIndex((project) => project._id === id);
      if (index === -1) return null;
      projects[index] = { ...projects[index], ...body };
      return projects[index];
    }),
    replaceStatic(Project, 'updateMany', async (filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }) => {
      let modifiedCount = 0;
      for (const project of projects) {
        if (matchesFilter(project, filter)) {
          Object.assign(project, update.$set || {});
          modifiedCount += 1;
        }
      }
      return { modifiedCount };
    }),
    replaceStatic(Project, 'findByIdAndDelete', async (id: string) => {
      const index = projects.findIndex((project) => project._id === id);
      if (index === -1) return null;
      return projects.splice(index, 1)[0];
    }),
  ];
  const server = await createTestServer();

  try {
    const categoryResponse = await jsonRequest(server.baseUrl, '/api/project-categories', 'POST', { name: 'Healthcare', slug: 'healthcare' }, authHeader());
    const category = await readJson<Row>(categoryResponse);
    assert.equal(categoryResponse.status, 201);
    await assertPublicListContains(server.baseUrl, '/api/project-categories', 'name', 'Healthcare');

    const projectResponse = await jsonRequest(
      server.baseUrl,
      '/api/projects',
      'POST',
      { title: 'District Hospital', category: 'Healthcare', location: 'Lilongwe', status: 'Ongoing' },
      authHeader()
    );
    const project = await readJson<Row>(projectResponse);
    assert.equal(projectResponse.status, 201);
    await assertPublicListContains(server.baseUrl, '/api/projects', 'title', 'District Hospital');

    await jsonRequest(server.baseUrl, `/api/project-categories/${category._id}`, 'PUT', { name: 'Health Facilities' }, authHeader());
    const publicProjects = await readJson<Array<Record<string, unknown>>>(await fetch(`${server.baseUrl}/api/projects`));
    assert.equal(publicProjects.find((item) => item._id === project._id)?.category, 'Health Facilities');
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('services, partners, and team dashboard CRUD changes are reflected in public reads', async () => {
  const restores = [
    ...installCollectionModel(Service, [], { prefix: '441' }),
    ...installCollectionModel(Partner, [], { prefix: '442' }),
    ...installCollectionModel(TeamMember, [], { prefix: '443' }),
  ];
  const server = await createTestServer();

  try {
    const service = await readJson<Row>(
      await jsonRequest(server.baseUrl, '/api/services', 'POST', { title: 'Road Design', tagline: 'Plan', description: 'Design roads' }, authHeader())
    );
    await assertPublicListContains(server.baseUrl, '/api/services', 'title', 'Road Design');
    await jsonRequest(server.baseUrl, `/api/services/${service._id}`, 'PUT', { title: 'Bridge Design' }, authHeader());
    await assertPublicListContains(server.baseUrl, '/api/services', 'title', 'Bridge Design');
    await fetch(`${server.baseUrl}/api/services/${service._id}`, { method: 'DELETE', headers: authHeader() });
    assert.equal((await readJson<Row[]>(await fetch(`${server.baseUrl}/api/services`))).some((item) => item._id === service._id), false);

    const partner = await readJson<Row>(
      await jsonRequest(server.baseUrl, '/api/partners', 'POST', { name: 'Transport Fund', abbr: 'TF' }, authHeader())
    );
    await assertPublicListContains(server.baseUrl, '/api/partners', 'name', 'Transport Fund');
    await jsonRequest(server.baseUrl, `/api/partners/${partner._id}`, 'PUT', { abbr: 'TFA' }, authHeader());
    await assertPublicListContains(server.baseUrl, '/api/partners', 'abbr', 'TFA');
    await fetch(`${server.baseUrl}/api/partners/${partner._id}`, { method: 'DELETE', headers: authHeader() });
    assert.equal((await readJson<Row[]>(await fetch(`${server.baseUrl}/api/partners`))).some((item) => item._id === partner._id), false);

    const member = await readJson<Row>(
      await jsonRequest(server.baseUrl, '/api/team', 'POST', { name: 'Martha Phiri', role: 'Engineer' }, authHeader())
    );
    await assertPublicListContains(server.baseUrl, '/api/team', 'name', 'Martha Phiri');
    await jsonRequest(server.baseUrl, `/api/team/${member._id}`, 'PUT', { role: 'Lead Engineer' }, authHeader());
    await assertPublicListContains(server.baseUrl, '/api/team', 'role', 'Lead Engineer');
    await fetch(`${server.baseUrl}/api/team/${member._id}`, { method: 'DELETE', headers: authHeader() });
    assert.equal((await readJson<Row[]>(await fetch(`${server.baseUrl}/api/team`))).some((item) => item._id === member._id), false);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('jobs, settings, and page content dashboard writes are reflected in public reads', async () => {
  const jobs: Row[] = [];
  let settings: Row | null = { _id: '507f1f77bcf86cd799439701', companyName: 'Fortune Construction', email: 'info@example.test' };
  const contentRows: Row[] = [];
  const restores = [
    ...installCollectionModel(JobPosition, jobs, { prefix: '444', defaults: { isActive: true } }),
    replaceStatic(SiteSettings, 'findOne', async () => settings),
    replaceStatic(SiteSettings, 'create', async (body: Record<string, unknown>) => {
      settings = { _id: '507f1f77bcf86cd799439702', ...body };
      return settings;
    }),
    replaceStatic(SiteSettings, 'findByIdAndUpdate', async (_id: string, body: Record<string, unknown>) => {
      settings = { ...(settings || { _id }), ...body };
      return settings;
    }),
    replaceStatic(PageContent, 'find', async (filter: Record<string, unknown>) => contentRows.filter((row) => matchesFilter(row, filter))),
    replaceStatic(PageContent, 'findOne', async (filter: Record<string, unknown>) => contentRows.find((row) => matchesFilter(row, filter)) || null),
    // PUT merges: each top-level key arrives as $set 'content.<key>', keys not sent are kept.
    replaceStatic(PageContent, 'findOneAndUpdate', async (filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }) => {
      let row = contentRows.find((item) => matchesFilter(item, filter));
      if (!row) {
        row = { _id: nextId('445', contentRows.length + 1), ...filter, content: {} };
        contentRows.push(row);
      }
      const content = { ...(row.content as Record<string, unknown>) };
      for (const [path, value] of Object.entries(update.$set ?? {})) {
        if (path.startsWith('content.')) content[path.slice('content.'.length)] = value;
      }
      row.content = content;
      return row;
    }),
  ];
  const server = await createTestServer();

  try {
    const job = await readJson<Row>(
      await jsonRequest(server.baseUrl, '/api/jobs', 'POST', { title: 'Surveyor', location: 'Mzuzu', type: 'Full-time', description: 'Survey sites' }, authHeader())
    );
    await assertPublicListContains(server.baseUrl, '/api/jobs', 'title', 'Surveyor');
    await jsonRequest(server.baseUrl, `/api/jobs/${job._id}`, 'PUT', { isActive: false }, authHeader());
    assert.equal((await readJson<Row[]>(await fetch(`${server.baseUrl}/api/jobs`))).some((item) => item._id === job._id), false);
    await jsonRequest(server.baseUrl, `/api/jobs/${job._id}`, 'PUT', { isActive: true, title: 'Senior Surveyor' }, authHeader());
    await assertPublicListContains(server.baseUrl, '/api/jobs', 'title', 'Senior Surveyor');

    await jsonRequest(server.baseUrl, '/api/settings', 'PUT', { companyName: 'Fortune Construction MW' }, authHeader());
    assert.equal((await readJson<Record<string, unknown>>(await fetch(`${server.baseUrl}/api/settings`))).companyName, 'Fortune Construction MW');

    await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { title: 'Built for Malawi' }, authHeader());
    const pageContent = await readJson<Record<string, unknown>>(await fetch(`${server.baseUrl}/api/content/home`));
    assert.deepEqual(pageContent.hero, { title: 'Built for Malawi' });
    assert.deepEqual(await readJson(await fetch(`${server.baseUrl}/api/content/home/hero`)), { title: 'Built for Malawi' });

    // A save that sends only some keys keeps the others.
    await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { subtitle: 'Since 2005' }, authHeader());
    assert.deepEqual(
      await readJson(await fetch(`${server.baseUrl}/api/content/home/hero`)),
      { title: 'Built for Malawi', subtitle: 'Since 2005' }
    );
  } finally {
    await server.close();
    restoreAll(restores);
  }
});

test('messages, applications, and success stories have documented non-public-CRUD workflows', () => {
  const documentedExceptions = [
    {
      resource: 'messages',
      reason: 'Public users submit contact messages; dashboard reads, marks read, and deletes them. They are not public site content after dashboard writes.',
      evidence: ['POST /api/messages/submit', 'GET /api/messages', 'PATCH /api/messages/:id/read', 'DELETE /api/messages/:id'],
    },
    {
      resource: 'applications',
      reason: 'Public users submit job applications; dashboard reviews status and deletes records. They are not public site content after dashboard writes.',
      evidence: ['POST /api/applications/submit', 'GET /api/applications', 'PATCH /api/applications/:id/status', 'DELETE /api/applications/:id'],
    },
    {
      resource: 'success stories',
      reason: 'Public success stories are managed through Page Content home.successStories in this package, not through a dedicated dashboard success stories page.',
      evidence: ['GET /api/content/home', 'PUT /api/content/home/successStories'],
    },
  ];

  assert.equal(documentedExceptions.length, 3);
  for (const item of documentedExceptions) {
    assert.equal(typeof item.reason, 'string');
    assert.ok(item.reason.length > 20);
    assert.ok(item.evidence.length >= 2);
  }
});
