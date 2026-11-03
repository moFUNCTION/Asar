Please make 10 agents work in parallel to do the tasks from Agent_01 to Agent_10, taking into consideration ASAR Project architecture and ASAR design system, and validating every step with ASAR_PROJECT_ARCHITECTURE.md.

Working directory: d:\asar
Integrity mode: development

Reference material:
- docs/ASAR_PROJECT_ARCHITECTURE.md
- docs/ASAR_DESIGN_SYSTEM.md
- docs/AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md
- docs/AGENT_02_BOOTH_DYNAMIC_PLANS_AND_BOOKING.md
- docs/AGENT_03_BOOTH_MEMORY_PAGE.md
- docs/AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md
- docs/AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md
- docs/AGENT_06_ADMIN_INVITATION_AND_FORM_BUILDER.md
- docs/AGENT_07_INVITATION_LANDING_AND_BOOKING.md
- docs/AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md
- docs/AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md
- docs/AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md

## Requirements

### R1. Shared Domain Models, Utilities & Strict File Boundaries (Agent 01)
Implement the shared domain models, Appwrite collection and bucket constants, order pipeline state machines, Web Audio analyzer, and EmailJS dispatch service in `packages/react-appwrite` following the boundaries in `docs/AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md`.

### R2. Booth Dynamic Plans, Booking Flow & Memory Page (Agents 02 & 03)
Implement the Booth dynamic plan selection, booking flow, manual payment screenshot upload in `apps/Booth`, and the Booth Memory presentation page with audio playback matching visual reference #1 and `docs/AGENT_02_BOOTH_DYNAMIC_PLANS_AND_BOOKING.md` / `docs/AGENT_03_BOOTH_MEMORY_PAGE.md`.

### R3. Admin Operations, Bulk Voice Studio & Form Builder (Agents 04, 05 & 06)
Implement the Admin shell, dynamic plans management, manual payment approval/rejection, orders pipeline, bulk voice record studio with automatic filename parsing, and invitation dynamic form builder in `apps/Admin` following `docs/AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md`, `docs/AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md`, and `docs/AGENT_06_ADMIN_INVITATION_AND_FORM_BUILDER.md`.

### R4. Invitation Services, Custom Renderer & QR Guest Pass (Agents 07 & 08)
Implement the Invitation landing, package booking, custom invitation page renderer with dynamic RSVP form submission, and guest QR code access pass in `apps/Invitation` following `docs/AGENT_07_INVITATION_LANDING_AND_BOOKING.md` and `docs/AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md`.

### R5. Client Portal, Asset Management & Invitation Mailbox (Agents 09 & 10)
Implement the client portal order tracking, raw assets upload, invitation RSVP mailbox with approve/decline actions, and automated EmailJS notification dispatch in `apps/Main` following `docs/AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` and `docs/AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md`.

### R6. Monorepo Constraints & User Rules
Adhere strictly to the workspace boundary rules in each agent doc. Do not run `npm run build` without specific need, and do not create scripts or code generators unless needed.

## Acceptance Criteria

### Workspace & Boundary Compliance
- [ ] Each agent module strictly respects its assigned file boundaries without modifying prohibited files in other apps or packages.
- [ ] All 10 agent deliverables conform to the architecture rules defined in `docs/ASAR_PROJECT_ARCHITECTURE.md` and the design tokens in `docs/ASAR_DESIGN_SYSTEM.md`.

### Objective Verification
- [ ] TypeScript compilation succeeds across all modified packages and apps (`tsc --noEmit`) with zero type errors.
- [ ] Linter checks pass without errors across all modified files.
- [ ] Unit tests for core domain logic (order pipeline transitions, filename parsing, dynamic form validation, and audio analyzer utilities) pass without requiring a live Appwrite instance.
