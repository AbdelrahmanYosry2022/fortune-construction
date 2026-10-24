import { Router, Request, Response } from 'express';
import ProjectCategory from '../models/ProjectCategory';
import Project, { INCLUDE_DELETED_PROJECTS } from '../models/Project';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errors';
import { validateRequest } from '../middleware/validateRequest';
import {
  idParamSchema,
  projectCategoryCreateSchema,
  projectCategoryUpdateSchema,
} from '../validation/schemas';

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: 'Roads', slug: 'roads', icon: 'Route', order: 1 },
  { name: 'Bridges', slug: 'bridges', icon: 'ChevronsRight', order: 2 },
  { name: 'Commercial', slug: 'commercial', icon: 'Building2', order: 3 },
  { name: 'Residential', slug: 'residential', icon: 'Home', order: 4 },
  { name: 'Industrial', slug: 'industrial', icon: 'Factory', order: 5 },
  { name: 'Government', slug: 'government', icon: 'Landmark', order: 6 },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureDefaultCategories() {
  const count = await ProjectCategory.countDocuments();
  if (count === 0) {
    await ProjectCategory.insertMany(DEFAULT_CATEGORIES);
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  await ensureDefaultCategories();
  const categories = await ProjectCategory.find().sort({ order: 1, name: 1 });
  res.json(categories);
}));

router.post(
  '/',
  protect,
  validateRequest({ body: projectCategoryCreateSchema }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const name = req.body.name;
    try {
      const category = await ProjectCategory.create({
        name,
        slug: slugify(req.body.slug || name),
        icon: req.body.icon || 'Layers3',
        order: req.body.order === '' || req.body.order === undefined ? 0 : Number(req.body.order),
        isActive: req.body.isActive !== false,
      });
      res.status(201).json(category);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(409, 'Category slug already exists', 'CATEGORY_CONFLICT');
      }
      throw error;
    }
  })
);

router.put('/:id', protect, validateRequest({ params: idParamSchema, body: projectCategoryUpdateSchema }), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const existing = await ProjectCategory.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  const update = {
    ...req.body,
    slug: req.body.slug ? slugify(req.body.slug) : undefined,
    order: req.body.order === '' || req.body.order === undefined ? undefined : Number(req.body.order),
  };

  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  let category;
  try {
    category = await ProjectCategory.findByIdAndUpdate(req.params.id, update, { new: true });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'Category slug already exists', 'CATEGORY_CONFLICT');
    }
    throw error;
  }
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  if (category && update.name && update.name !== existing.name) {
    // Trashed projects are renamed too, so restoring one keeps a category that exists.
    await Project.updateMany({ category: existing.name }, { $set: { category: update.name } }, INCLUDE_DELETED_PROJECTS);
  }
  res.json(category);
}));

router.delete('/:id', protect, validateRequest({ params: idParamSchema }), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await ProjectCategory.findById(req.params.id);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  // Projects in the trash still count: a category used only by a trashed project is disabled,
  // not deleted, so the project keeps a valid category if it is restored.
  const usedByProjects = await Project.countDocuments({ category: category.name }, INCLUDE_DELETED_PROJECTS);
  if (usedByProjects > 0) {
    category.isActive = false;
    await category.save();
    res.json({ message: 'Category disabled because it is used by projects', category });
    return;
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
}));

export default router;
