import { Router, Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json(settings);
}));

router.put('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create(req.body);
  } else {
    settings = await SiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
  }
  res.json(settings);
}));

export default router;
