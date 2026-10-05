# Quickstart: Client Handover Guide

## Goal

Create and review the English and Arabic client handover guides before delivery to Fortune Construction staff.

## Expected Deliverables

- `docs/handover/fortune-construction-handover-guide-en.md`
- `docs/handover/fortune-construction-handover-guide-ar.md`

## Preparation

1. Review the active specification at `specs/012-client-handover-guide/spec.md`.
2. Review the documentation contract at `specs/012-client-handover-guide/contracts/handover-documentation-contract.md`.
3. Review current public routes in `src/router.tsx`.
4. Review current dashboard routes in `apps/dashboard/src/App.tsx`.
5. Review dashboard navigation labels in `apps/dashboard/src/components/Sidebar.tsx`.
6. Review dashboard API helper behavior in `apps/dashboard/src/lib/api.ts`.
7. Review API-backed content areas in `apps/api/src/index.ts`, `apps/api/src/routes/`, and `apps/api/src/models/`.
8. Decide whether dashboard-heavy workflows need screenshots; if screenshots are not included, document why Markdown-only guidance is sufficient for this handover.

## Drafting Steps

1. Create the `docs/handover/` directory if it does not already exist.
2. Draft the English guide first using the required section contract.
3. Draft the Arabic guide with equivalent operational guidance.
4. Include clear labels for unavailable, disabled, future-use, or unverified areas.
5. Avoid credentials, secrets, private messages, tokens, and sensitive deployment internals.
6. Keep the language non-technical, operational, and suitable for daily client use.

## Review Steps

1. Confirm all required sections appear in both language files.
2. Confirm all public website routes are covered.
3. Confirm all dashboard routes and sidebar areas are covered or marked not applicable.
4. Confirm project, service, message, application, media, content, and settings workflows are addressed.
5. Confirm security notes are practical and do not expose sensitive implementation details.
6. Confirm the FAQ answers common access, publishing, content, media, message, and support questions.
7. Confirm the handover checklist can be completed during a client handover session.
8. Confirm the screenshot decision is recorded in both guides or in a shared note referenced by both guides.
9. Preview Markdown rendering and check that Arabic content remains readable for later PDF export.

## Completion Criteria

The feature is ready for implementation completion when both guide files satisfy the documentation contract and the checklist from `specs/012-client-handover-guide/checklists/requirements.md` remains accurate.
