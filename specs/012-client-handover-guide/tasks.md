# Tasks: Client Handover Guide

**Input**: Design documents from `/specs/012-client-handover-guide/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: This is a documentation feature. Tasks use explicit review checks instead of automated runtime tests because no source behavior changes are planned.

**Organization**: Tasks are grouped by user story so each story can be implemented and reviewed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or is a read-only review.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Every task includes an exact file or directory path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the documentation workspace and source checklist.

- [x] T001 Create the handover documentation directory in `docs/handover/`.
- [x] T002 Create the English guide shell with required headings in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T003 Create the Arabic guide shell with equivalent required headings in `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T004 Create a working inventory checklist section or table in `docs/handover/fortune-construction-handover-guide-en.md` for public routes, dashboard routes, content areas, and verification status.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify current behavior and make documentation decisions before drafting user-facing guidance.

**CRITICAL**: No guide drafting should begin until this phase is complete.

- [x] T005 Verify public website routes against `src/router.tsx` and record the reviewed routes in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T006 Verify dashboard routes against `apps/dashboard/src/App.tsx` and record the reviewed routes in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T007 Verify dashboard navigation labels and visible management areas against `apps/dashboard/src/components/Sidebar.tsx` and record them in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T008 Review public page files in `src/pages/` and record visible screen purposes, main user-facing fields/actions, unavailable or unverified areas, and client-facing workflow notes in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T009 Review dashboard page files in `apps/dashboard/src/pages/` and record visible screen purposes, main user-facing fields/actions, unavailable or unverified areas, and client-facing workflow notes in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T010 Verify dashboard API base, upload, media upload, and authorization behavior against `apps/dashboard/src/lib/api.ts` and record only client-facing implications without exposing hidden URLs, tokens, secrets, or sensitive internals in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T011 Verify API route registration against `apps/api/src/index.ts` and record API-backed content areas as client-facing implications only in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T012 Verify available API route modules in `apps/api/src/routes/` and mark unavailable, disabled, future-use, or unverified areas without exposing hidden URLs, tokens, secrets, or sensitive internals in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T013 Verify available API models in `apps/api/src/models/` and align content-area terminology without exposing private fields, sensitive internals, or confidential data in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T014 Decide whether dashboard-heavy workflows need screenshots and record either screenshot usage guidance or the Markdown-only rationale in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T015 Mirror the finalized route, screen, content-area, status-label, and screenshot-decision notes from the English guide into `docs/handover/fortune-construction-handover-guide-ar.md`.

**Checkpoint**: Source inventory and screenshot decision are verified and documented in both guides.

---

## Phase 3: User Story 1 - Learn Daily Operations (Priority: P1) MVP

**Goal**: Client staff can understand the website, dashboard, navigation, and daily responsibilities without developer support.

**Independent Test**: Give either guide to a non-technical reviewer and ask them to identify public website areas, dashboard areas, and routine daily responsibilities without additional explanation.

### Implementation for User Story 1

- [x] T016 [US1] Draft the English website overview, dashboard overview, navigation summary, daily responsibilities, and routine monitoring guidance in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T017 [US1] Draft the Arabic website overview, dashboard overview, navigation summary, daily responsibilities, and routine monitoring guidance in `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T018 [US1] Review both guide overviews for non-technical language, route coverage, and matching operational meaning in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.

**Checkpoint**: User Story 1 is complete when a reviewer can explain the public website, dashboard, and daily operating responsibilities from either language guide.

---

## Phase 4: User Story 2 - Manage Website Content (Priority: P2)

**Goal**: Client staff can manage content, projects, services, messages, forms, applications, and media using clear operational guidance.

**Independent Test**: Ask a reviewer to follow the content-management sections and explain how to update project/service information, handle messages, and prepare media for publishing.

### Implementation for User Story 2

- [x] T019 [US2] Draft English content-management, project update, service update, form/message handling, application review, and publishing verification guidance in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T020 [US2] Draft English media and content best-practice guidance covering image quality, file naming, size awareness, brand consistency, writing clarity, and approval expectations in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T021 [US2] Draft Arabic content-management, project update, service update, form/message handling, application review, and publishing verification guidance in `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T022 [US2] Draft Arabic media and content best-practice guidance covering image quality, file naming, size awareness, brand consistency, writing clarity, and approval expectations in `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T023 [US2] Review content, project, service, message, application, and media workflows for source-inventory alignment in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.

**Checkpoint**: User Story 2 is complete when a reviewer can follow a simulated content update path from preparation through verification without developer explanation.

---

## Phase 5: User Story 3 - Troubleshoot and Complete Handover (Priority: P3)

**Goal**: Client staff can operate safely, resolve basic issues, understand access expectations, use the FAQ, and complete the handover checklist.

**Independent Test**: Ask the client representative to use the FAQ, troubleshooting section, security notes, and checklist to decide what to do for common access, content, media, message, and handover issues.

### Implementation for User Story 3

- [x] T024 [US3] Draft English user-role or access-expectation guidance, security notes, troubleshooting guidance, FAQ, escalation guidance, and handover checklist in `docs/handover/fortune-construction-handover-guide-en.md`.
- [x] T025 [US3] Draft Arabic user-role or access-expectation guidance, security notes, troubleshooting guidance, FAQ, escalation guidance, and handover checklist in `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T026 [US3] Review both guides for at least 5 clear troubleshooting or escalation actions in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T027 [US3] Review both handover checklists for document receipt, access review, workflow training, security review, and follow-up item coverage in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.

