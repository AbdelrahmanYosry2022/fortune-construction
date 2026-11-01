import './setup';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import JobApplication from '../src/models/JobApplication';
import { cvDownloadName, cvUploadDir, uploadsRoot } from '../src/utils/cvFiles';
import { createTestServer, TestServer } from './helpers/appTestHarness';
import { authHeader, filePart, postMultipart } from './helpers/uploadTestHelpers';

// Applicant CVs are personal data: the public /uploads route must never serve them, only
// GET /api/applications/:id/cv after login, and deleting an application deletes its CV.
// Real (in-memory) MongoDB, real files on disk.

let mongo: MongoMemoryServer | undefined;
let server: TestServer | undefined;

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const cvName = `${Date.now()}-t${Math.random().toString(36).slice(2, 8)}-access-check.pdf`;
const cvBytes = `%PDF-1.4 private cv ${unique}`;
const imageDir = path.join(uploadsRoot, 'images');
const imageName = `cv-access-check-${unique}.png`;
const videoName = `cv-access-check-${unique}.mp4`;
const rootFileName = `cv-access-check-${unique}.txt`;
const createdFiles: string[] = [];

function useInstalledMongoBinaryCache(): void {
  if (process.env.MONGOMS_DOWNLOAD_DIR || process.env.MONGOMS_SYSTEM_BINARY) return;
  const packageDir = path.dirname(require.resolve('mongodb-memory-server/package.json'));
  const cacheDir = path.join(packageDir, '..', '.cache', 'mongodb-memory-server');
  if (fs.existsSync(cacheDir)) process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
}

function baseUrl(): string {
  if (!server) throw new Error('Test server is not running');
  return server.baseUrl;
}

function writeUpload(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  createdFiles.push(filePath);
}

interface RawResponse {
  status: number;
  body: string;
  headers: http.IncomingHttpHeaders;
}

// fetch() cleans up paths like `/./` and `%2e%2e` before sending them; a raw request sends
// exactly what an attacker could.
function rawGet(rawPath: string, headers: Record<string, string> = {}): Promise<RawResponse> {
  const url = new URL(baseUrl());
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: url.hostname, port: url.port, path: rawPath, method: 'GET', headers },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => resolve({
          status: response.statusCode ?? 0,
          body: Buffer.concat(chunks).toString('utf8'),
          headers: response.headers,
        }));
      },
    );
    request.on('error', reject);
    request.end();
  });
}

