# Fortune Construction Website and Dashboard User Guide

**Language**: English  
**Audience**: Fortune Construction staff responsible for daily website and dashboard operations  
**Last reviewed**: 2026-07-29  

## How To Use This Guide

Use this guide as a daily operating catalog for the Fortune Construction website and dashboard. It explains what the public website shows, what the dashboard manages, how to update content, how to handle messages and applications, and when to escalate an issue.

Do not store passwords, customer private information, or confidential project data inside this guide. Keep any login details in the company-approved password manager or secure internal record.

## Review Inventory

The guide was prepared from the current website behavior, dashboard behavior, and visible screens listed below.

| Area | Reviewed Area | Client-Facing Purpose | Main Fields or Actions | Status |
| --- | --- | --- | --- | --- |
| Public routes | Public website navigation | Confirms website pages visitors can open | Home, About, Projects, Project Details, Services, HSE, Careers, Contact, error pages | Verified |
| Public page screens | Visitor-facing website pages | Confirms visible page purpose and visitor actions | Page hero content, portfolio filters, project details, contact form, careers form, fallback states | Verified |
| Dashboard routes | Dashboard screen access after sign in | Confirms dashboard screens available after sign in | Overview, Projects, Project Categories, Services, Team, Partners, Jobs, Applications, Messages, Page Content, Settings | Verified |
| Dashboard navigation | Dashboard sidebar menu | Confirms sidebar labels staff use every day | Management links and Live Site shortcut | Verified |
| Dashboard page screens | Dashboard management screens | Confirms visible management fields and actions | Add, edit, delete, search, filter, upload, mark as read, status change, save settings | Verified |
| Dashboard access and upload behavior | Sign-in session and media upload behavior | Explains client-facing access and upload behavior | Login session, automatic sign-out on expired access, image/video upload helpers | Client-facing implications only |
| System-backed content areas | Website content managed by the dashboard | Confirms what dashboard content is backed by the system | Projects, categories, services, partners, team, jobs, applications, messages, settings, uploads, stats, page content, success stories | Verified |

### Current Public Website Routes

| Website Area | Route | What Visitors See or Do | Staff Review Notes |
| --- | --- | --- | --- |
| Home | `/` | Main landing page and company introduction | Review headline, key stats, featured content, and call-to-action text regularly. |
| About | `/about` | Company story, vision, mission, timeline, values, and leadership | Review leadership details and company history. Leadership can show a pending state if profiles are not available. |
| Projects | `/projects` | Project portfolio with filters and search | Review project titles, categories, status, locations, images, and portfolio quality. |
| Project Details | `/projects/:id` | Detailed case study with facts, scope, methods, challenge, solution, result, and gallery | Ensure each public project has enough detail before publishing. |
| Services | `/services` | Service categories and descriptions | Review service titles, taglines, descriptions, features, and visuals. |
| HSE | `/hse` | Safety, quality, policies, stats, certifications, and HSE policy call-to-action | Review policies, certification text, and safety statistics before client delivery. |
| Careers | `/careers` | Benefits, open jobs, and application form | Keep job positions current and review submitted applications in the dashboard. |
| Contact | `/contact` | Contact details and project consultation form | Keep phone, email, address, and working hours current in Settings. |
| Error and Not Found | Error pages | Friendly recovery screens | If visitors report errors, record the route and time, then escalate. |

### Current Dashboard Screens

| Dashboard Screen | Purpose | Main Fields or Actions | Notes |
| --- | --- | --- | --- |
| Login | Sign in to the management dashboard | Username, password, sign-in button | Use only issued credentials. If a demo hint appears in a non-demo environment, ask the administrator to remove or disable it. |
| Overview | Daily status summary | Total projects, job positions, applications, messages, recent applications, recent messages, quick links | Use first each day to check new applications and unread messages. |
| Projects | Manage public portfolio and project details | Title, category, status, location, client name, dates, value, overview, scope, methods, challenge, solution, result, cover image, gallery, coordinates, add/edit/delete | High-impact screen. Verify project details carefully before saving. |
| Project Categories | Manage project filters and portfolio categories | Category name, slug, icon key, display order, active/disabled state | Use for portfolio organization. Disable unused categories only after checking related projects. |
| Services | Manage service cards and service details | Title, tagline, icon, background image, description, feature list, add/edit/delete | Keep service names and claims accurate. |
| Team | Manage leadership and team profiles | Name, role, bio, photo, social links, add/edit/delete | Public leadership may show pending state if team profiles are missing. |
| Partners | Manage business partner logos and details | Partner name, abbreviation, logo, website, description, display order, add/edit/delete | Use high-quality logo files and verify website links. |
| Job Positions | Manage open roles | Job title, location, type, description, requirements, active state, add/edit/delete | Disable filled roles instead of leaving outdated openings public. |
| Applications | Review candidate submissions | Search, status filter, expand details, update status, delete | Statuses are new, reviewed, shortlisted, and rejected. Handle private applicant data carefully. |
| Messages | Review project inquiries | Search, read/unread filter, expand message, mark as read, delete | Respond outside the dashboard using the approved company communication process. |
| Page Content | Manage structured page sections | Select page, edit section fields, upload media, save section | Use for flexible page content. Treat any unclear field as unverified until checked with the delivery team. |
| Settings | Manage company-wide information | Company name, founded year, tagline, contact info, hero text, social links | Changes can affect public contact details and homepage messaging. |
| Dashboard Error and Not Found | Recovery screens | Reload, return to dashboard | If repeated, record the screen and action before escalation. |

