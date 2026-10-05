# Implementation Plan: Client Handover Guide

**Branch**: `012-client-handover-guide` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/012-client-handover-guide/spec.md`

## Summary

Create bilingual English and Arabic client handover documentation for non-technical Fortune Construction staff. The documentation will be based on a review of the current public website routes, dashboard routes, visible screens, and repository behavior; it will explain daily operation, content management, project/service updates, form and message handling, media practices, roles/access expectations, security notes, FAQ, troubleshooting, and final handover checks. Deliverables are Markdown files suitable for later PDF export.

## Technical Context

**Language/Version**: Markdown documentation in English and Arabic; repository context is TypeScript monorepo.  
**Primary Dependencies**: Existing public React/Vite site, dashboard React/Vite app, Express API, and repository documentation conventions.  
**Storage**: Repository documentation files only; no data storage changes.  
**Testing**: Manual documentation review, route/screen inventory verification, bilingual section parity check, Markdown rendering check, and optional `npm run typecheck` only if source inspection requires confidence in current route behavior.  
**Target Platform**: Repository-hosted client handover documents intended for PDF export and client delivery.  
**Project Type**: Documentation feature for a monorepo web application.  
**Performance Goals**: Documentation must be scannable by non-technical staff; required operational sections should be locatable within 2 minutes in either language file.  
**Constraints**: No code behavior changes; no secrets, credentials, private messages, tokens, or sensitive deployment internals; Arabic content must remain readable when exported to PDF; unavailable or unverified areas must be explicitly marked.  
**Scale/Scope**: Two complete guide files plus supporting handover checklist content, covering the current public site, dashboard, and common daily operations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Component-First UI**: Pass. No UI components or design tokens are changed; documentation will describe current UI behavior only.
- **API-Contract Driven**: Pass. No API contracts are changed; documentation will reference API-backed dashboard behavior only as user-facing operations.
- **Type Safety (NON-NEGOTIABLE)**: Pass. No TypeScript implementation is planned.
- **Test-First**: Pass. This documentation feature uses review checklists and acceptance contracts instead of new API tests because no API or utility behavior changes are in scope.
- **Performance & UX Consistency**: Pass. No runtime UX changes are planned; media guidance will reinforce image/content quality.
- **Monorepo Discipline**: Pass. Documentation remains in repo documentation paths and Spec Kit artifacts remain under `specs/012-client-handover-guide/`.

No constitution violations are introduced.

## Project Structure

### Documentation (this feature)

```text
specs/012-client-handover-guide/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── handover-documentation-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
docs/
├── handover/
│   ├── fortune-construction-handover-guide-en.md
│   └── fortune-construction-handover-guide-ar.md
└── hostinger-vps-deployment.md

src/
├── router.tsx
├── pages/
└── components/

apps/dashboard/src/
├── App.tsx
├── components/Sidebar.tsx
├── pages/
└── lib/api.ts

apps/api/src/
├── index.ts
├── routes/
└── models/
```

**Structure Decision**: Implement the client-facing deliverables as Markdown files under `docs/handover/` so they live beside existing repository documentation and remain easy to export to PDF. Source files are reviewed for current behavior but should not be modified for this feature.

## Route and Screen Inventory for Documentation

### Public Website

- `/` Home
- `/about` About
- `/projects` Projects listing and portfolio
- `/projects/:id` Project details
- `/services` Services
- `/hse` HSE
- `/careers` Careers and applications
- `/contact` Contact and inquiry form
- `*` Not found/error handling

### Dashboard

- `/login` Dashboard sign in
- `/` Overview
- `/projects` Projects
- `/project-categories` Project Categories
- `/services` Services
- `/team` Team
- `/partners` Partners
- `/jobs` Job Positions
- `/applications` Applications
- `/messages` Messages
- `/content` Page Content
- `/settings` Settings
- `*` Not found/redirect handling

### API-Backed Content Areas

- Authentication
- Projects and project categories
- Services
- Partners
- Team members
- Job positions and applications
- Contact messages
- Site settings
- Uploads
- Stats
- Page content
- Success stories

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), and [handover-documentation-contract.md](./contracts/handover-documentation-contract.md).

## Post-Design Constitution Check

- **Component-First UI**: Pass. Documentation will reference current public and dashboard screens without introducing UI work.
- **API-Contract Driven**: Pass. The contract artifact defines documentation acceptance, not API changes.
- **Type Safety**: Pass. No TypeScript changes are planned.
- **Test-First**: Pass. Acceptance checks are defined in the documentation contract and quickstart.
- **Performance & UX Consistency**: Pass. PDF-ready Markdown and media best practices support consistent client operations.
- **Monorepo Discipline**: Pass. Deliverables and planning artifacts stay in the agreed repository locations.

## Complexity Tracking

No constitution violations require justification.
