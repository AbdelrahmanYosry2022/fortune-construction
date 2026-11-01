import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertContains, readRepoFile } from './helpers/staticFileAssertions';

// The public /uploads route no longer serves CVs (applications-cv-access.test.ts). These checks
// fail if the dashboard goes back to linking to the file instead of downloading it after login.
test('dashboard downloads CVs through the logged-in API route, not a public link', () => {
  const page = readRepoFile('apps/dashboard/src/pages/Applications.tsx');
  const helper = readRepoFile('apps/dashboard/src/lib/cvDownload.ts');

  assert.doesNotMatch(page, /(href=|window\.open\(|resolveUploadUrl\()[^\n]*cvFile/, 'Applications.tsx must not link to or open the CV file');
  assertContains(page, /onClick=\{\(\) => downloadCv\(a\)\}/, 'The CV button must call downloadCv');
  assertContains(page, /await downloadApplicationCv\(application\)/, 'downloadCv must use downloadApplicationCv');
  assertContains(
    helper,
    /api\.get<Blob>\(`\/applications\/\$\{application\._id\}\/cv`, \{ responseType: 'blob' \}\)/,
    'CVs are fetched with the admin token from GET /api/applications/:id/cv',
  );
});
