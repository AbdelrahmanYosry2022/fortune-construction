import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import PageContent from '../src/models/PageContent';
import { ApiError } from '../src/middleware/errors';
import { sectionContentUpdate } from '../src/routes/pageContent';
import { createTestServer, TestServer } from './helpers/appTestHarness';
import { authHeader, jsonRequest } from './helpers/projectCategoryTestHelpers';
import { readJson } from './helpers/contractTestHelpers';

// Saving a page section must merge into it: before this, PUT replaced the whole section, so any
// field a dashboard form did not send was erased. These tests run the real route and the real
// Mongoose model (casting, timestamps, upsert defaults) and replace only the MongoDB driver
// collection with an in-memory store that applies $set/$setOnInsert the way MongoDB does.

type StoredDoc = Record<string, unknown>;

interface ErrorBody {
  message: string;
  code?: string;
  details?: Array<{ field?: string; message: string }>;
}

interface SectionBody {
  page: string;
  section: string;
  content: Record<string, unknown>;
}

interface FakeSectionStore {
  docs: StoredDoc[];
  writes: number;
  restore: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function matches(doc: StoredDoc, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, value]) => {
    assert.ok(!isRecord(value) && !key.startsWith('$'), `fake store only supports equality filters (got ${key})`);
    return doc[key] === value;
  });
}

// Same rule as MongoDB: two operators may not touch the same path or a path inside another.
function assertNoConflicts(update: Record<string, Record<string, unknown>>): void {
  const paths = Object.values(update).flatMap((fields) => Object.keys(fields));
  for (const a of paths) {
    for (const b of paths) {
      if (a !== b && b.startsWith(`${a}.`)) {
        throw new Error(`Updating the path '${b}' would create a conflict at '${a}'`);
      }
    }
  }
  if (new Set(paths).size !== paths.length) throw new Error('Updating the same path twice would create a conflict');
}

