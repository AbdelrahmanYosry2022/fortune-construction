import { z } from 'zod';

const emptyToUndefined = (value: unknown) => value === '' || value === null ? undefined : value;

const projectMoney = (label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number({ invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be greater than 0`)
      .max(999_999_999_999, `${label} is too large`)
  ).optional();

const projectYear = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ invalid_type_error: 'Year completed must be a number' })
    .int('Year completed must be a whole year')
    .min(1900, 'Year completed must be 1900 or later')
    .max(new Date().getFullYear() + 20, 'Year completed is too far in the future')
).optional();

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
    lat: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
    lng: z.preprocess(emptyToUndefined, z.coerce.number().optional()),
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
