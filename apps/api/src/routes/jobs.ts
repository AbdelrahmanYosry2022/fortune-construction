import { Router, Request, Response } from 'express';
import JobPosition from '../models/JobPosition';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const jobs = await JobPosition.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(jobs);
}));

router.get('/all', protect, asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const jobs = await JobPosition.find().sort({ createdAt: -1 });
  res.json(jobs);
}));

router.post('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const job = await JobPosition.create(req.body);
  res.status(201).json(job);
}));

router.put('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const job = await JobPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(job);
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await JobPosition.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