function applicationFields(form: FormData, overrides: Record<string, string> = {}): void {
  const fields = {
    fullName: 'Test Applicant',
    email: 'applicant@example.com',
    phone: '+265123456789',
    position: 'Civil Engineer',
    coverLetter: 'I am interested in this role.',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
}

async function waitFor(check: () => boolean, timeoutMs = 2000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return check();
}

function cvFilesMatching(fragment: string): string[] {
  return fs.readdirSync(cvUploadDir).filter((name) => name.includes(fragment));
}

before(async () => {
  useInstalledMongoBinaryCache();
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await JobApplication.init();
  server = await createTestServer();
  writeUpload(path.join(cvUploadDir, cvName), cvBytes);
  writeUpload(path.join(imageDir, imageName), 'png-bytes');
  writeUpload(path.join(uploadsRoot, 'videos', videoName), 'mp4-bytes');
  writeUpload(path.join(uploadsRoot, rootFileName), 'root-bytes');
});

after(async () => {
  await server?.close();
  await mongoose.disconnect();
  await mongo?.stop();
  for (const filePath of createdFiles) fs.rmSync(filePath, { force: true });
});

test('the public /uploads route never serves a CV, however the path is spelled', async () => {
  const spellings = [
    `/uploads/cvs/${cvName}`,
    `/uploads//cvs/${cvName}`,
    `/uploads/./cvs/${cvName}`,
    `/uploads/%63vs/${cvName}`,
    `/uploads/cvs%2f${cvName}`,
    `/uploads/CVS/${cvName}`,
    `/UPLOADS/cvs/${cvName}`,
    `/uploads/images/../cvs/${cvName}`,
    `/uploads/images/%2e%2e/cvs/${cvName}`,
    `/uploads/images/..%2fcvs/${cvName}`,
    // "ſ" (long s): a case-insensitive disk such as macOS opens cvſ/ as cvs/.
    `/uploads/cv%C5%BF/${cvName}`,
    `/uploads/CV%C5%BF/${cvName}`,
    `/uploads/cvs/${cvName}?download=1`,
    '/uploads/cvs',
    '/uploads/cvs/',
  ];

  for (const spelling of spellings) {
    const response = await rawGet(spelling);
    assert.notEqual(response.status, 200, `${spelling} must not be served`);
    assert.equal(response.body.includes(unique), false, `${spelling} leaked the CV`);
  }

  // Even with an admin token: the public route is not the way to get a CV.
  const withToken = await rawGet(`/uploads/cvs/${cvName}`, { Authorization: authHeader() });
  assert.equal(withToken.status, 404);
});

test('images and videos are still public and cacheable; nothing else under uploads is', async () => {
  for (const [url, body] of [[`/uploads/images/${imageName}`, 'png-bytes'], [`/uploads/videos/${videoName}`, 'mp4-bytes']]) {
    const response = await rawGet(url);
    assert.equal(response.status, 200, url);
    assert.equal(response.body, body, url);
    assert.match(String(response.headers['cache-control']), /max-age=604800/, url);
  }

  const elsewhere = await rawGet(`/uploads/${rootFileName}`);
  assert.equal(elsewhere.status, 404, 'a file directly in uploads/ is not public');
  assert.equal(elsewhere.body.includes('root-bytes'), false);
});

test('an application submitted with a CV can be downloaded after login, then deleted with its file', async () => {
  const form = new FormData();
  applicationFields(form);
  form.append('cvFile', filePart(`%PDF-1.4 submitted ${unique}`, 'application/pdf'), 'My CV.pdf');

  const submitted = await postMultipart(baseUrl(), '/api/applications/submit', form);
  assert.equal(submitted.status, 201);
  const { id } = (await submitted.json()) as { id: string };

  const stored = await JobApplication.findById(id).lean();
  assert.match(stored?.cvFile ?? '', /^\/uploads\/cvs\/\d+-[a-z0-9]+-my-cv\.pdf$/);
  const storedPath = path.join(cvUploadDir, path.basename(stored?.cvFile ?? ''));
  createdFiles.push(storedPath);
  assert.equal(fs.existsSync(storedPath), true);

  const withoutLogin = await fetch(`${baseUrl()}/api/applications/${id}/cv`);
  assert.equal(withoutLogin.status, 401);

  const download = await fetch(`${baseUrl()}/api/applications/${id}/cv`, { headers: { Authorization: authHeader() } });
  assert.equal(download.status, 200);
  assert.equal(await download.text(), `%PDF-1.4 submitted ${unique}`);
  assert.equal(download.headers.get('content-disposition'), 'attachment; filename="Test Applicant CV.pdf"');
  assert.equal(download.headers.get('cache-control'), 'private, no-store');
  assert.match(download.headers.get('content-type') ?? '', /^application\/pdf/);

  const deleted = await fetch(`${baseUrl()}/api/applications/${id}`, { method: 'DELETE', headers: { Authorization: authHeader() } });
  assert.equal(deleted.status, 200);
  assert.equal(fs.existsSync(storedPath), false, 'the CV file is deleted with its application');

  const afterDelete = await fetch(`${baseUrl()}/api/applications/${id}/cv`, { headers: { Authorization: authHeader() } });
  assert.equal(afterDelete.status, 404);
});

test('CVs already on disk (uploaded before this change, in both old name styles) download', async () => {
  // Uploads before July 2026 were named "<timestamp>-<original name>"; later ones get a random part too.
  const oldStyleName = `${Date.now()}-Old Style ${unique}.docx`;
  writeUpload(path.join(cvUploadDir, oldStyleName), `old-style ${unique}`);

  for (const [stored, bytes, expectedName] of [
    [`/uploads/cvs/${cvName}`, cvBytes, 'attachment; filename="Existing Applicant CV.pdf"'],
    [`/uploads/cvs/${oldStyleName}`, `old-style ${unique}`, 'attachment; filename="Existing Applicant CV.docx"'],
  ]) {
    const application = await JobApplication.create({
      fullName: 'Existing Applicant',
      email: 'existing@example.com',
      phone: '+265111111111',
      position: 'Surveyor',
      coverLetter: 'Hello',
      cvFile: stored,
    });

    const download = await fetch(`${baseUrl()}/api/applications/${application._id}/cv`, { headers: { Authorization: authHeader() } });
    assert.equal(download.status, 200, stored);
    assert.equal(await download.text(), bytes);
    assert.equal(download.headers.get('content-disposition'), expectedName);
  }
});

test('the download name comes from the applicant name, with nothing a file name cannot hold', () => {
  assert.equal(cvDownloadName('Victor Omondi Ochung', '/uploads/cvs/1-ab-x.PDF'), 'Victor Omondi Ochung CV.pdf');
  assert.equal(cvDownloadName('  A/B\\C: "D" <E>  ', '/uploads/cvs/x.docx'), 'A B C D E CV.docx');
  assert.equal(cvDownloadName('Chikondi Phiri\r\nSet-Cookie: x=1', '/uploads/cvs/x.pdf'), 'Chikondi Phiri Set-Cookie x=1 CV.pdf');
  assert.equal(cvDownloadName('', '/uploads/cvs/x.doc'), 'Applicant CV.doc');
  assert.equal(cvDownloadName(undefined, '/uploads/cvs/x.pdf'), 'Applicant CV.pdf');
  assert.equal(cvDownloadName('Zoë Ñkhoma', '/uploads/cvs/x.pdf'), 'Zoë Ñkhoma CV.pdf');
});

test('the download route only ever sends a file from the CV folder', async () => {
  const outside = [
    '/uploads/cvs/../../.env',
    '/uploads/cvs/../images/' + imageName,
    '/uploads/cvs/a/../../images/' + imageName,
    '/uploads/cvs/sub/x.pdf',
    `/uploads/images/${imageName}`,
    '/uploads/cvs/.hidden',
    '/uploads/cvs/',
    'cvs/' + cvName,
  ];

  for (const cvFile of outside) {
    const application = await JobApplication.create({
      fullName: 'Odd Path',
      email: 'odd@example.com',
      phone: '+265222222222',
      position: 'Surveyor',
      coverLetter: 'Hello',
      cvFile,
    });
    const response = await fetch(`${baseUrl()}/api/applications/${application._id}/cv`, { headers: { Authorization: authHeader() } });
    assert.equal(response.status, 404, `${cvFile} must not be sent`);
    assert.deepEqual(await response.json(), { message: 'This application has no CV' });
  }

  const noCv = await JobApplication.create({
    fullName: 'No CV',
    email: 'nocv@example.com',
    phone: '+265333333333',
    position: 'Surveyor',
    coverLetter: 'Hello',
  });
  const noCvResponse = await fetch(`${baseUrl()}/api/applications/${noCv._id}/cv`, { headers: { Authorization: authHeader() } });
  assert.equal(noCvResponse.status, 404);

  const unknown = await fetch(`${baseUrl()}/api/applications/507f1f77bcf86cd799439099/cv`, { headers: { Authorization: authHeader() } });
  assert.equal(unknown.status, 404);
  assert.deepEqual(await unknown.json(), { message: 'Application not found' });
});

test('a CV whose file is gone says so, and the application can still be deleted', async () => {
  const application = await JobApplication.create({
    fullName: 'Missing File',
    email: 'missing@example.com',
    phone: '+265444444444',
    position: 'Surveyor',
    coverLetter: 'Hello',
    cvFile: `/uploads/cvs/${Date.now()}-gone1234-missing.pdf`,
  });

  const download = await fetch(`${baseUrl()}/api/applications/${application._id}/cv`, { headers: { Authorization: authHeader() } });
  assert.equal(download.status, 404);
  assert.equal(download.headers.get('content-disposition'), null, 'an error is not offered as a file download');
  assert.deepEqual(await download.json(), { message: 'The CV file is missing on the server' });

  const deleted = await fetch(`${baseUrl()}/api/applications/${application._id}`, { method: 'DELETE', headers: { Authorization: authHeader() } });
  assert.equal(deleted.status, 200);
  assert.equal(await JobApplication.findById(application._id), null);
});

test('a disk error part-way through a download closes the connection instead of hanging', async () => {
  const brokenName = `${Date.now()}-tbroken1-broken.pdf`;
  writeUpload(path.join(cvUploadDir, brokenName), 'x'.repeat(200_000));
  const application = await JobApplication.create({
    fullName: 'Broken Disk',
    email: 'broken@example.com',
    phone: '+265666666666',
    position: 'Surveyor',
    coverLetter: 'Hello',
    cvFile: `/uploads/cvs/${brokenName}`,
  });

  // Hand out the first bytes of this one file, then fail like a bad disk would.
  const originalCreateReadStream = fs.createReadStream;
  fs.createReadStream = ((file: fs.PathLike, options?: unknown) => {
    if (!String(file).endsWith(brokenName)) return originalCreateReadStream(file, options as never);
    let sent = false;
    return new Readable({
      read() {
        if (sent) {
          this.destroy(Object.assign(new Error('EIO: i/o error, read'), { code: 'EIO' }));
          return;
        }
        sent = true;
        this.push(Buffer.alloc(1000, 'x'));
      },
    });
  }) as typeof fs.createReadStream;

  const started = Date.now();
  let outcome: string;
  try {
    outcome = await fetch(`${baseUrl()}/api/applications/${application._id}/cv`, {
      headers: { Authorization: authHeader() },
      signal: AbortSignal.timeout(10_000),
    })
      .then((response) => response.arrayBuffer())
      .then(() => 'complete', (error: Error) => error.name);
  } finally {
    fs.createReadStream = originalCreateReadStream;
  }
  assert.notEqual(outcome, 'complete', 'a cut-off file must not look like a finished download');
  assert.notEqual(outcome, 'TimeoutError', 'the connection must not be left hanging');
  assert.ok(Date.now() - started < 5_000, 'the browser hears about the failure at once');
});

test('deleting an application never deletes a file outside the CV folder', async () => {
  for (const cvFile of [`/uploads/cvs/../images/${imageName}`, `/uploads/cvs/a/../../images/${imageName}`]) {
    const application = await JobApplication.create({
      fullName: 'Crafted Path',
      email: 'crafted@example.com',
      phone: '+265555555555',
      position: 'Surveyor',
      coverLetter: 'Hello',
      cvFile,
    });

    const deleted = await fetch(`${baseUrl()}/api/applications/${application._id}`, { method: 'DELETE', headers: { Authorization: authHeader() } });
    assert.equal(deleted.status, 200);
    assert.equal(fs.existsSync(path.join(imageDir, imageName)), true, cvFile);
  }
});

// The shared error handler deletes files multer saved for a request that then failed.
test('a submission that fails after the CV was saved does not leave the file behind', async () => {
  const marker = `cleanup-${unique}`;
  const form = new FormData();
  applicationFields(form, { email: 'not-an-email' });
  form.append('cvFile', filePart('%PDF-1.4 rejected', 'application/pdf'), `${marker}.pdf`);

  const response = await postMultipart(baseUrl(), '/api/applications/submit', form);
  assert.equal(response.status, 400);

  const removed = await waitFor(() => cvFilesMatching(marker).length === 0);
  assert.equal(removed, true, `left behind: ${cvFilesMatching(marker).join(', ')}`);
});

test('a successful submission keeps its CV file', async () => {
  const marker = `kept-${unique}`;
  const form = new FormData();
  applicationFields(form);
  form.append('cvFile', filePart('%PDF-1.4 kept', 'application/pdf'), `${marker}.pdf`);

  const response = await postMultipart(baseUrl(), '/api/applications/submit', form);
  assert.equal(response.status, 201);

  // Give a wrongly attached cleanup the same chance to run as in the failure test above.
  await new Promise((resolve) => setTimeout(resolve, 200));
  const kept = cvFilesMatching(marker);
  assert.equal(kept.length, 1);
  createdFiles.push(path.join(cvUploadDir, kept[0]));
});
