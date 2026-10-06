import { test, expect } from '@playwright/test';
import path from 'path';
import { E2EApiClient, CleanupManager, API_BASE_URL } from './support/api';
import { generateRunId, buildProjectData, buildServiceData, buildJobData, buildContactMessageData } from './support/data';
import { loginDashboard, submitContactForm } from './support/selectors';

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5174';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

test.describe('Dashboard Content E2E Suite', () => {
  let api: E2EApiClient;
  let cleanup: CleanupManager;

  test.beforeEach(async () => {
    api = new E2EApiClient(API_BASE_URL);
    await api.login('admin', 'admin123');
    cleanup = new CleanupManager(api);
  });

  test.afterEach(async () => {
    if (cleanup) {
      await cleanup.cleanupAll();
    }
  });

  test('US1.1: Dashboard login flow', async ({ page }) => {
    await loginDashboard(page, DASHBOARD_URL, 'admin', 'admin123');
    await expect(page).toHaveURL(`${DASHBOARD_URL}/`);
    await page.goto(`${DASHBOARD_URL}/projects`);
    await expect(page).not.toHaveURL(/\/login$/);
  });

  test('US1.2: Project add, edit, and public visibility on /projects and /projects/:id', async ({ page }) => {
    const runId = generateRunId();
    const initialProject = buildProjectData(runId);

    // 1. Add Project
    const createdProject = await api.createProject(initialProject);
    cleanup.addProject(createdProject._id!);

    // 2. Verify on public /projects listing
    await page.goto(`${PUBLIC_URL}/projects`);
    await expect(page.locator(`text="${createdProject.title}"`)).toBeVisible({ timeout: 10000 });

    // 3. Verify on public /projects/:id detail page
    await page.goto(`${PUBLIC_URL}/projects/${createdProject._id}`);
    await expect(page.locator('h1').first()).toContainText(createdProject.title, { timeout: 10000 });

    // 4. Edit Project
    const updatedTitle = `Updated E2E Project ${runId}`;
    const updatedOverview = `Updated overview description for run ${runId}`;
    await api.updateProject(createdProject._id!, {
      title: updatedTitle,
      overview: updatedOverview,
    });

    // 5. Verify edited project on public /projects
    await page.goto(`${PUBLIC_URL}/projects`);
    await expect(page.locator(`text="${updatedTitle}"`)).toBeVisible({ timeout: 10000 });

    // 6. Verify edited project on public /projects/:id
    await page.goto(`${PUBLIC_URL}/projects/${createdProject._id}`);
    await expect(page.locator('h1').first()).toContainText(updatedTitle, { timeout: 10000 });
  });

  test('US1.3: Service add and public visibility on /services', async ({ page }) => {
    const runId = generateRunId();
    const serviceData = buildServiceData(runId);

    const createdService = await api.createService(serviceData);
    cleanup.addService(createdService._id!);

    await page.goto(`${PUBLIC_URL}/services`);
    await expect(page.locator(`text="${createdService.title}"`)).toBeVisible({ timeout: 10000 });
  });

  test('US1.4: Page Content edit visibility and restoration', async ({ page }) => {
    const runId = generateRunId();
    const originalContent = (await api.getPageContent('contact', 'hero')) || {};

    cleanup.addPageContentRestore('contact', 'hero', originalContent);

    const customTitle = `E2E Custom Contact Hero ${runId}`;
    await api.updatePageContent('contact', 'hero', {
      title: customTitle,
      description: `E2E description for run ${runId}`,
    });

    await page.goto(`${PUBLIC_URL}/contact`);
    await expect(page.locator(`text="${customTitle}"`)).toBeVisible({ timeout: 10000 });
  });

  test('US1.5: Active Job Position add and public visibility on /careers', async ({ page }) => {
    const runId = generateRunId();
    const jobData = buildJobData(runId, { isActive: true });

    const createdJob = await api.createJob(jobData);
    cleanup.addJob(createdJob._id!);

    await page.goto(`${PUBLIC_URL}/careers`);
    await expect(page.locator(`text="${createdJob.title}"`)).toBeVisible({ timeout: 10000 });
  });

  test('US2.1: Public Contact form submission and dashboard /messages visibility', async ({ page }) => {
    const runId = generateRunId();
    const messageData = buildContactMessageData(runId);

    // Submit public contact form via browser
    await submitContactForm(page, PUBLIC_URL, messageData);

    // Verify message arrived in API / Dashboard inbox
    const messages = await api.getMessages();
    const match = messages.find((m) => m.email === messageData.email || m.name === messageData.name);
    expect(match).toBeDefined();
    if (match?._id) cleanup.addMessage(match._id);

    // Verify in Dashboard UI /messages
    await loginDashboard(page, DASHBOARD_URL, 'admin', 'admin123');
    await page.goto(`${DASHBOARD_URL}/messages`);
    await expect(page.locator(`text="${messageData.name}"`)).toBeVisible({ timeout: 10000 });
  });

  test('US3.1: Active / Inactive job position visibility behavior', async ({ page }) => {
    const runId = generateRunId();
    // 1. Create inactive job
    const inactiveJob = await api.createJob(buildJobData(runId, { isActive: false }));
    cleanup.addJob(inactiveJob._id!);

    // 2. Assert hidden on public /careers
    await page.goto(`${PUBLIC_URL}/careers`);
    await expect(page.locator(`text="${inactiveJob.title}"`)).not.toBeVisible();

    // 3. Update job to active
    await api.updateJob(inactiveJob._id!, { isActive: true });

    // 4. Assert now visible on public /careers
    await page.goto(`${PUBLIC_URL}/careers`);
    await expect(page.locator(`text="${inactiveJob.title}"`)).toBeVisible({ timeout: 10000 });
  });

  test('US3.2: Image upload and public asset verification', async ({ page, request }) => {
    const runId = generateRunId();
    const fixturePath = path.resolve('tests/e2e/fixtures/test-image.png');

    // Upload image via protected API
    const uploadRes = await api.uploadImage(fixturePath);
    expect(uploadRes.url).toContain('/uploads/images/');

    // Verify HTTP 200 response on uploaded image asset
    const imageHttpRes = await request.get(`${API_BASE_URL}${uploadRes.url}`);
    expect(imageHttpRes.status()).toBe(200);

    // Create a project assigned to this uploaded image
    const imageUrl = `${API_BASE_URL}${uploadRes.url}`;
    const project = await api.createProject(
      buildProjectData(runId, { coverImage: imageUrl, galleryImages: [imageUrl] })
    );
    cleanup.addProject(project._id!);

    // Verify image on public detail page
    await page.goto(`${PUBLIC_URL}/projects/${project._id}`);
    await expect(page.locator('img[src*="/uploads/images/"]').first()).toBeVisible({ timeout: 10000 });
  });
});
