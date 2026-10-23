import { Router, Request, Response } from 'express';
import Partner from '../models/Partner';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const partners = await Partner.find().sort({ order: 1 });
  res.json(partners);
}));

router.post('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const partner = await Partner.create(req.body);
  res.status(201).json(partner);
}));

router.put('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!partner) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(partner);
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await Partner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
