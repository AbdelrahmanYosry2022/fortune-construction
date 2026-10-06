# Tasks: Comprehensive Project Audit

**Input**: Design documents from `/specs/001-project-audit/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/audit-report.schema.md](./contracts/audit-report.schema.md), [quickstart.md](./quickstart.md)
**Tests**: No product test implementation requested. Verification tasks use local build/runtime/browser/API checks and record evidence.
**Organization**: Tasks are grouped by independently verifiable audit stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different source area or report section.
- **[Story]**: Maps to the audit story being delivered.
- Every task includes the concrete file path to inspect, update, or record into.

## Phase 1: Setup (Shared Audit Infrastructure)

**Purpose**: Prepare the audit report artifact and confirm active scope.

- [ ] T001 Confirm `.specify/feature.json` points to `specs/001-project-audit` and record active feature path in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T002 Create the required report skeleton from `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/contracts/audit-report.schema.md` in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T003 Add report metadata, scope, assumptions, redaction rules, and blocked-check policy from `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/quickstart.md` to `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T004 Verify current Git state with `git -C /Users/mohamedeidali/Desktop/fortune-construction status --short --branch` and record any Git blocker in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the complete source, configuration, and command inventory that all audit stories depend on.

**CRITICAL**: No user story review should begin until this inventory exists.

- [ ] T005 Inventory root scripts, workspace declarations, dependencies, and package versions from `/Users/mohamedeidali/Desktop/fortune-construction/package.json` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T006 [P] Inventory public website routes, pages, and entry points from `/Users/mohamedeidali/Desktop/fortune-construction/src/router.tsx`, `/Users/mohamedeidali/Desktop/fortune-construction/src/App.tsx`, and `/Users/mohamedeidali/Desktop/fortune-construction/src/pages/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T007 [P] Inventory public website API usage from `/Users/mohamedeidali/Desktop/fortune-construction/src/lib/apiClient.ts` and `/Users/mohamedeidali/Desktop/fortune-construction/src/hooks/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T008 [P] Inventory dashboard routes, pages, and admin workflows from `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/App.tsx` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/pages/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T009 [P] Inventory dashboard API/auth integration from `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/api.ts` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/auth.ts` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T010 [P] Inventory API route groups and middleware from `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/index.ts`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/`, and `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/middleware/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T011 [P] Inventory API models and data entities from `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/models/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T012 [P] Inventory deployment and build configuration from `/Users/mohamedeidali/Desktop/fortune-construction/vite.config.ts`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/vite.config.ts`, `/Users/mohamedeidali/Desktop/fortune-construction/vercel.json`, and `/Users/mohamedeidali/Desktop/fortune-construction/.vercelignore` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T013 Record sensitive/runtime artifact locations from `/Users/mohamedeidali/Desktop/fortune-construction/.env`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/.env`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/.env`, and `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/.mongodb-data/` without copying values into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: The audit report has a complete surface inventory and redaction-safe configuration inventory.

---

## Phase 3: User Story 1 - Verified Surface Coverage (Priority: P1) MVP

**Goal**: Confirm the report covers all discoverable website, dashboard, API, configuration, deployment, and shared-code surfaces.

**Independent Test**: A reviewer can open `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md` and see every discoverable surface listed with status `passed`, `issues-found`, `blocked`, or `not-applicable`.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Review public website components in `/Users/mohamedeidali/Desktop/fortune-construction/src/components/` and summarize surface status in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T015 [P] [US1] Review public website page journeys in `/Users/mohamedeidali/Desktop/fortune-construction/src/pages/` and summarize route coverage in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T016 [P] [US1] Review dashboard page journeys in `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/pages/` and summarize route coverage in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T017 [P] [US1] Review API endpoint coverage in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/` and summarize endpoint groups in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T018 [P] [US1] Review shared UI and alias usage in `/Users/mohamedeidali/Desktop/fortune-construction/src/lib/frontendSharedUi.tsx`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/dashboardSharedUi.tsx`, and `/Users/mohamedeidali/Desktop/fortune-construction/packages/shared-ui/` into `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T019 [US1] Mark any missing, duplicate, generated-only, or blocked surfaces in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: MVP audit coverage is complete even before deeper runtime or quality checks.

