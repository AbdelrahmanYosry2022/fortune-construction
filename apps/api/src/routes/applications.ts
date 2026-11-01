import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import JobApplication from '../models/JobApplication';
import { protect } from '../middleware/auth';
import { sanitizeUploadFilename, uploadFileFilter, uploadSizeLimit } from '../utils/uploadValidation';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { safeLogger } from '../utils/safeLogger';
import {
  applicationFilterSchema,
  applicationStatusSchema,
  applicationSubmitSchema,
  idParamSchema,
} from '../validation/schemas';
import {
  CV_PATH_PREFIX,
  cvDownloadName,
  cvUploadDir,
  removeStoredCv,
  resolveStoredCvPath,
} from '../utils/cvFiles';

if (!fs.existsSync(cvUploadDir)) fs.mkdirSync(cvUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvUploadDir),
  filename: (_req, file, cb) => cb(null, sanitizeUploadFilename(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: uploadSizeLimit('cv') },
  fileFilter: uploadFileFilter('cv'),
});

const router = Router();

// If the form fails after multer saved the CV, the shared error handler deletes the file.
router.post('/submit', upload.single('cvFile'), validateRequest({ body: applicationSubmitSchema }), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone, position, coverLetter } = req.body;
  const cvFile = req.file ? `${CV_PATH_PREFIX}${req.file.filename}` : undefined;
  const application = await JobApplication.create({ fullName, email, phone, position, coverLetter, cvFile });
  res.status(201).json({ message: 'Application submitted successfully', id: application._id });
}));

router.get('/', protect, validateRequest({ query: applicationFilterSchema }), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status, position } = req.query;
  const filter: Record<string, string> = {};
  if (status) filter.status = status as string;
  if (position) filter.position = position as string;
  const applications = await JobApplication.find(filter).sort({ createdAt: -1 });
  res.json(applications);
}));

// The only way to get a CV: after login, one application at a time. Sent as a download and
// never cached, because it is personal data.
router.get(
  '/:id/cv',
  protect,
  validateRequest({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const application = await JobApplication.findById(req.params.id).select('cvFile fullName');
  if (!application) { res.status(404).json({ message: 'Application not found' }); return; }

  const filePath = resolveStoredCvPath(application.cvFile);
  if (!filePath || !application.cvFile) {
    res.status(404).json({ message: 'This application has no CV' });
    return;
  }

  res.attachment(cvDownloadName(application.fullName, application.cvFile));
  // Relative to the CV folder, so the dotfile check looks at the file name only, not at the
  // folders the API happens to be installed in.
  res.sendFile(path.basename(filePath), {
    root: cvUploadDir,
    cacheControl: false,
    dotfiles: 'deny',
    headers: { 'Cache-Control': 'private, no-store' },
  }, (error?: Error & { code?: string; status?: number }) => {
    if (!error) return;
    if (res.headersSent) {
      // Part of the file is already out: close the connection so the browser shows a failed
      // download now instead of waiting for bytes that will never come.
      if (error.code !== 'ECONNABORTED') safeLogger.error('CV download stopped part-way', error);
      res.destroy();
      return;
    }
    res.removeHeader('Content-Disposition');
    if (error.status === 404 || error.code === 'ENOENT' || error.code === 'EISDIR') {
      res.status(404).json({ message: 'The CV file is missing on the server' });
      return;
    }
    next(error);
  });
  })
);

router.patch(
  '/:id/status',
  protect,
  validateRequest({ params: idParamSchema, body: applicationStatusSchema }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  const app = await JobApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!app) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(app);
  })
);

// Deleting an application deletes its CV file too: nobody can download it any more, so
// keeping the file would only keep the applicant's personal data on the server.
router.delete('/:id', protect, validateRequest({ params: idParamSchema }), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const application = await JobApplication.findByIdAndDelete(req.params.id);
  if (application) await removeStoredCv(application.cvFile);
  res.json({ message: 'Deleted' });
}));

export default router;