function setPath(doc: StoredDoc, path: string, value: unknown): void {
  const parts = path.split('.');
  let target: Record<string, unknown> = doc;
  for (const part of parts.slice(0, -1)) {
    if (target[part] === undefined) target[part] = {};
    if (!isRecord(target[part])) throw new Error(`Cannot create field '${path}' in a non-object element`);
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = structuredClone(value);
}

function installFakeSectionStore(initialDocs: StoredDoc[]): FakeSectionStore {
  const store: FakeSectionStore = { docs: structuredClone(initialDocs), writes: 0, restore: () => undefined };
  const collection = PageContent.collection as unknown as Record<string, unknown>;
  const originals = { findOne: collection.findOne, findOneAndUpdate: collection.findOneAndUpdate };
  let nextId = 1;

  collection.findOne = async (filter: Record<string, unknown>) => {
    const doc = store.docs.find((candidate) => matches(candidate, filter));
    return doc ? structuredClone(doc) : null;
  };

  collection.findOneAndUpdate = async (
    filter: Record<string, unknown>,
    update: Record<string, Record<string, unknown>>,
    options: { upsert?: boolean; returnDocument?: 'before' | 'after' },
  ) => {
    for (const operator of Object.keys(update)) {
      // A replacement document or an unexpected operator would bypass the merge rule.
      assert.ok(['$set', '$setOnInsert'].includes(operator), `unexpected update operator ${operator}`);
    }
    assertNoConflicts(update);

    let doc = store.docs.find((candidate) => matches(candidate, filter));
    const before = doc ? structuredClone(doc) : null;
    const inserting = !doc;
    if (!doc) {
      if (!options.upsert) return null;
      doc = { _id: (nextId++).toString(16).padStart(24, '0'), ...structuredClone(filter) };
    }
    const working = structuredClone(doc);
    for (const [path, value] of Object.entries(update.$set ?? {})) setPath(working, path, value);
    if (inserting) {
      for (const [path, value] of Object.entries(update.$setOnInsert ?? {})) setPath(working, path, value);
      store.docs.push(working);
    } else {
      store.docs[store.docs.indexOf(doc)] = working;
    }
    store.writes += 1;
    return options.returnDocument === 'after' ? structuredClone(working) : before;
  };

  store.restore = () => {
    collection.findOne = originals.findOne;
    collection.findOneAndUpdate = originals.findOneAndUpdate;
  };
  return store;
}

async function withSectionStore(
  initialDocs: StoredDoc[],
  run: (server: TestServer, store: FakeSectionStore) => Promise<void>,
): Promise<void> {
  const store = installFakeSectionStore(initialDocs);
  const server = await createTestServer();
  try {
    await run(server, store);
  } finally {
    await server.close();
    store.restore();
  }
}

function putRaw(server: TestServer, path: string, body: string, contentType: string, headers = authHeader()): Promise<Response> {
  return fetch(`${server.baseUrl}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, ...headers },
    body,
  });
}

function contentOf(store: FakeSectionStore, page: string, section: string): unknown {
  return store.docs.find((doc) => doc.page === page && doc.section === section)?.content;
}

const timeline = [
  { year: '2009', label: 'Founded in Lilongwe' },
  { year: '2015', label: 'First government road contract' },
  { year: '2021', label: 'Opened Blantyre office' },
];

const heroDoc: StoredDoc = {
  _id: '507f1f77bcf86cd799439901',
  page: 'home',
  section: 'hero',
  content: {
    title: 'Building Malawi',
    subtitle: 'Roads, bridges and buildings since 2009',
    image: '/uploads/images/hero.jpg',
    stats: [{ label: 'Projects', value: '120' }],
  },
};

const timelineDoc: StoredDoc = {
  _id: '507f1f77bcf86cd799439902',
  page: 'about',
  section: 'timeline',
  content: {
    title: 'Our Journey',
    items: timeline,
    cta: { label: 'Contact us', url: '/contact' },
  },
};

test('saving a section with only some keys keeps every key that was not sent', async () => {
  await withSectionStore([heroDoc, timelineDoc], async (server, store) => {
    const response = await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { title: 'Building Malawi Together' }, authHeader());
    const body = await readJson<SectionBody>(response);

    const expected = { ...(heroDoc.content as Record<string, unknown>), title: 'Building Malawi Together' };
    assert.equal(response.status, 200);
    assert.equal(body.page, 'home');
    assert.equal(body.section, 'hero');
    assert.deepEqual(body.content, expected);
    assert.deepEqual(contentOf(store, 'home', 'hero'), expected);
    assert.deepEqual(contentOf(store, 'about', 'timeline'), timelineDoc.content, 'other sections are untouched');

    const publicRead = await fetch(`${server.baseUrl}/api/content/home/hero`);
    assert.deepEqual(await readJson(publicRead), expected);

    // The current dashboard sends the whole section: that still saves every field it sends.
    const fullSave = { ...expected, subtitle: 'Since 2009', image: '/uploads/images/hero-2.jpg' };
    const fullResponse = await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', fullSave, authHeader());
    assert.equal(fullResponse.status, 200);
    assert.deepEqual((await readJson<SectionBody>(fullResponse)).content, fullSave);
  });
});

test('a key that is sent replaces that key as a whole, so removing a list item works', async () => {
  await withSectionStore([timelineDoc], async (server, store) => {
    const shorterList = [timeline[0], timeline[2]];
    const listResponse = await jsonRequest(server.baseUrl, '/api/content/about/timeline', 'PUT', { items: shorterList }, authHeader());
    assert.equal(listResponse.status, 200);
    assert.deepEqual((await readJson<SectionBody>(listResponse)).content.items, shorterList);

    const objectResponse = await jsonRequest(
      server.baseUrl,
      '/api/content/about/timeline',
      'PUT',
      { cta: { label: 'Get a quote' }, title: '' },
      authHeader(),
    );
    assert.equal(objectResponse.status, 200);
    assert.deepEqual(contentOf(store, 'about', 'timeline'), {
      title: '',
      items: shorterList,
      cta: { label: 'Get a quote' },
    }, 'nested objects are replaced, not deep-merged, and a text field can be cleared');

    const emptyListResponse = await jsonRequest(server.baseUrl, '/api/content/about/timeline', 'PUT', { items: [] }, authHeader());
    assert.equal(emptyListResponse.status, 200);
    assert.deepEqual((contentOf(store, 'about', 'timeline') as Record<string, unknown>).items, []);
  });
});

test('saving a section that does not exist yet creates it', async () => {
  await withSectionStore([heroDoc], async (server, store) => {
    const response = await jsonRequest(server.baseUrl, '/api/content/careers/intro', 'PUT', { title: 'Join our team' }, authHeader());
    const body = await readJson<SectionBody>(response);

    assert.equal(response.status, 200);
    assert.equal(body.page, 'careers');
    assert.equal(body.section, 'intro');
    assert.deepEqual(body.content, { title: 'Join our team' });
    const created = store.docs.find((doc) => doc.page === 'careers' && doc.section === 'intro');
    assert.ok(created, 'section was created');
    assert.deepEqual(created.content, { title: 'Join our team' });
    assert.ok(created.createdAt instanceof Date && created.updatedAt instanceof Date);

    // An empty save of a missing section creates it with empty content, and changes nothing else.
    const emptyResponse = await jsonRequest(server.baseUrl, '/api/content/hse/policy', 'PUT', {}, authHeader());
    assert.equal(emptyResponse.status, 200);
    assert.equal((await readJson<SectionBody>(emptyResponse)).section, 'policy');
    assert.deepEqual(contentOf(store, 'hse', 'policy'), {});
    assert.deepEqual(contentOf(store, 'home', 'hero'), heroDoc.content);
  });
});

test('a body that is not a JSON object is rejected with 400 and nothing is written', async () => {
  await withSectionStore([heroDoc], async (server, store) => {
    const cases: Array<{ name: string; body: string; contentType: string }> = [
      { name: 'array', body: JSON.stringify([{ title: 'Hacked' }]), contentType: 'application/json' },
      { name: 'string', body: 'Hacked', contentType: 'text/plain' },
      { name: 'form', body: 'title=Hacked', contentType: 'application/x-www-form-urlencoded' },
    ];
    for (const { name, body, contentType } of cases) {
      const response = await putRaw(server, '/api/content/home/hero', body, contentType);
      const error = await readJson<ErrorBody>(response);
      assert.equal(response.status, 400, `${name} body`);
      assert.equal(error.code, 'VALIDATION_ERROR', `${name} body`);
      assert.match(error.details?.[0]?.message ?? '', /must be a JSON object/, `${name} body`);
    }

    // A JSON string, null or broken JSON never reaches the route: express.json (strict) rejects
    // it, and the error handler answers 400 like the route's own check.
    for (const body of [JSON.stringify('Hacked'), 'null', '{"title": ']) {
      const response = await putRaw(server, '/api/content/home/hero', body, 'application/json');
      const error = await readJson<ErrorBody>(response);
      assert.equal(response.status, 400, `${body} body is rejected`);
      assert.equal(error.code, 'VALIDATION_ERROR', `${body} body`);
    }

    assert.equal(store.writes, 0);
    assert.deepEqual(contentOf(store, 'home', 'hero'), heroDoc.content);
  });

  // The route's own check, for any value a parser could hand it.
  for (const body of ['Hacked', null, 42, true, [], [{ title: 'Hacked' }], undefined]) {
    assert.throws(
      () => sectionContentUpdate(body),
      (error: unknown) => error instanceof ApiError && error.statusCode === 400 && error.code === 'VALIDATION_ERROR',
      `${JSON.stringify(body)} is rejected`,
    );
  }
});

test('keys that are empty, start with $ or contain a dot are rejected with 400 naming the key, and nothing changes', async () => {
  await withSectionStore([heroDoc], async (server, store) => {
    const badKeys: Array<{ key: string; message: RegExp }> = [
      { key: '$set', message: /must not start with "\$"/ },
      { key: '$where', message: /must not start with "\$"/ },
      { key: 'title.en', message: /must not contain "\."/ },
      { key: '', message: /must not be empty/ },
    ];
    for (const { key, message } of badKeys) {
      const response = await jsonRequest(
        server.baseUrl,
        '/api/content/home/hero',
        'PUT',
        { title: 'Should not be saved', [key]: 'x' },
        authHeader(),
      );
      const error = await readJson<ErrorBody>(response);
      assert.equal(response.status, 400, `key ${JSON.stringify(key)}`);
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.deepEqual(error.details?.map((detail) => detail.field), [key]);
      assert.match(error.details?.[0]?.message ?? '', message);
    }

    const several = await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { 'a.b': 1, $inc: 2, ok: 3 }, authHeader());
    const severalError = await readJson<ErrorBody>(several);
    assert.equal(several.status, 400);
    assert.deepEqual(severalError.details?.map((detail) => detail.field).sort(), ['$inc', 'a.b']);

    const missingSection = await jsonRequest(server.baseUrl, '/api/content/careers/intro', 'PUT', { 'x.y': 1 }, authHeader());
    assert.equal(missingSection.status, 400);

    assert.equal(store.writes, 0);
    assert.deepEqual(store.docs.map((doc) => doc.section), ['hero'], 'no section was created');
    assert.deepEqual(contentOf(store, 'home', 'hero'), heroDoc.content);
  });
});

test('saving a section without a valid admin token returns 401 and nothing is written', async () => {
  await withSectionStore([heroDoc], async (server, store) => {
    const anonymous = await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { title: 'Anonymous' });
    assert.equal(anonymous.status, 401);

    const forged = await jsonRequest(server.baseUrl, '/api/content/home/hero', 'PUT', { title: 'Forged' }, {
      Authorization: 'Bearer not-a-real-token',
    });
    assert.equal(forged.status, 401);

    const anonymousCreate = await jsonRequest(server.baseUrl, '/api/content/careers/intro', 'PUT', { title: 'Anonymous' });
    assert.equal(anonymousCreate.status, 401);

    assert.equal(store.writes, 0);
    assert.deepEqual(store.docs.map((doc) => doc.section), ['hero']);
    assert.deepEqual(contentOf(store, 'home', 'hero'), heroDoc.content);
  });
});