---

## Phase 4: User Story 2 - Runtime and Integration Verification (Priority: P1)

**Goal**: Identify build failures, runtime failures, broken routes, API connectivity problems, and frontend-dashboard-API mismatches.

**Independent Test**: The report contains command outcomes and integration findings with reproduction steps or blocked-check reasons.

### Implementation for User Story 2

- [ ] T020 [US2] Run `npm run typecheck` from `/Users/mohamedeidali/Desktop/fortune-construction` and record summarized output in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T021 [US2] Run `npm run build` from `/Users/mohamedeidali/Desktop/fortune-construction` and record summarized output in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T022 [P] [US2] Run `npm run build --workspace=apps/dashboard` from `/Users/mohamedeidali/Desktop/fortune-construction` and record summarized output in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T023 [P] [US2] Run `npm run build --workspace=apps/api` from `/Users/mohamedeidali/Desktop/fortune-construction` and record summarized output in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T024 [US2] Compare public website API base URL behavior in `/Users/mohamedeidali/Desktop/fortune-construction/src/lib/apiClient.ts` against API server behavior in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/index.ts` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T025 [US2] Compare dashboard API/auth behavior in `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/api.ts` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/auth.ts` against `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/auth.ts` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T026 [P] [US2] Review API request validation and error responses in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/` and record integration risks in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T027 [P] [US2] Review public form and content fetch flows in `/Users/mohamedeidali/Desktop/fortune-construction/src/components/contact/`, `/Users/mohamedeidali/Desktop/fortune-construction/src/components/ApplicationForm.tsx`, and `/Users/mohamedeidali/Desktop/fortune-construction/src/hooks/usePageContent.ts` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T028 [US2] If builds allow, start local API with `npm run dev:api` from `/Users/mohamedeidali/Desktop/fortune-construction`, check `/health`, stop the server, and record outcome in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T029 [US2] If frontend builds allow, start local website with `npm run dev` from `/Users/mohamedeidali/Desktop/fortune-construction`, browser-check key public routes, stop the server, and record outcome in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T030 [US2] If dashboard builds allow, start dashboard with `npm run dev:dashboard` from `/Users/mohamedeidali/Desktop/fortune-construction`, browser-check login and key admin routes, stop the server, and record outcome in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: Runtime and integration findings are confirmed or explicitly blocked.

---

## Phase 5: User Story 3 - Code Quality and Maintainability Review (Priority: P2)

**Goal**: Identify maintainability risks, weak typing, duplicated patterns, dead code, missing tests, and fragile state/error handling.

**Independent Test**: The report includes code-quality findings with file references and clear recommendations.

### Implementation for User Story 3

- [ ] T031 [P] [US3] Review public website state, hooks, and utilities in `/Users/mohamedeidali/Desktop/fortune-construction/src/hooks/`, `/Users/mohamedeidali/Desktop/fortune-construction/src/store/`, and `/Users/mohamedeidali/Desktop/fortune-construction/src/lib/` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T032 [P] [US3] Review dashboard state, data fetching, and page patterns in `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/pages/` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T033 [P] [US3] Review API architecture, middleware, and model-route coupling in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T034 [P] [US3] Search for dead code, duplicate files, generated artifacts, and stale reports under `/Users/mohamedeidali/Desktop/fortune-construction/src/`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/`, and `/Users/mohamedeidali/Desktop/fortune-construction/` and record findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T035 [US3] Review missing test coverage and declared script gaps in `/Users/mohamedeidali/Desktop/fortune-construction/package.json`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/package.json`, and `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/package.json` and record recommendations in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: Maintainability risks are categorized and ready for prioritization.

---

## Phase 6: User Story 4 - Performance, SEO, UX, and Accessibility Review (Priority: P2)

**Goal**: Identify issues affecting load speed, discoverability, accessibility, responsiveness, and user experience.

**Independent Test**: The report includes measurable or evidence-backed findings for performance, SEO, accessibility, and UX categories.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Review public metadata, document structure, and crawlability from `/Users/mohamedeidali/Desktop/fortune-construction/index.html`, `/Users/mohamedeidali/Desktop/fortune-construction/public/`, and `/Users/mohamedeidali/Desktop/fortune-construction/src/pages/` and record SEO findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T037 [P] [US4] Review media, image, video, and asset handling in `/Users/mohamedeidali/Desktop/fortune-construction/src/components/hero/VideoBackground.tsx`, `/Users/mohamedeidali/Desktop/fortune-construction/src/components/ui/Image.tsx`, and `/Users/mohamedeidali/Desktop/fortune-construction/public/` and record performance findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T038 [P] [US4] Review public website responsive navigation, forms, empty/error/loading states, and visual consistency in `/Users/mohamedeidali/Desktop/fortune-construction/src/components/` and `/Users/mohamedeidali/Desktop/fortune-construction/src/pages/` and record UX findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T039 [P] [US4] Review dashboard workflow ergonomics, form states, table/list states, and responsive behavior in `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/components/` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/pages/` and record UX findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T040 [P] [US4] Review accessibility basics including semantic structure, labels, focus behavior, keyboard reachability, and contrast indicators in `/Users/mohamedeidali/Desktop/fortune-construction/src/` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/` and record accessibility findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T041 [US4] Use build output from `/Users/mohamedeidali/Desktop/fortune-construction/dist/` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/dist/` when available to summarize bundle/media risks in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: User-facing quality findings are ready for priority scoring.

