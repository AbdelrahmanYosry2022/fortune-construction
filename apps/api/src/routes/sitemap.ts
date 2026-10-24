import { Router, Request, Response } from 'express';
import Project from '../models/Project';
import { asyncHandler } from '../middleware/asyncHandler';

// Served at /sitemap.xml; nginx proxies https://fortuneconstruction.net/sitemap.xml here so the
// sitemap always lists the projects that are actually published.
const router = Router();

const DEFAULT_SITE_ORIGIN = 'https://fortuneconstruction.net';

// Public pages of the website (see src/router.tsx).
export const STATIC_SITEMAP_PATHS = ['/', '/about', '/projects', '/services', '/hse', '/careers', '/contact'];

export function resolveSitemapOrigin(value = process.env.PUBLIC_SITE_ORIGIN): string {
  const candidate = (value || '').trim();
  if (!candidate) return DEFAULT_SITE_ORIGIN;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, lastmod?: Date): string {
  const lastmodTag = lastmod && !Number.isNaN(lastmod.getTime())
    ? `<lastmod>${lastmod.toISOString()}</lastmod>`
    : '';
  return `  <url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
}

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const origin = resolveSitemapOrigin();
  // The site links project pages by MongoDB _id (/projects/:id → GET /api/projects/:id).
  const projects = await Project.find({}, '_id updatedAt').sort({ createdAt: -1 });

  const entries = [
    ...STATIC_SITEMAP_PATHS.map((path) => urlEntry(`${origin}${path}`)),
    ...projects.map((project) => {
      const { _id, updatedAt } = project as unknown as { _id: unknown; updatedAt?: Date | string };
      return urlEntry(
        `${origin}/projects/${encodeURIComponent(String(_id))}`,
        updatedAt ? new Date(updatedAt) : undefined
      );
    }),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  res.set('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(xml);
}));

export default router;
