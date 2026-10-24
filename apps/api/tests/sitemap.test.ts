import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import Project from '../src/models/Project';
import { createTestServer } from './helpers/appTestHarness';
import { replaceStatic, restoreAll, sortedResult } from './helpers/contractTestHelpers';

const STATIC_PATHS = ['/', '/about', '/projects', '/services', '/hse', '/careers', '/contact'];

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

async function withSiteOrigin<T>(value: string | undefined, run: () => Promise<T>): Promise<T> {
  const original = process.env.PUBLIC_SITE_ORIGIN;
  if (value === undefined) delete process.env.PUBLIC_SITE_ORIGIN;
  else process.env.PUBLIC_SITE_ORIGIN = value;
  try {
    return await run();
  } finally {
    if (original === undefined) delete process.env.PUBLIC_SITE_ORIGIN;
    else process.env.PUBLIC_SITE_ORIGIN = original;
  }
}

test('GET /sitemap.xml lists the public pages and every project with its last update', async () => {
  const projects = [
    { _id: '507f1f77bcf86cd799439301', updatedAt: new Date('2026-10-20T08:30:00.000Z') },
    { _id: '507f1f77bcf86cd799439302', updatedAt: new Date('2026-09-01T12:00:00.000Z') },
  ];
  const restores = [replaceStatic(Project, 'find', () => sortedResult(projects))];

  await withSiteOrigin('https://fortuneconstruction.net/', async () => {
    const server = await createTestServer();
    try {
      const response = await fetch(`${server.baseUrl}/sitemap.xml`);
      const xml = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /^application\/xml/);
      assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
      // Cheap and crawler-facing: served before the API rate limiter.
      assert.equal(response.headers.get('x-ratelimit-remaining'), null);

      assert.deepEqual(locs(xml), [
        ...STATIC_PATHS.map((path) => `https://fortuneconstruction.net${path}`),
        'https://fortuneconstruction.net/projects/507f1f77bcf86cd799439301',
        'https://fortuneconstruction.net/projects/507f1f77bcf86cd799439302',
      ]);
      assert.match(
        xml,
        /<loc>https:\/\/fortuneconstruction\.net\/projects\/507f1f77bcf86cd799439301<\/loc><lastmod>2026-10-20T08:30:00\.000Z<\/lastmod>/
      );
      assert.match(
        xml,
        /<loc>https:\/\/fortuneconstruction\.net\/projects\/507f1f77bcf86cd799439302<\/loc><lastmod>2026-09-01T12:00:00\.000Z<\/lastmod>/
      );
    } finally {
      await server.close();
      restoreAll(restores);
    }
  });
});

test('GET /sitemap.xml defaults to https://fortuneconstruction.net and lists only static pages without projects', async () => {
  const restores = [replaceStatic(Project, 'find', () => sortedResult([]))];

  await withSiteOrigin(undefined, async () => {
    const server = await createTestServer();
    try {
      const response = await fetch(`${server.baseUrl}/sitemap.xml`);
      const xml = await response.text();

      assert.equal(response.status, 200);
      assert.deepEqual(locs(xml), STATIC_PATHS.map((path) => `https://fortuneconstruction.net${path}`));
      assert.equal(xml.includes('/projects/'), false);
      assert.equal(xml.includes('localhost'), false);
      assert.equal(xml.includes('fortuneconstruction.mw'), false);
    } finally {
      await server.close();
      restoreAll(restores);
    }
  });
});

test('GET /sitemap.xml follows PUBLIC_SITE_ORIGIN when it is set', async () => {
  const restores = [
    replaceStatic(Project, 'find', () => sortedResult([{ _id: '507f1f77bcf86cd799439303', updatedAt: new Date('2026-10-01T00:00:00.000Z') }])),
  ];

  await withSiteOrigin('https://staging.fortuneconstruction.net', async () => {
    const server = await createTestServer();
    try {
      const xml = await (await fetch(`${server.baseUrl}/sitemap.xml`)).text();
      const urls = locs(xml);

      assert.equal(urls[0], 'https://staging.fortuneconstruction.net/');
      assert.equal(urls[urls.length - 1], 'https://staging.fortuneconstruction.net/projects/507f1f77bcf86cd799439303');
      assert.equal(urls.every((url) => url.startsWith('https://staging.fortuneconstruction.net/')), true);
    } finally {
      await server.close();
      restoreAll(restores);
    }
  });
});

test('GET /sitemap.xml returns a server error instead of a partial sitemap when the database fails', async () => {
  const restores = [
    replaceStatic(Project, 'find', () => ({
      sort: async () => {
        throw new Error('database unavailable');
      },
    })),
  ];
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/sitemap.xml`);
    assert.equal(response.status, 500);
  } finally {
    await server.close();
    restoreAll(restores);
  }
});
