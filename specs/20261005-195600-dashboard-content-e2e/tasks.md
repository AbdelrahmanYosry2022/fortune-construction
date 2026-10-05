# Tasks: Dashboard Content E2E Suite

**Input**: Design documents from `specs/20261005-195600-dashboard-content-e2e/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/e2e-content-contract.md, quickstart.md

**Tests**: Required. This feature delivers a Playwright E2E test suite.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add Playwright runner, root scripts, and deterministic test structure.

- [x] T001 Add Playwright dependency and `test:e2e` scripts in `package.json` and `package-lock.json`
- [x] T002 Create root Playwright configuration in `playwright.config.ts`
- [x] T003 [P] Create E2E directory structure in `tests/e2e/`, `tests/e2e/support/`, and `tests/e2e/fixtures/`
- [x] T004 [P] Add tiny PNG upload fixture in `tests/e2e/fixtures/test-image.png`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers that every E2E scenario needs.

- [x] T005 Implement typed API client, auth, cleanup, and page-content restore helpers in `tests/e2e/support/api.ts`
- [x] T006 [P] Implement unique test data builders in `tests/e2e/support/data.ts`
- [x] T007 [P] Implement stable selector helpers and text assertions in `tests/e2e/support/selectors.ts`
- [x] T008 Create base Playwright test hooks for auth token acquisition and cleanup registration in `tests/e2e/dashboard-content.spec.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Dashboard Content Publishes To Public Site (Priority: P1) MVP

**Goal**: Verify dashboard-managed projects, services, page content, and jobs propagate to public website routes.

**Independent Test**: Run `npm run test:e2e -- --grep "dashboard content publishes"` and verify all created content appears publicly and is cleaned up.

### Tests for User Story 1

- [x] T009 [US1] Add dashboard login browser test in `tests/e2e/dashboard-content.spec.ts`
- [x] T010 [US1] Add project create/listing/detail/edit public verification test in `tests/e2e/dashboard-content.spec.ts`
- [x] T011 [US1] Add service create and public `/services` verification test in `tests/e2e/dashboard-content.spec.ts`
- [x] T012 [US1] Add page content update, public route verification, and restore test in `tests/e2e/dashboard-content.spec.ts`
- [x] T013 [US1] Add active job create and public `/careers` verification test in `tests/e2e/dashboard-content.spec.ts`

**Checkpoint**: User Story 1 works independently.

---

## Phase 4: User Story 2 - Public Contact Messages Reach Dashboard (Priority: P2)

**Goal**: Verify public contact form submissions reach dashboard messages.

**Independent Test**: Run `npm run test:e2e -- --grep "contact form"` and verify submitted inquiry appears in `/messages`.

### Tests for User Story 2

- [x] T014 [US2] Add public contact form submission and dashboard `/messages` verification test in `tests/e2e/dashboard-content.spec.ts`

**Checkpoint**: Contact inquiry flow works independently.

---

## Phase 5: User Story 3 - Publication States And Uploads Behave Correctly (Priority: P3)

**Goal**: Verify active/inactive visibility and protected upload handling.

**Independent Test**: Run `npm run test:e2e -- --grep "visibility and uploads"` and verify inactive jobs stay hidden, active jobs appear, and uploaded image URL is reachable.

### Tests for User Story 3

- [x] T015 [US3] Add inactive-to-active job visibility test in `tests/e2e/dashboard-content.spec.ts`
- [x] T016 [US3] Add protected image upload and public asset verification test in `tests/e2e/dashboard-content.spec.ts`

**Checkpoint**: Publication state and upload coverage works independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation alignment, and failure fixes.

- [x] T017 Update `specs/20261005-195600-dashboard-content-e2e/quickstart.md` if final commands differ
- [x] T018 Run `npm run typecheck` and fix E2E-related type errors
- [x] T019 Run `npm run test:e2e` and fix real failures
- [x] T020 Review cleanup behavior and confirm no test records remain after the run