**Checkpoint**: User Story 3 is complete when a client representative can use the guide to resolve or escalate common issues and complete the handover checklist.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation quality, safety, and PDF-readiness review.

- [x] T028 Validate that all required sections from `specs/012-client-handover-guide/spec.md` appear in both `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T029 Validate both guides against `specs/012-client-handover-guide/contracts/handover-documentation-contract.md`.
- [x] T030 Check both guides for secrets, credentials, private messages, private applications, tokens, hidden admin URLs, and sensitive deployment internals in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T031 Check Markdown heading hierarchy, tables, checklists, relative references, and Arabic readability for PDF export in `docs/handover/fortune-construction-handover-guide-en.md` and `docs/handover/fortune-construction-handover-guide-ar.md`.
- [x] T032 Update `specs/012-client-handover-guide/checklists/requirements.md` if final guide validation changes any checklist status.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; creates the documentation workspace.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user-story drafting.
- **User Story 1 (Phase 3)**: Depends on Foundational; recommended MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can run after or alongside US1 if the inventory is complete.
- **User Story 3 (Phase 5)**: Depends on Foundational; can run after or alongside US1/US2 if role/security decisions are clear.
- **Polish (Phase 6)**: Depends on all selected user stories being drafted.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other user stories after Foundational.
- **User Story 2 (P2)**: No dependency on other user stories after Foundational, but final language consistency benefits from US1 terminology.
- **User Story 3 (P3)**: No dependency on other user stories after Foundational, but FAQ and troubleshooting should reference completed workflow wording.

### Parallel Opportunities

- T005 through T013 are read-only source verification tasks and can be performed in parallel before consolidating results.
- English and Arabic drafting tasks can be split by language after shared terminology is agreed.
- US2 content workflow drafting and media best-practice drafting can proceed in parallel within each language if the same file edits are coordinated.
- T028 through T031 can be reviewed by separate reviewers, then reconciled before T032.

## Parallel Example: Foundational Inventory

```text
Task: "Verify public website routes against src/router.tsx and record the reviewed routes in docs/handover/fortune-construction-handover-guide-en.md"
Task: "Verify dashboard routes against apps/dashboard/src/App.tsx and record the reviewed routes in docs/handover/fortune-construction-handover-guide-en.md"
Task: "Verify API route registration against apps/api/src/index.ts and record API-backed content areas in docs/handover/fortune-construction-handover-guide-en.md"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational inventory and screenshot decision.
3. Complete Phase 3: User Story 1.
4. Stop and validate that a non-technical reviewer can understand the website, dashboard, and daily responsibilities from either guide.

### Incremental Delivery

1. Finish setup and foundational verification.
2. Deliver US1 for basic orientation.
3. Add US2 for content and media operations.
4. Add US3 for troubleshooting, security, FAQ, and handover completion.
5. Run Phase 6 to make the documentation client-ready.

### Notes

- Do not modify public site, dashboard, or API source behavior for this documentation feature.
- Keep guide language plain and operational.
- Mark unavailable, disabled, future-use, or unverified areas explicitly.
- Do not include credentials, tokens, secrets, private messages, private applications, or sensitive deployment details.
- Do not commit until explicitly requested.
