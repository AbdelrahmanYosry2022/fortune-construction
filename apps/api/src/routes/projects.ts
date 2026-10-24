import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import Project, { PROJECT_TRASH_RETENTION_SECONDS } from '../models/Project';
import { protect } from '../middleware/auth';
import {
  parseProjectCreatePayload,
  parseProjectUpdatePayload,
  projectGalleryAddSchema,
  projectGalleryRemoveSchema,
} from '../utils/projectPayload';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errors';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

const projectNotFound = () => new ApiError(404, 'Project not found', 'NOT_FOUND');
const projectNotInTrash = () => new ApiError(404, 'Project not found in trash', 'NOT_FOUND');

// Trashed projects are hidden by the Project model's query middleware (see models/Project.ts),
// so every read and update below only sees live projects unless it asks for includeDeleted.

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
}));

// Registered before '/:id' so "trash" is not read as a project id.
router.get('/trash', protect, asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const projects = await Project.find({ deletedAt: { $ne: null } })
    .setOptions({ includeDeleted: true })
    .sort({ deletedAt: -1 });
  res.json(projects.map((project) => ({
    ...project.toJSON(),
    purgeAt: project.deletedAt
      ? new Date(project.deletedAt.getTime() + PROJECT_TRASH_RETENTION_SECONDS * 1000)
      : null,
  })));
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404).json({ message: 'Project not found' }); return; }
  res.json(project);
}));

router.post('/', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
}));

router.put('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
}));

// Gallery changes use atomic operators on the stored list (never read-modify-write), so two
// saves or a save racing a background upload cannot overwrite each other's images.
router.post(
  '/:id/gallery',
  protect,
  validateRequest({ body: projectGalleryAddSchema }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { urls } = req.body as { urls: string[] };
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { galleryImages: { $each: urls } } },
      { new: true }
    );
    if (!project) throw projectNotFound();
    res.json({ galleryImages: project.galleryImages });
  })
);

router.delete(
  '/:id/gallery',
  protect,
  validateRequest({ body: projectGalleryRemoveSchema }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body as { url: string };
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { galleryImages: url } },
      { new: true }
    );
    if (!project) throw projectNotFound();
    res.json({ galleryImages: project.galleryImages });
  })
);

// Trash and restore do not touch updatedAt: the project's content has not changed.
router.post('/:id/restore', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, deletedAt: { $ne: null } },
    { $set: { deletedAt: null } },
    { new: true, includeDeleted: true, timestamps: false }
  );
  if (!project) throw projectNotInTrash();
  res.json(project);
}));

// Only a project that is already in the trash can be deleted for good. Image files on disk
// are left alone.
router.delete('/:id/permanent', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, deletedAt: { $ne: null } });
  if (!project) throw projectNotInTrash();
  res.json({ message: 'Project permanently deleted' });
}));

// Moves the project to the trash; it can be restored for 30 days (see GET /trash).
router.delete('/:id', protect, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: { deletedAt: new Date() } },
    { new: true, timestamps: false }
  );
  if (!project) throw projectNotFound();
  res.json({ message: 'Project moved to trash', deletedAt: project.deletedAt });
}));

export default router;
