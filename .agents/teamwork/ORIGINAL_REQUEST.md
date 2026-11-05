# Original User Request

## Initial Request — 2026-11-05T08:37:54Z

Analyze all parts of project ASAR to understand the business idea, then make the project production-ready across UI/UX, responsiveness, user journey, admin dashboard, and authentication.

Working directory: d:\asar
Integrity mode: development

## Requirements

### R1. UI/UX Consistency and Responsiveness
Upgrade the UI/UX across all pages outside the Booth and Invitation landing pages to match the editorial luxury quality bar set by those landing pages. Ensure all pages and components are fully responsive across mobile, tablet, and desktop viewports without layout breakage or unintended horizontal overflow.

### R2. Complete and Streamlined User Journeys
Establish complete, intuitive, and unbroken customer and guest flows across the platform for both Booth Memories and Invitation Websites. Customer journeys must seamlessly cover discovery/landing, booking/ordering, and client portal management (managing RSVPs, guests, and memories), while guest journeys cover RSVP submission, passes, and dynamic site viewing.

### R3. Arabic-First Admin Dashboard Redesign
Redesign the admin dashboard design, structure, and navigation to make it intuitive, efficient, and bug-free. Deliver the admin dashboard with a native Arabic-first interface utilizing right-to-left (RTL) layout and Arabic typography.

### R4. Authentication and User Data Management
Implement robust authentication handling for user signup, login, session persistence, and role-based access. Store and synchronize user profile records in a dedicated `Users` database collection in Appwrite.

## Verification Resources

- Test suites: Run `npm test` across the monorepo.
- Type checking: Run `npx tsc --noEmit` across each app and package (`packages/react-appwrite`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`).
- Design system: Refer to `docs/ASAR_DESIGN_SYSTEM.md` and benchmark against the existing Booth landing (`apps/Booth`) and Invitation landing (`apps/Invitation`) pages.
- Database schema: Refer to `appwrite/appwrite.config.json`.

## Acceptance Criteria

### UI/UX & Responsiveness
- [ ] All pages outside Booth and Invitation landing pages match the visual quality, typography, and styling established in the design system and landing pages.
- [ ] Every page across `apps/Main`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, and `apps/Renderer` is fully responsive on mobile, tablet, and desktop screens with zero horizontal overflow or clipping.

### User Journey
- [ ] Customer flow from landing page to booking/order completion operates end-to-end without broken navigation, dead ends, or missing states.
- [ ] Client account portal allows users to view and manage their orders, booth memories, and invitation RSVPs.
- [ ] Guest RSVP submission and dynamic preview flows function seamlessly end-to-end.

### Admin Dashboard
- [ ] The admin dashboard UI is fully rendered in Arabic with proper RTL layout and Arabic typography.
- [ ] Navigation and management views for plans, orders, payments, booth memories, and invitations operate reliably without UI or structural errors.

### Authentication & Users Collection
- [ ] User registration, login, logout, and session persistence function reliably without authentication state desync.
- [ ] User profile data is stored, queried, and updated in the Appwrite `Users` collection upon user registration and account updates.
- [ ] Admin routes remain protected and accessible only to authorized administrators.

### Code Quality & Verification
- [ ] Full monorepo TypeScript verification passes with zero type errors (`npx tsc --noEmit` on all apps and packages).
- [ ] All existing automated tests in `npm test` continue to pass, alongside new automated tests verifying the streamlined user journeys and auth handling.
