# Research: Dashboard Content E2E Suite

**Feature**: `specs/20261005-195600-dashboard-content-e2e`  
**Date**: 2026-10-05

## Findings & Technical Decisions

### 1. Test Runner Selection
- **Decision**: Use `@playwright/test` for E2E web automation.
- **Rationale**: Monorepo has public Vite app (port 5173), dashboard Vite app (port 5174), and Express API (port 3001). Playwright provides native multi-browser, multi-context, async fetch, and file upload capabilities in TypeScript without external selenium grid setup.

### 2. Monorepo Server Startup Strategy
- **Decision**: Configure `webServer` entries or a master startup script in `playwright.config.ts`.
- **Rationale**: Playwright can auto-start or wait for existing instances on `http://localhost:5173` (public), `http://localhost:5174` (dashboard), and `http://localhost:3001` (API). If servers are already running, Playwright reuses them (`reuseExistingServer: !process.env.CI`).

### 3. Data Isolation and Cleanup Strategy
- **Decision**: Include a unique prefix/slug tag `e2e-run-[timestamp]-[random]` in title/name fields of created projects, services, jobs, and contact messages.
- **Rationale**: Guarantees test assertions inspect only current test run records and prevents cleanup from deleting existing seed/client data.

### 4. API vs UI Automation Balance
- **Decision**:
  - Test UI login flow via browser on dashboard `/login`.
  - Perform CRUD setup/teardown either via authenticated API calls or dashboard forms, and assert propagation on public frontend routes using Playwright `page.goto()` and locator assertions.
- **Rationale**: Ensures fast, deterministic test runs while validating true end-to-end user visibility on the public site and dashboard inbox.

### 5. Upload Handling
- **Decision**: Use a standard 1x1 test PNG fixture under `tests/e2e/fixtures/test-image.png`, submit via `/api/uploads` using authenticated request context or dashboard image picker, and verify HTTP status 200 on served URL `/uploads/...`.
