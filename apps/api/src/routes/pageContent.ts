import { Router, Request, Response } from 'express';
import PageContent from '../models/PageContent';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errors';

const router = Router();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// Each key is written as its own 'content.<key>' path, so it must be a plain field name:
// a leading '$' would be read as an operator and a '.' as a path into a nested field.
function contentKeyProblem(key: string): string | undefined {
  if (key === '') return 'Field name must not be empty';
  if (key.startsWith('$')) return `Field name "${key}" must not start with "$"`;
  if (key.includes('.')) return `Field name "${key}" must not contain "."`;
  return undefined;
}

// A section save is a merge: every top-level key sent replaces that key (a list is replaced
// as a whole, so removing an item still works), and keys not sent are kept. A form that
// leaves a field out, or saves before its data has loaded, can no longer erase the section.
export function sectionContentUpdate(body: unknown): Record<string, unknown> {
  if (!isPlainObject(body)) {
    throw new ApiError(400, 'Invalid request', 'VALIDATION_ERROR', [
      { message: 'Section content must be a JSON object' },
    ]);
  }

  const details = Object.keys(body).flatMap((key) => {
    const problem = contentKeyProblem(key);
    return problem ? [{ field: key, message: problem }] : [];
  });
  if (details.length > 0) {
    throw new ApiError(400, 'Invalid request', 'VALIDATION_ERROR', details);
  }

  const $set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    $set[`content.${key}`] = value;
  }
  return $set;
}

// GET all sections for a page
router.get('/:page', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const docs = await PageContent.find({ page: req.params.page });
  // Return as { sectionName: content, ... }
  const result: Record<string, unknown> = {};
  for (const doc of docs) {
    result[doc.section] = doc.content;
  }
  res.json(result);
}));

// GET one section
router.get('/:page/:section', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const doc = await PageContent.findOne({ page: req.params.page, section: req.params.section });
  if (!doc) { res.json({}); return; }
  res.json(doc.content);
}));

// PUT merge into a section, creating it if missing (protected)
router.put('/:page/:section', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // A body that is not JSON (form-encoded, text, empty) parses to {} and would "save" nothing.
  if (!req.is('application/json')) {
    throw new ApiError(400, 'Invalid request', 'VALIDATION_ERROR', [
      { message: 'Section content must be a JSON object' },
    ]);
  }
  const $set = sectionContentUpdate(req.body);
  const doc = await PageContent.findOneAndUpdate(
    { page: req.params.page, section: req.params.section },
    { $set },
    { upsert: true, new: true },
  );
  res.json(doc);
}));

export default router;