---

## Phase 7: User Story 5 - Security and Configuration Review (Priority: P1)

**Goal**: Identify security-sensitive risks without exposing secret values.

**Independent Test**: The report lists confirmed and suspected security/configuration findings with redacted evidence and verification methods.

### Implementation for User Story 5

- [ ] T042 [P] [US5] Review CORS, Helmet, rate limit, static uploads, JSON limits, and server startup behavior in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/index.ts` and record security findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T043 [P] [US5] Review authentication and JWT handling in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/auth.ts`, `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/middleware/auth.ts`, and `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/config/` and record security findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T044 [P] [US5] Review file upload controls in `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/upload.ts` and record file-handling risks in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T045 [P] [US5] Review input validation and authorization assumptions across `/Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/` and record security findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T046 [P] [US5] Review client-side token storage, redirects, and auth state assumptions in `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/auth.ts` and `/Users/mohamedeidali/Desktop/fortune-construction/apps/dashboard/src/lib/api.ts` and record security findings in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T047 [P] [US5] Review `.gitignore` and deployment ignore behavior in `/Users/mohamedeidali/Desktop/fortune-construction/.gitignore`, `/Users/mohamedeidali/Desktop/fortune-construction/.vercelignore`, and `/Users/mohamedeidali/Desktop/fortune-construction/vercel.json` and record exposure risks in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T048 [US5] Run `npm audit --omit=dev` from `/Users/mohamedeidali/Desktop/fortune-construction` if network is available, otherwise record the network blocker in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: Security and configuration risks are redacted, categorized, and ready for priority scoring.

---

## Phase 8: User Story 6 - Prioritized Final Report (Priority: P1)

**Goal**: Produce the final stakeholder-ready audit report with top priorities, detailed findings, blocked checks, and verification log.

**Independent Test**: The final report lets a stakeholder identify the top five fixes without reading the full technical detail and lets an engineer reproduce or verify each critical/high finding.

### Implementation for User Story 6

- [ ] T049 [US6] Assign IDs, categories, severity, confidence, evidence, impact, recommendation, and verification method to every finding in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T050 [US6] Build the Critical/High/Medium/Low priority matrix in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T051 [US6] Write the top five fixes and executive summary in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T052 [US6] Complete surface summaries for website, dashboard, API, configuration/deployment, and shared code in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T053 [US6] Complete blocked checks with missing prerequisites and confidence impact in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T054 [US6] Complete the verification log for commands, browser checks, API checks, and static review checks in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T055 [US6] Validate the final report against `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/contracts/audit-report.schema.md` and record completion status in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

