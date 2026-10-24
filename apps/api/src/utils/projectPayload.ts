import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value;

// .optional() must sit inside z.preprocess: an empty field becomes undefined first,
// and only then is it allowed to be missing. With .optional() outside, "" was
// rejected as "must be a number" and the dashboard could not save the project.
const projectMoney = (label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number({ invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be greater than 0`)
      .max(999_999_999_999, `${label} is too large`)
      .optional()
  );

const projectYear = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ invalid_type_error: 'Year completed must be a number' })
    .int('Year completed must be a whole year')
    .min(1900, 'Year completed must be 1900 or later')
    .max(new Date().getFullYear() + 20, 'Year completed is too far in the future')
    .optional()
);

const projectDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

const baseProjectPayloadObject = z.object({
  title: z.string().trim().min(2, 'Title is required').optional(),
  category: z.string().trim().min(1, 'Category is required').optional(),
  status: z.enum(['Ongoing', 'Completed']).optional(),
  location: z.string().trim().min(1, 'Location is required').optional(),
  clientName: z.string().optional(),
  projectValue: projectMoney('Project value'),
  budget: projectMoney('Budget'),
  startDate: projectDate,
  endDate: projectDate,
  duration: z.string().optional(),
  yearCompleted: projectYear,
  overview: z.string().optional(),
  scopeOfWork: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  coordinates: z.object({
    lat: z.preprocess(
      emptyToUndefined,
      z.coerce.number({ invalid_type_error: 'Latitude must be a number' })
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional()
    ),
    lng: z.preprocess(
      emptyToUndefined,
      z.coerce.number({ invalid_type_error: 'Longitude must be a number' })
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional()
    ),
  }).optional(),
});

const validateProjectTimeline = (data: z.infer<typeof baseProjectPayloadObject>, ctx: z.RefinementCtx) => {
  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be after start date',
    });
  }
};

const baseProjectPayloadSchema = baseProjectPayloadObject.superRefine(validateProjectTimeline);

const createProjectPayloadSchema = baseProjectPayloadObject.extend({
  title: z.string().trim().min(2, 'Title is required'),
  category: z.string().trim().min(1, 'Category is required'),
  location: z.string().trim().min(1, 'Location is required'),
}).superRefine(validateProjectTimeline);

type ProjectPayload = z.infer<typeof baseProjectPayloadSchema>;

function formatUsd(value?: number) {
  if (value === undefined) return undefined;
  return `$${value.toLocaleString('en-US')} USD`;
}

function calculateDuration(start?: Date, end?: Date) {
  if (!start || !end || end <= start) return undefined;
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (!years) return `~${months} month${months === 1 ? '' : 's'}`;
  if (!remainingMonths) return `~${years} year${years === 1 ? '' : 's'}`;
  return `~${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}

function normalizePayload(payload: ProjectPayload) {
  const normalized: Record<string, unknown> = { ...payload };
  const duration = calculateDuration(payload.startDate, payload.endDate);

  if (payload.projectValue !== undefined) normalized.projectValue = formatUsd(payload.projectValue);
  if (payload.budget !== undefined) normalized.budget = formatUsd(payload.budget);
  if (duration !== undefined) normalized.duration = duration;
  if (payload.status === 'Completed' && payload.endDate) normalized.yearCompleted = String(payload.endDate.getFullYear());
  else if (payload.yearCompleted !== undefined) normalized.yearCompleted = String(payload.yearCompleted);

  return normalized;
}

export function parseProjectCreatePayload(body: unknown) {
  return normalizePayload(createProjectPayloadSchema.parse(body));
}

export function parseProjectUpdatePayload(body: unknown) {
  return normalizePayload(baseProjectPayloadSchema.parse(body));
}

// Gallery images are either files served by this site (/uploads/images/...) or absolute
// http(s) links (e.g. the seeded Unsplash photos). Anything else (javascript:, data:, //host,
// relative paths, spaces, control characters) is rejected.
const MAX_GALLERY_IMAGE_URL_LENGTH = 2048;
export const MAX_GALLERY_IMAGES_PER_REQUEST = 50;

function isGalleryImageUrl(value: string): boolean {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export const projectGalleryImageUrlSchema = z
  .string({ required_error: 'Image URL is required', invalid_type_error: 'Image URL must be a string' })
  .trim()
  .min(1, 'Image URL is required')
  .max(MAX_GALLERY_IMAGE_URL_LENGTH, 'Image URL is too long')
  .refine(isGalleryImageUrl, 'Image URL must be an http(s) link or a path starting with /');

// POST /api/projects/:id/gallery
export const projectGalleryAddSchema = z.object({
  urls: z
    .array(projectGalleryImageUrlSchema, {
      required_error: 'urls is required',
      invalid_type_error: 'urls must be a list of image URLs',
    })
    .min(1, 'Add at least one image')
    .max(MAX_GALLERY_IMAGES_PER_REQUEST, `Add at most ${MAX_GALLERY_IMAGES_PER_REQUEST} images at a time`)
    .transform((urls) => [...new Set(urls)]),
});

// DELETE /api/projects/:id/gallery: matched exactly against the stored value and not checked
// against the URL rules above, so an old malformed entry can still be removed.
export const projectGalleryRemoveSchema = z.object({
  url: z
    .string({ required_error: 'url is required', invalid_type_error: 'url must be a string' })
    .min(1, 'url is required')
    .max(MAX_GALLERY_IMAGE_URL_LENGTH, 'Image URL is too long'),
});
