import fs from 'fs';
import path from 'path';
import { safeLogger } from './safeLogger';

// Applicant CVs are personal data. They are stored in uploads/cvs, but the public /uploads
// route must never serve them: they are only sent by GET /api/applications/:id/cv after login.
export const uploadsRoot = path.join(__dirname, '../../uploads');
export const cvUploadDir = path.join(uploadsRoot, 'cvs');
export const CV_PATH_PREFIX = '/uploads/cvs/';

/** The only folders under uploads/ that the public /uploads route serves. */
export const PUBLIC_UPLOAD_FOLDERS = ['images', 'videos'] as const;

// Upper- then lower-casing folds letters a case-insensitive disk treats as the same, such as
// "ſ" (long s) and "s", which toLowerCase() alone leaves apart (macOS in development).
function foldCase(value: string): string {
  return value.normalize('NFC').toUpperCase().toLowerCase();
}

/**
 * True when a path under /uploads (as express.static would receive it, still URL-encoded)
 * resolves inside the CV folder. It decodes and normalises the path the same way
 * express.static does, so spellings like `//cvs/x`, `/./cvs/x` or `/%63vs/x` are caught too.
 * The public route only serves PUBLIC_UPLOAD_FOLDERS anyway; this answers CV-shaped requests
 * with a plain 404 that is never cached.
 */
export function isCvUploadRequest(requestPath: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    return true;
  }
  if (decoded.includes('\0')) return true;

  const resolved = foldCase(path.normalize(path.join(uploadsRoot, decoded)));
  const cvDir = foldCase(cvUploadDir);
  return resolved === cvDir || resolved.startsWith(cvDir + path.sep);
}

/**
 * The file on disk for a stored cvFile value ("/uploads/cvs/<name>"), or null when the value
 * does not point straight at a file in the CV folder.
 */
export function resolveStoredCvPath(cvFile: unknown): string | null {
  if (typeof cvFile !== 'string' || !cvFile.startsWith(CV_PATH_PREFIX)) return null;
  const name = cvFile.slice(CV_PATH_PREFIX.length);
  if (!name || name.startsWith('.') || name.includes('\0') || name !== path.basename(name)) return null;
  return path.join(cvUploadDir, name);
}

/**
 * The download name: the applicant's name plus the file's own extension, e.g.
 * "Victor Banda CV.pdf". Stored names cannot be used: older uploads and newer ones
 * were named in different ways.
 */
export function cvDownloadName(fullName: unknown, cvFile: string): string {
  const extension = path.extname(cvFile).toLowerCase();
  const name = String(fullName ?? '')
    .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return `${name || 'Applicant'} CV${extension}`;
}

/**
 * Deletes a stored CV. A file that is already gone counts as deleted; any other failure is
 * logged, not thrown, because the application it belonged to is already deleted.
 */
export async function removeStoredCv(cvFile: unknown): Promise<void> {
  const filePath = resolveStoredCvPath(cvFile);
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    safeLogger.error(`Could not delete CV file ${path.basename(filePath)}`, error);
  }
}
