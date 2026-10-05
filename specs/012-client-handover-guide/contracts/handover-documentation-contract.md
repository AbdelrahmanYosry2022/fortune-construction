# Handover Documentation Contract

## Purpose

Define the acceptance contract for the bilingual Fortune Construction client handover guide. This is a documentation contract, not an API contract.

## Deliverable Files

- `docs/handover/fortune-construction-handover-guide-en.md`
- `docs/handover/fortune-construction-handover-guide-ar.md`

## Required Section Contract

Each deliverable file must include:

- Website overview
- Dashboard overview
- Content management
- Project and service updates
- Form and message handling
- Media and content best practices
- User roles or access expectations
- Security notes
- FAQ
- Troubleshooting
- Handover checklist

## Current Behavior Review Contract

The guides must be based on review of:

- Public website routes from `src/router.tsx`
- Public pages from `src/pages/`
- Dashboard routes from `apps/dashboard/src/App.tsx`
- Dashboard navigation from `apps/dashboard/src/components/Sidebar.tsx`
- API-backed content areas from `apps/api/src/index.ts`, `apps/api/src/routes/`, and `apps/api/src/models/`
- Dashboard API helper behavior from `apps/dashboard/src/lib/api.ts`

Any unavailable, disabled, future-use, or unverified area must be clearly labeled in both language files.

## Screenshot Decision Contract

Before drafting the final guides, the implementer must decide whether dashboard-heavy workflows require screenshots. If screenshots are included, the guide must place them near the workflow they support and keep captions non-technical. If screenshots are not included, the guide must record why Markdown-only guidance is sufficient for the handover, such as stable route labels, clear dashboard navigation, or client preference for text-first PDF documentation.

## Content Safety Contract

The guides must not include:

- Passwords
- Secret keys
- API tokens
- Private customer messages
- Private job applications
- Hidden administrative URLs not meant for client documentation
- Sensitive server or deployment internals

## Language Parity Contract

The Arabic guide must provide equivalent operational meaning to the English guide. Product names, route labels, and dashboard labels may remain in English where translating them would make staff lookup harder.

## PDF Readiness Contract

The Markdown must use:

- Clear heading hierarchy
- Short sections suitable for page breaks
- Tables only when helpful and simple
- Checklists for handover confirmation
- No broken relative references
- Arabic text structured so it remains readable after export

## Acceptance Checks

- All required sections appear in both files.
- All public and dashboard routes are covered or explicitly marked.
- A non-technical reviewer can find the required section they need within 2 minutes.
- A reviewer can follow a simulated content update workflow without developer explanation.
- A reviewer can identify at least 5 troubleshooting or escalation actions.
- The handover checklist can be completed in one handover session.
- The route/screen inventory and screenshot decision are explicitly verified before final review.