### API and System Behavior Notes for Staff

- Some public content is readable by visitors, while dashboard changes require signed-in access.
- If access expires, the dashboard may return the user to the login screen. Sign in again with issued credentials.
- Upload buttons are used for images, videos, and CV files depending on the screen.
- The system validates file type and size. If an upload fails, check the file format and try a smaller file.
- Do not share upload links, internal paths, tokens, or technical error details with customers.
- Unverified area: Success stories are system-backed, but no active dashboard sidebar screen for direct success-story management was verified in the current dashboard navigation. Treat as future-use or developer-managed until confirmed.

### Screenshot Decision

Screenshots are not included in this version. Markdown-only guidance is sufficient because the dashboard uses stable sidebar labels, clear add/edit/delete buttons, and repeated form patterns across screens. Text-only documentation is easier to maintain when screens change and exports cleanly to PDF in both English and Arabic.

If the client later requests visual training material, add screenshots for Projects, Page Content, Messages, Applications, and Settings first because those are the most dashboard-heavy workflows.

## Website Overview

The public website presents Fortune Construction to visitors, partners, job applicants, and potential clients. It should always reflect accurate company information, current projects, active services, safe contact details, and professional media.

Daily or weekly staff checks:

- Open the home page and confirm the main message still feels current.
- Review the Projects page for outdated project statuses or missing images.
- Review the Contact page to confirm phone, email, office address, and working hours.
- Check Careers if recruitment is active.
- Confirm no page shows missing content, broken images, or temporary unavailable messages.

## Dashboard Overview

The dashboard is the private management area for website content and inquiries. Most daily work starts on the Overview screen, then moves into Messages, Applications, Projects, Jobs, Page Content, or Settings.

Recommended daily routine:

1. Sign in with issued dashboard credentials.
2. Open Overview.
3. Check unread messages and new applications.
4. Review urgent public updates, such as job postings or project corrections.
5. Save only reviewed content.
6. Open the Live Site shortcut and confirm important changes appear publicly.
7. Sign out or close the session when finished on a shared device.

## Content Management

Use Page Content and Settings for general website text and company-wide information. Use Projects, Services, Team, Partners, Jobs, Messages, and Applications for their specific content areas.

Before editing content:

- Confirm the request came from an approved manager or department owner.
- Prepare final wording before opening the dashboard.
- Check spelling, names, dates, phone numbers, and email addresses.
- Avoid confidential client details unless approved for public display.
- Save one section at a time and review it on the public website if it is visitor-facing.

When editing Page Content:

1. Open Page Content.
2. Select the relevant page or section.
3. Update text or media fields.
4. Upload media only when it is approved and properly prepared.
5. Save the section.
6. Open the public page and confirm the content reads correctly.

Unavailable or unverified areas should be marked in internal notes and not described to customers as active services.

## Project and Service Updates

### Project Updates

Projects affect the public portfolio and project detail pages. Use the Projects dashboard screen for new projects, corrections, and project status updates.

Review before saving:

- Project title
- Category
- Status: Ongoing or Completed
- Location
- Client name, if approved for public display
- Start and end dates
- Project value and budget, if approved
- Overview
- Scope of work
- Technologies or methods
- Challenge, solution, and final result
- Cover image and gallery images
- Map coordinates, if available

Recommended workflow:

1. Gather approved project details and images.
2. Confirm category exists in Project Categories.
3. Add or edit the project.
4. Save.
5. Review the Projects page and the project detail page.
6. Correct any formatting, missing images, or unclear text.

### Service Updates

Services explain what Fortune Construction offers. Use the Services dashboard screen for service names, taglines, descriptions, icons, background images, and feature lists.

Recommended workflow:

1. Confirm the service is currently offered.
2. Prepare a short title and plain description.
3. Add or edit features as short bullet-style statements.
4. Upload or select a clear icon or image.
5. Save and review the public Services page.

Do not exaggerate capabilities or list services not approved by management.

## Form and Message Handling

### Contact Messages

Website visitors submit project inquiries through the Contact page. These appear in Messages.

