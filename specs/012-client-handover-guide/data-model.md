# Data Model: Client Handover Guide

## Handover Guide

Represents one complete client-facing guide in a single language.

**Fields**:

- `language`: English or Arabic.
- `title`: Client-facing guide title.
- `audience`: Non-technical Fortune Construction staff responsible for daily operations.
- `sections`: Ordered set of required guide sections.
- `routeCoverage`: Public website and dashboard areas reviewed for the guide.
- `statusLabels`: Notes for unavailable, disabled, future-use, or unverified areas.
- `handoverChecklist`: Confirmable delivery and training items.

**Validation Rules**:

- Must include all required sections from the feature request.
- Must avoid secrets, credentials, private customer data, and sensitive deployment internals.
- Must remain readable as Markdown and suitable for PDF export.
- Arabic version must provide equivalent operational guidance to the English version.

## Guide Section

Represents a major content area in each handover guide.

**Fields**:

- `heading`: Plain-language section title.
- `purpose`: Why the section matters to daily operations.
- `steps`: Operational actions the staff member can follow.
- `notes`: Warnings, assumptions, or limitations.
- `relatedAreas`: Website, dashboard, or API-backed content areas covered by the section.

**Required Sections**:

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

## Route Inventory Item

Represents a reviewed public or dashboard route.

**Fields**:

- `route`: User-facing path or dashboard path.
- `label`: Plain-language screen name.
- `source`: Repository file or navigation source used for verification.
- `operationalUse`: What client staff should understand about the route.
- `status`: Active, unavailable, disabled, future-use, or unverified.

**Validation Rules**:

- Every current public website route must be represented in the guide.
- Every current dashboard navigation route must be represented or explicitly marked not applicable.
- Unverified areas must not be described as active daily workflows.

## Operational Workflow

Represents a repeatable staff task.

**Fields**:

- `name`: Task name.
- `trigger`: When staff should perform the task.
- `steps`: Ordered non-technical actions.
- `verification`: How staff confirm the task is complete.
- `escalation`: When staff should ask an administrator or support contact for help.

**Core Workflows**:

- Review public website information.
- Update page content.
- Update project information.
- Update service information.
- Review and respond to contact messages.
- Review applications.
- Prepare and upload media.
- Check dashboard status.
- Complete handover checklist.

## Handover Checklist Item

Represents a confirmable handover action.

**Fields**:

- `item`: Action to confirm.
- `owner`: Client, delivery team, or shared.
- `evidence`: What proves the item is complete.
- `status`: Pending, completed, not applicable, or follow-up needed.

**Validation Rules**:

- Checklist must support a single handover session.
- Checklist must include document receipt, access review, workflow training, security review, and follow-up items.

## State Transitions

- `Draft` -> `Reviewed`: All required sections are present in both languages.
- `Reviewed` -> `Client Ready`: Route/screen inventory, language parity, security safety, and Markdown rendering checks pass.
- `Client Ready` -> `Needs Update`: Current website or dashboard behavior changes after guide creation.
- `Needs Update` -> `Client Ready`: Updated guide passes the same review checks again.
