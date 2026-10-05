# Research: Client Handover Guide

## Decision: Use Two Complete Markdown Guides

**Rationale**: The specification requires English and Arabic documentation files suitable for later PDF export. Separate files allow each language to have natural structure, readable directionality, and complete handover content without forcing users to scan around the language they do not need.

**Alternatives considered**:

- Single bilingual file: rejected because it makes daily lookup slower and PDF export harder to format cleanly.
- English guide plus Arabic summary: rejected because the spec requires equivalent Arabic operational guidance.

## Decision: Store Client Deliverables Under `docs/handover/`

**Rationale**: The repository already has a `docs/` directory for operational documentation. A `handover/` subfolder keeps client-facing files discoverable while separating them from deployment notes.

**Alternatives considered**:

- Store guides inside `specs/012-client-handover-guide/`: rejected because Spec Kit artifacts are planning materials, while the guides are final client deliverables.
- Store guides at repository root: rejected because root-level documentation would add clutter.

## Decision: Base the Guide on Route and Screen Inventory

**Rationale**: FR-017 requires the documentation to reflect current public routes, dashboard routes, visible screens, and repository behavior. The plan therefore treats route files, sidebar navigation, page files, API route wiring, and dashboard API helpers as source material before drafting the guides.

**Alternatives considered**:

- Write a generic CMS handover guide: rejected because it could describe features the client does not have.
- Use only screenshots: rejected because screenshots can miss hidden route behavior, error states, and API-backed content areas.

## Decision: Mark Unavailable, Disabled, Future-Use, and Unverified Areas Explicitly

**Rationale**: The handover guide must not imply that every discovered route or model is ready for daily client use. Areas that cannot be verified through visible screens or repository behavior should be labeled clearly so client staff know whether to use, ignore, or escalate them.

**Alternatives considered**:

- Omit uncertain areas: rejected because the client may encounter them later without guidance.
- Treat uncertain areas as active: rejected because this risks misleading staff.

## Decision: Use Review-Based Quality Checks

**Rationale**: This feature changes documentation only. The best verification is a structured review for section completeness, language parity, route coverage, security safety, and Markdown/PDF readiness.

**Alternatives considered**:

- Add automated tests: rejected for this phase because no runtime behavior changes are required.
- Run full application builds as the main quality gate: rejected because builds do not prove the documentation is complete or client-ready.

## Route and Behavior Sources Reviewed

- Public routes: `src/router.tsx`
- Public pages: `src/pages/`
- Dashboard routes: `apps/dashboard/src/App.tsx`
- Dashboard navigation labels: `apps/dashboard/src/components/Sidebar.tsx`
- Dashboard API base/upload behavior: `apps/dashboard/src/lib/api.ts`
- API route registration: `apps/api/src/index.ts`
- API models and content areas: `apps/api/src/models/`
- API route modules: `apps/api/src/routes/`
