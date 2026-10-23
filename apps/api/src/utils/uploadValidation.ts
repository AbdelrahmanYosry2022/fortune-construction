import path from 'path';
import { Request } from 'express';
import multer from 'multer';
import { UploadCategory, uploadPolicies } from '../config/uploadPolicy';
import { ApiError } from '../middleware/errors';

export function sanitizeUploadFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const safeBaseName = baseName || 'upload';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${uniqueSuffix}-${safeBaseName}${ext}`;
}

export function uploadFileFilter(category: UploadCategory): multer.Options['fileFilter'] {
  return (_req: Request, file: Express.Multer.File, cb) => {
    const policy = uploadPolicies[category];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!policy.extensions.includes(extension) || !policy.mimeTypes.includes(file.mimetype)) {
      cb(new ApiError(400, 'Invalid upload', 'UPLOAD_VALIDATION_ERROR', [{
        field: file.fieldname,
        message: `Unsupported file type. Allowed types are ${policy.extensions.join(', ')}`,
      }]));
      return;
    }

    cb(null, true);
  };
}

export function uploadSizeLimit(category: UploadCategory): number {
  return uploadPolicies[category].maxSizeBytes;
}