Daily workflow:

1. Open Overview and check unread message count.
2. Open Messages.
3. Search or filter if needed.
4. Open new messages and read the sender name, email, phone, and project brief.
5. Mark messages as read after review.
6. Respond using the approved company email or phone process.
7. Record important follow-up in the company CRM or internal tracker if applicable.
8. Delete messages only according to company retention policy.

Escalate messages that mention legal issues, media inquiries, accidents, urgent site incidents, suspicious attachments, or confidential tender information.

### Job Applications

Applicants submit careers forms with contact details, target position, cover letter, and CV. These appear in Applications.

Recommended workflow:

1. Open Applications.
2. Filter by status or search by name, email, or position.
3. Expand the application details.
4. Update status to reviewed, shortlisted, or rejected based on the HR process.
5. Do not download or share CVs outside approved HR handling.
6. Delete applications only according to HR retention rules.

Applicant data is private and should be handled with extra care.

## Media and Content Best Practices

Use clear, approved, professional files.

Image guidance:

- Use sharp, well-lit images.
- Avoid dark, blurry, cropped, or low-resolution images.
- Use project photos that show real work, equipment, roads, buildings, staff, or completed infrastructure.
- Do not upload images that reveal confidential documents, personal data, safety incidents, or unapproved client information.
- Use descriptive filenames before uploading, such as `lilongwe-bridge-cover.jpg`.

Video guidance:

- Use short, relevant video clips only when they support a page section.
- Check that the file is approved and not too large.
- Avoid videos with private conversations, license plates, confidential site details, or unsafe work practices.

Writing guidance:

- Keep sentences short.
- Write for clients and the public, not engineers only.
- Use approved company names, project names, and service names.
- Check numbers, dates, and locations before publishing.
- Ask for approval before publishing sensitive project values or client names.

## User Roles and Access Expectations

The current dashboard shows a single administrator-style access flow. Separate role levels were not verified in the visible dashboard screens.

Current access expectations:

- Only authorized staff should sign in.
- Do not share one account between multiple people unless management explicitly approves it.
- Each staff member should use issued credentials when available.
- The responsible employee should know who approves content, who replies to messages, who handles applications, and who can request support.

Future-use note: If role-based access is added later, update this guide with each role's allowed screens and responsibilities.

## Security Notes

- Never add passwords or login details to website content, project notes, or shared documents.
- Do not send dashboard access details through public chat or email without approved security controls.
- Lock your device or sign out when leaving a workstation.
- Treat messages, applications, CVs, and phone numbers as private information.
- Do not open suspicious files from applicants or unknown senders.
- Do not publish private client data, private project budgets, contract terms, site incidents, or staff personal information without approval.
- If a screen shows repeated errors, do not retry many times with different data. Record what happened and escalate.
- If you suspect unauthorized access, contact the administrator immediately.

## Troubleshooting

| Issue | Basic Check | What To Do |
| --- | --- | --- |
| Cannot sign in | Confirm username and password were issued to you | Ask the administrator to reset or verify access. |
| Dashboard returns to login | Session may have expired | Sign in again. If it repeats, escalate. |
| Upload fails | Check file type, file size, and internet connection | Try a prepared smaller file. If it still fails, escalate. |
| Public page does not update | Confirm you saved the right dashboard section | Refresh the public page and check again. Escalate if still unchanged. |
| Project or service looks wrong | Check fields, image, and formatting | Correct the draft, save, and review the public page again. |
| Messages or applications are missing | Check filters and search text | Clear filters. If still missing, escalate. |
| Data temporarily unavailable | Internet or API connection may be unavailable | Retry once, record the screen, and escalate if it continues. |
| Not found page appears | Route may be incorrect | Return to dashboard or home page and use the sidebar/navigation. |

## FAQ

### Who should use the dashboard?

Only authorized Fortune Construction staff assigned to website, content, HR, inquiry, or management operations.

### Can I publish a new project immediately?

Only after the project information, images, public client references, values, dates, and wording are approved.

### Where do I update phone, email, and address?

Use Settings for company-wide contact details. Review the Contact page after saving.

### Where do I update page text?

Use Page Content for structured page sections. Use specific screens like Projects or Services for their own content.

### Where do contact form submissions go?

They appear in Messages. Review, mark as read, and respond through the approved company communication channel.

### Where do job applications go?

They appear in Applications. Treat CVs and applicant details as private HR information.

### Should I delete old messages or applications?

Only follow the company's retention policy. If unsure, archive or leave them until a manager confirms.

### Why are screenshots not included?

This version is text-first because the dashboard labels and workflows are clear and easier to maintain in Markdown. Screenshots can be added later for training if requested.

### What if I see a feature not described here?

Mark it as unverified and ask the system administrator or website support contact before using it for live content.
