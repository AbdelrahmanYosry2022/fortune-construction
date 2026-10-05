import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import Project from '../models/Project';
import { protect } from '../middleware/auth';
import { parseProjectCreatePayload, parseProjectUpdatePayload } from '../utils/projectPayload';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
  res.json(project);
});

router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.create(parseProjectCreatePayload(req.body));
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid project data', errors: error.flatten().fieldErrors });
      return;
    }
    throw error;
  }
});

router.put('/:id', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, parseProjectUpdatePayload(req.body), { new: true });
    if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
    res.json(project);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid project data', errors: error.flatten().fieldErrors });
      return;
    }
    throw error;
  }
});

router.delete('/:id', protect, async (req: Request, res: Response): Promise<void> => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});

export default router;
