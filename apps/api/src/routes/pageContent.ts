import { Router, Request, Response } from 'express';
import PageContent from '../models/PageContent';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

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

// PUT upsert a section (protected)
router.put('/:page/:section', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const doc = await PageContent.findOneAndUpdate(
    { page: req.params.page, section: req.params.section },
    { content: req.body },
    { upsert: true, new: true },
  );
  res.json(doc);
}));

export default router;
