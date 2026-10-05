# Implementation Plan: Dashboard Content E2E Suite

**Branch**: `20261005-195600-dashboard-content-e2e` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/20261005-195600-dashboard-content-e2e/spec.md`

## Summary

Add a Playwright-based E2E suite that validates Fortune Construction dashboard content operations against the public website. The suite will start the API, public Vite site, and dashboard Vite app; sign in to the dashboard; create/edit test content with unique run markers; verify public propagation on the required routes; cover contact messages, uploads, and job active/inactive visibility; then clean up only the records created by the current test run.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js, React 18, Vite 5, Express TypeScript API  
**Primary Dependencies**: Playwright test runner, existing React apps, existing Express API, existing MongoDB fallback through `mongodb-memory-server`  
**Storage**: MongoDB through local MongoDB when available or existing persistent memory fallback under `apps/api/.mongodb-data`; uploaded test assets under `apps/api/uploads`  
**Testing**: `@playwright/test` E2E suite plus existing `npm run typecheck` as validation  
**Target Platform**: Local developer machine and CI-like local execution  
**Project Type**: Monorepo web application with public site, dashboard app, and API service  
**Performance Goals**: Each public propagation assertion should complete within 10 seconds; full E2E suite should remain small enough for local pre-release validation  
**Constraints**: Do not mutate unrelated client data; no production credentials; cleanup must be marker-scoped; avoid relying on fragile visual ordering; account for existing dirty worktree  
**Scale/Scope**: One E2E test project under `tests/e2e/`, Playwright config at repo root, package scripts/dependencies, and optional lightweight test fixture asset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Component-First UI**: Pass. No production UI components are changed for the test suite.
- **API-Contract Driven**: Pass. Tests use existing REST endpoints and document their expected contracts before implementation.
- **Type Safety (NON-NEGOTIABLE)**: Pass. Playwright tests and helpers will be TypeScript; no `any` unless forced by third-party dynamic response parsing and locally justified.
- **Test-First**: Pass. The feature is itself a test suite; tasks write E2E assertions before any support fixes.
- **Performance & UX Consistency**: Pass. E2E assertions verify user-visible content without introducing UX changes.
- **Monorepo Discipline**: Pass. Shared E2E code lives under root `tests/e2e/`; app code remains in existing app boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/20261005-195600-dashboard-content-e2e/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── e2e-content-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
package.json
package-lock.json
playwright.config.ts
tests/
└── e2e/
    ├── dashboard-content.spec.ts
    ├── fixtures/
    │   └── test-image.png
    └── support/
        ├── api.ts
        ├── data.ts
        └── selectors.ts
```

**Structure Decision**: Keep all E2E tests at the repository root because the suite coordinates all three apps. Root-level Playwright config owns server startup and shared environment defaults.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), and [e2e-content-contract.md](./contracts/e2e-content-contract.md).

## Post-Design Constitution Check

- **Component-First UI**: Pass. No production UI changes planned unless tests reveal real defects.
- **API-Contract Driven**: Pass. Contracts document endpoints used by setup, assertions, and cleanup.
- **Type Safety**: Pass. Support helpers expose typed data builders and API response shapes.
- **Test-First**: Pass. Tasks require writing the E2E assertions before fixing any real failure.
- **Performance & UX Consistency**: Pass. Browser assertions are scoped to visible public content and upload availability.
- **Monorepo Discipline**: Pass. Root test suite coordinates apps without moving existing source ownership.

## Complexity Tracking

No constitution violations require justification.
