import { Router, Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/submit', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, message } = req.body;
  await ContactMessage.create({ name, email, phone, message });
  res.status(201).json({ message: 'Message sent successfully' });
}));

router.get('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { isRead } = req.query;
  const filter: Record<string, boolean> = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
  res.json(messages);
}));

router.patch('/:id/read', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!msg) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(msg);
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