**Checkpoint**: Final audit report is complete and ready for remediation planning.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Ensure the audit package is internally consistent and ready for follow-up planning.

- [ ] T056 [P] Re-read `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/spec.md` and verify every FR-001 through FR-015 is represented in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T057 [P] Re-read `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/quickstart.md` and verify all safety rules were followed in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`
- [ ] T058 [P] Check `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md` for accidental secret values copied from `.env` files or database content and redact any sensitive value
- [ ] T059 [P] Check `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md` for unresolved placeholders, empty required sections, and findings without evidence
- [ ] T060 Prepare a concise implementation handoff summary in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 Verified Surface Coverage**: Depends on Foundational inventory.
- **US2 Runtime and Integration Verification**: Depends on Foundational inventory; can start in parallel with US3/US4/US5 after Phase 2.
- **US3 Code Quality and Maintainability Review**: Depends on Foundational inventory.
- **US4 Performance, SEO, UX, and Accessibility Review**: Depends on Foundational inventory and benefits from US2 build outputs.
- **US5 Security and Configuration Review**: Depends on Foundational inventory.
- **US6 Prioritized Final Report**: Depends on US1 through US5.
- **Polish**: Depends on US6 draft completion.

### User Story Dependencies

- **US1 (P1)**: MVP coverage story; complete first after Phase 2.
- **US2 (P1)**: Can run after Phase 2; runtime tasks T028-T030 depend on build outcomes T020-T023.
- **US5 (P1)**: Can run after Phase 2; dependency audit T048 may be blocked by network access.
- **US3 (P2)**: Can run after Phase 2 independently.
- **US4 (P2)**: Can run after Phase 2; T041 depends on build artifacts from T021/T022 if they exist.
- **US6 (P1 finalization)**: Requires findings from US1-US5.

### Parallel Opportunities

- T006-T012 can run in parallel after T005.
- T014-T018 can run in parallel within US1.
- T022-T023 can run in parallel after T020.
- T026-T027 can run in parallel within US2.
- T031-T034 can run in parallel within US3.
- T036-T040 can run in parallel within US4.
- T042-T047 can run in parallel within US5.
- T056-T059 can run in parallel during final polish.

---

## Parallel Example: US2 Runtime and Integration Verification

```text
Task: "Run npm run build --workspace=apps/dashboard from /Users/mohamedeidali/Desktop/fortune-construction and record summarized output in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
Task: "Run npm run build --workspace=apps/api from /Users/mohamedeidali/Desktop/fortune-construction and record summarized output in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
Task: "Review API request validation and error responses in /Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/ and record integration risks in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
```

## Parallel Example: US5 Security and Configuration Review

```text
Task: "Review CORS, Helmet, rate limit, static uploads, JSON limits, and server startup behavior in /Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/index.ts and record security findings in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
Task: "Review authentication and JWT handling in /Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/routes/auth.ts, /Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/middleware/auth.ts, and /Users/mohamedeidali/Desktop/fortune-construction/apps/api/src/config/ and record security findings in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
Task: "Review .gitignore and deployment ignore behavior in /Users/mohamedeidali/Desktop/fortune-construction/.gitignore, /Users/mohamedeidali/Desktop/fortune-construction/.vercelignore, and /Users/mohamedeidali/Desktop/fortune-construction/vercel.json and record exposure risks in /Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) to produce a full surface inventory and initial report skeleton.
3. Stop and validate that every discoverable surface is represented before deeper findings are added.

### Incremental Delivery

1. Add US2 to confirm runtime/integration defects.
2. Add US5 to capture security/configuration risks early.
3. Add US3 and US4 for maintainability and user-facing quality.
4. Add US6 to prioritize all findings into a stakeholder-ready report.
5. Run final polish checks before using the report for remediation planning.

### Execution Notes

- Keep all report evidence in `/Users/mohamedeidali/Desktop/fortune-construction/specs/001-project-audit/audit-report.md`.
- Do not paste `.env` values, tokens, credentials, database records, or uploaded file content.
- Stop any dev server started for browser/API verification.
- Mark blocked checks explicitly instead of guessing.
- Treat source changes and actual fixes as a later remediation phase, not part of this task list.
