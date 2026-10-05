# Feature Specification: Dashboard Content E2E Suite

**Feature Branch**: `20261005-195600-dashboard-content-e2e`  
**Created**: 2026-10-05  
**Status**: Draft  
**Input**: User description: "Use Spec Kit to create and implement a complete E2E test suite for Fortune Construction. Tests must verify that content added or edited from the dashboard appears correctly on the public website, including dashboard login, project add/edit visibility on `/projects` and `/projects/:id`, service add visibility on `/services`, page content edit visibility on the matching public page, job position add visibility on `/careers`, contact form submission visibility on dashboard `/messages`, image/upload coverage if present, draft/published or active/inactive behavior if present, and cleanup of test data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard Content Publishes To Public Site (Priority: P1)

A content administrator needs confidence that creating and editing core business content in the dashboard is reflected on the public Fortune Construction website without manual database checks.

**Why this priority**: Projects, services, page content, and jobs are the highest-value content workflows for client staff and directly affect public-facing website accuracy.

**Independent Test**: Run the E2E suite against local API, dashboard, and public site servers; the suite signs in as the dashboard admin, creates unique test records, verifies public pages, edits records where required, verifies updates, and deletes the test records.

**Acceptance Scenarios**:

1. **Given** a seeded dashboard administrator exists, **When** the test signs in through `/login`, **Then** dashboard protected routes are accessible.
2. **Given** the dashboard is authenticated, **When** a project is created from `/projects`, **Then** the project appears on public `/projects` and its public `/projects/:id` detail page.
3. **Given** a test project exists, **When** its title, location, and case-study content are edited from the dashboard or authenticated content workflow, **Then** the updated values appear on public listing and detail pages.
4. **Given** the dashboard is authenticated, **When** a service is added from `/services`, **Then** the service title, description, and features appear on public `/services`.
5. **Given** the dashboard is authenticated, **When** page hero content is edited for a public page, **Then** that public page shows the updated heading and description.
6. **Given** the dashboard is authenticated, **When** an active job position is added from `/jobs`, **Then** it appears on public `/careers`.

---

### User Story 2 - Public Contact Messages Reach Dashboard (Priority: P2)

A public visitor submits the contact form and staff need confidence that the inquiry arrives in the dashboard message inbox.

**Why this priority**: Contact inquiries are a key conversion path and must not silently disappear.

**Independent Test**: Submit the public `/contact` form with unique test data, then sign in to the dashboard and verify the same name, email, and message are visible in `/messages`; delete the test message afterwards.

**Acceptance Scenarios**:

1. **Given** the public contact page is loaded, **When** a visitor submits a valid inquiry, **Then** the page confirms successful submission.
2. **Given** the inquiry was submitted, **When** an admin opens dashboard `/messages`, **Then** the new message is visible with the submitted contact details.

---

### User Story 3 - Publication States And Uploads Behave Correctly (Priority: P3)

A content administrator needs confidence that supported visibility states and media uploads do not publish unintended or broken content.

**Why this priority**: Active/inactive behavior and image uploads prevent public website regressions that are easy to miss in manual checks.

**Independent Test**: Create an inactive job and confirm it is not visible publicly until activated; upload a test image through the protected upload route and verify the served asset is reachable and appears when assigned to public content.

**Acceptance Scenarios**:

1. **Given** a job position is saved as inactive, **When** public `/careers` is viewed, **Then** the job is not shown.
2. **Given** that same job is activated, **When** public `/careers` is viewed again, **Then** the job appears.
3. **Given** an authenticated admin uploads a valid image, **When** the returned image URL is opened or assigned to public content, **Then** the image loads successfully and public content references it.

### Edge Cases

- The suite must isolate test records with a unique run marker so existing client data is not removed.
- Cleanup must run even when a verification assertion fails, deleting only records created by the current test run.
- Tests must not depend on ordering except where the UI explicitly sorts by creation date or configured order.
- If a dashboard UI control is temporarily hard to select reliably, tests may use authenticated API calls for setup or cleanup while still covering login and public visibility end to end.
- Draft/published behavior is only required where the app exposes such a state. Current known state behavior is active/inactive for job positions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The test suite MUST authenticate through the dashboard `/login` route using the seeded local administrator credentials.
- **FR-002**: The test suite MUST create a unique project through the dashboard content workflow or authenticated API, then verify it appears on public `/projects`.
- **FR-003**: The test suite MUST verify the created project's public `/projects/:id` detail page includes the expected title and case-study content.
- **FR-004**: The test suite MUST edit the test project and verify the edited values appear on public `/projects` and `/projects/:id`.
- **FR-005**: The test suite MUST create a unique service and verify it appears on public `/services` with its key visible content.
- **FR-006**: The test suite MUST update at least one public page content section and verify the matching public route displays the updated content.
- **FR-007**: The test suite MUST restore or clean up changed page content after verification.
- **FR-008**: The test suite MUST create a unique active job position and verify it appears on public `/careers`.
- **FR-009**: The test suite MUST verify supported visibility state behavior by confirming inactive jobs are hidden from public `/careers` and active jobs are shown.
- **FR-010**: The test suite MUST submit the public `/contact` form and verify the submitted message appears in dashboard `/messages`.
- **FR-011**: The test suite MUST cover uploads when the upload endpoint is available by uploading a valid image and verifying the served URL or public image usage.
- **FR-012**: The test suite MUST delete all project, service, job, contact message, and uploaded media records/files created by the test run where supported.
- **FR-013**: The test suite MUST be runnable from the repository with a documented command and predictable local server configuration.
- **FR-014**: The test suite MUST avoid deleting or mutating production/client content that was not created by the current run marker.

### Key Entities *(include if feature involves data)*

- **Admin Session**: Authenticated dashboard session used to access protected content operations.
- **Project**: Public portfolio record with title, category, status, location, cover image, overview, challenge, solution, result, and optional gallery.
- **Service**: Public service offering with title, tagline, description, features, icon, and background image.
- **Page Content Section**: Dynamic page section keyed by public page and section name, such as `contact.hero`.
- **Job Position**: Careers listing with title, location, type, description, requirements, and active/inactive visibility state.
- **Contact Message**: Public inquiry with name, email, phone, message, read state, and creation timestamp.
- **Uploaded Media**: Image or video asset returned by the protected upload API and served under `/uploads`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A single command runs the E2E suite locally and reports pass/fail for all requested scenarios.
- **SC-002**: Each test-created content item is verified on the relevant public route within 10 seconds of creation or update.
- **SC-003**: Cleanup removes 100% of records created by the current run when the API is reachable, including after failed assertions.
- **SC-004**: The suite verifies at least one media upload path by checking the returned asset is reachable with a successful HTTP response.
- **SC-005**: The suite fails when dashboard-created project, service, page content, job, or contact message data does not propagate to the public website or dashboard inbox.

## Assumptions

- Local development uses public site `http://localhost:5173`, dashboard `http://localhost:5174`, and API `http://localhost:3001` unless overridden by environment variables.
- The seeded local admin account is `admin` / `admin123`; no production credentials are used.
- Playwright is the preferred browser automation framework for this E2E suite.
- Tests may combine browser interactions with API requests for deterministic setup and cleanup, while preserving public end-to-end verification.
- Existing MongoDB fallback behavior can provide a local test database when no external `MONGODB_URI` is configured.
