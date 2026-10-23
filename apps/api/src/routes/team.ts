import { Router, Request, Response } from 'express';
import TeamMember from '../models/TeamMember';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const members = await TeamMember.find().sort({ order: 1 });
  res.json(members);
}));

router.post('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const member = await TeamMember.create(req.body);
  res.status(201).json(member);
}));

router.put('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!member) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(member);
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await TeamMember.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
