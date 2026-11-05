# Project: ASAR Production Readiness, Appwrite Cloud Functions & Arabic Admin Dashboard

## Architecture

ASAR is an ultra-luxury event audio memory and bespoke digital invitation platform engineered as a high-performance Turborepo v2 monorepo (`npm@11.13.0` workspaces) backed by Appwrite Cloud (`asar-db` on Frankfurt endpoint):

- `packages/react-appwrite`: Shared domain models, Appwrite collection and storage constants, Storefront Subdomain Engine (4-tier resolver, RFC 1123 validator), CacheFusionStore reactive in-memory cache, batch operations with chunked concurrency, and authentication services.
- `apps/Admin`: Administrative operations console for event concierges, master audio editors, and platform admins. Features a native Arabic RTL layout with a right-hand vertical tabs navigation menu, plan builder studio, order progression queue, payment receipt inspector, booth memory studio with bulk voice uploader, modular invitation studio with 11 section inspectors, dynamic form builder, and invitation mailbox management.
- `apps/Booth`: Customer storefront and dynamic audio guestbook platform. Renders an editorial 14-section Arabic RTL marketing landing on bare host, or resolves tenant subdomains to render the luxury couple memory heirloom with interactive 48-peak waveforms, category filter pills, video highlight banners, and PIN lock protection.
- `apps/Invitation`: Bespoke digital invitation platform and living event generator. Renders service showcase on bare host, or resolves tenant subdomains to dispatch 11 modular interactive section blocks (`cover_hero`, `couple_story`, `event_schedule`, `photo_gallery`, `wishing_wall`, `digital_gift_registry`, `background_audio`, `venue_location`, `live_countdown`, `custom_highlight`, `dynamic_rsvp`), digital VIP pass generation with HMAC-SHA256 tokens, and venue entrance check-in scanner.
- `apps/Main`: Platform brand gateway, customer authentication provider (email/password, phone/SMS OTP), and unified client account portal featuring 7-stage live order tracker, asset submission dropzone, mastered audio reviewer, printable QR table signage hub, and host real-time RSVP mailbox.
- `apps/Renderer`: High-speed universal dynamic edge storefront resolver. Automatically classifies whether a slug is a Booth Memory or an Invitation Event, rendering the appropriate experience.
- `packages/UI-components`: 21 Awwwards-grade luxury UI components (`GradientWaves`, `BlurText`, `SplitText`, `TiltedCard`, `DecayCard`, `PaperCrumple`, etc.).
- `appwrite/functions`: Serverless cloud functions deployed to Node.js 22 runtime:
  - `process-rsvp-action`: Atomic approval/decline state transitions, capacity verification, and pass token generation.
  - `generate-vip-pass`: Tamper-evident HMAC-SHA256 signed digital passes.

---

## Feature Inventory

Every requirement and discovered feature is assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Monorepo Typecheck & Syntax Fixes | Resolve 2 typing errors in `apps/Admin/src/App.tsx:318,346` and 5 syntax errors in `apps/Main/src/components/home/EcosystemHome.tsx:253` | M1 | explorer_admin_survey |
| 2 | Clean Workspace Compilation | Verify `tsc --noEmit` across all 5 apps and packages (`Admin`, `Booth`, `Invitation`, `Main`, `Renderer`, `react-appwrite`, `UI-components`) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | `process-rsvp-action` Build Config Fix | Set `"commands": "npm install"` in `appwrite/appwrite.config.json` and ensure `node-appwrite` is bundled and ready for OpenRuntimes deployment | M2 | explorer_functions_survey |
| 4 | `process-rsvp-action` Handler Logic & Security | Implement complete atomic handler logic with API key execution, capacity limit checks, pass token generation, and error handling | M2 | ORIGINAL_REQUEST §R2 |
| 5 | `generate-vip-pass` HMAC Signing Verification | Validate HMAC-SHA256 signature, token generation, tamper resistance, and check-in URL format | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Cloud Functions Mock & Live Verification | Execute both functions against mock payloads and the live Appwrite instance, verifying HTTP 200 responses | M2 | ORIGINAL_REQUEST §R2, §R5 |
| 7 | Admin Route Protection & RBAC Guards | Wrap `apps/Admin` routes in `<RequireAuth>` and `<HasTeam teamId="admins">`, adding an Admin Login view/state | M3 | explorer_functions_survey |
| 8 | Client Portal Route Guards | Wrap `apps/Main` `/account/*` routes in `<RequireAuth>` | M3 | explorer_functions_survey |
| 9 | Phone/SMS OTP & Email OTP Exposure | Expose phone OTP and email OTP tabs in `apps/Main/src/components/auth/AuthModal.tsx` utilizing existing `useAuthActions.ts` | M3 | ORIGINAL_REQUEST §R3 |
| 10 | 10k+ Database Indexing Optimization | Add missing database indexes in `appwrite.config.json` (`invitation_rsvps.guestEmail`, `wishing_wall_messages.[invitationId, $createdAt]`) | M3 | explorer_functions_survey |
| 11 | CacheFusionStore Memory Bounding | Implement LRU eviction / max capacity limit (e.g. 500 entries) in `CacheFusionStore.ts` to prevent memory leaks under 10k+ user events | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Concurrency Safety & Overbooking Protection | Protect RSVP capacity and venue check-in against race conditions during high concurrency | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Admin Right-Hand Vertical Tabs Menu | Refactor `apps/Admin/src/components/layout/AdminShell.tsx` from top horizontal tabs to a right-hand vertical tabs navigation sidebar in Arabic RTL | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Admin Comprehensive Arabic RTL Localization | Translate unlocalized English labels and badges in `AdminOverview.tsx`, `BoothMemoryStudio.tsx`, and `InvitationStudio.tsx` to Arabic | M4 | ORIGINAL_REQUEST §R4 |
| 15 | Booth Admin Appwrite Persistence | Wire Appwrite `databases.createDocument` / `updateDocument` in `BoothMemoryStudio.tsx` so memory settings and voice records save to `asar-db` | M5 | explorer_admin_survey |
| 16 | Invitation Mailbox Integration in Admin | Add RSVP Mailbox management view/tab to `apps/Admin` allowing admins to inspect RSVPs, track venue capacity, and trigger decisions | M5 | ORIGINAL_REQUEST §R4 |
| 17 | Opaque-Box E2E Test Infrastructure | Build comprehensive 4-tier requirement-driven E2E test suite covering all features in isolation, boundaries, combinations, and real-world workloads | M_TEST | Dual Track |
| 18 | E2E Suite Execution & TEST_READY Signal | Run full E2E test suite and publish `TEST_READY.md` | M_TEST | Dual Track |
| 19 | Implementation Track 100% E2E Test Pass | Verify all implemented features against 100% of Tiers 1-4 E2E tests | M_FINAL | Final Milestone Phase 1 |
| 20 | Adversarial Coverage Hardening (Tier 5) | Challenger-led white-box stress testing, edge-case generation, and coverage hardening | M_FINAL | Final Milestone Phase 2 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M_TEST | Dual Track E2E Testing Suite | Opaque-box test infrastructure & test cases (Tiers 1-4 per `ORIGINAL_REQUEST.md`) | none | DONE (TEST_READY.md published) |
| M1 | Monorepo Compilation Readiness & Typecheck Integrity | Fix `apps/Admin/src/App.tsx:318,346` and `apps/Main/src/components/home/EcosystemHome.tsx:253`, verify `tsc --noEmit` across all apps | none | DONE (PASSED GATE) |
| M2 | Appwrite Cloud Functions Implementation & Verification | Fix `process-rsvp-action` build config (`"commands": "npm install"`), package bundling, handler logic, API key, and verify `generate-vip-pass` locally and live | none | DONE (PASSED GATE) |
| M3 | Authentication & 10k+ Scalability Data Architecture | Admin route protection (`<RequireAuth>`, admin team check), Client portal route guards, Phone/SMS OTP in `AuthModal`, database indexes, `CacheFusionStore` LRU memory bound | M1 | DONE |
| M4 | Arabic RTL Admin Dashboard & Right-Hand Vertical Tabs | Refactor `AdminShell.tsx` to right-docked vertical tabs menu (`<Box as="aside">` in RTL), complete Arabic localization across Admin views | M1 | DONE |
| M5 | Admin Full Feature Management & Appwrite Persistence | Wire Appwrite database persistence in `BoothMemoryStudio.tsx`, integrate RSVP Mailbox view in `apps/Admin` | M2, M3, M4 | DONE |
| M_FINAL | Final Milestone: 100% E2E Pass & Adversarial Hardening | Phase 1 (100% E2E test pass across Tiers 1-4) + Phase 2 (Tier 5 adversarial hardening with Challengers) | M1–M5, M_TEST | DONE (PASSED GATE) |

---

## Interface Contracts

### 1. Cloud Functions Contract: `process-rsvp-action`
- **Request (POST)**:
  ```json
  {
    "rsvpId": "string (required)",
    "action": "'approve' | 'decline' (required)",
    "rejectionReason": "string (optional)"
  }
  ```
- **Response**:
  - Approve: `{ "success": true, "action": "approve", "status": "approved", "rsvpId": "string", "passToken": "VIP-XXXX-YYYY", "qrCodeUrl": "string", "respondedAt": "ISO string" }`
  - Decline: `{ "success": true, "action": "decline", "status": "declined", "rsvpId": "string", "rejectionReason": "string", "respondedAt": "ISO string" }`

### 2. Cloud Functions Contract: `generate-vip-pass`
- **Request (POST)**:
  ```json
  {
    "rsvpId": "string (required)",
    "guestName": "string (required)",
    "companionsCount": 0,
    "invitationSlug": "string (optional)",
    "eventTitle": "string (optional)"
  }
  ```
- **Response**:
  `{ "success": true, "pass": { "token": "ASAR-PASS-XXXX-YYYY", "rsvpId": "string", "guestName": "string", "companionsCount": 0, "totalGuests": 1, "signature": "hmac_sha256", "checkInUrl": "string" } }`

### 3. Admin Right-Hand Vertical Tabs Navigation Contract (`AdminShell.tsx`)
- Container: Root `<Flex direction={{ base: "column", md: "row" }} minH="100vh">`.
- In Arabic RTL (`dir="rtl"`):
  - Right child (first in DOM): `<Box as="aside" w={{ base: "100%", md: "280px" }} borderLeft="1px solid ...">` containing brand crest, user profile, and vertical navigation tab buttons.
  - Left child (second in DOM): `<Box as="main" flex="1" p={8}>` containing the active operational studio / workspace canvas.
- Active tab styling: Deep crimson/royal maroon background accent (`#7A1C2E`), warm cream text (`#FBF8F3`), and counter badges for pending orders.

### 4. Scalability & Defensive Concurrency Contract
- `CacheFusionStore`: In-memory document and collection query maps enforce a maximum capacity limit of 500 entries with LRU eviction to prevent browser memory leaks under 10,000+ real-time events.
- Database queries: Enforce `limit <= 50`, automatic cursor switching (`cursorAfter`) when offset >= 5000, compound indexes on `[invitationId, $createdAt]` and `guestEmail`.

---

## Code Layout

- `appwrite/appwrite.config.json`: Serverless functions config, database collections, indexes, storage buckets.
- `appwrite/functions/process-rsvp-action/`: Node.js 22 cloud function for atomic RSVP decisions.
- `appwrite/functions/generate-vip-pass/`: Node.js 22 cloud function for signed VIP passes.
- `packages/react-appwrite/`: Shared domain SDK, models, collections, auth, and caching.
  - `src/Provider/CacheFusionStore.ts`: In-memory reactive WebSocket cache with LRU bounding.
  - `src/AsarDomain/useAsarAuth.ts`: Unified auth and profile synchronization.
  - `src/Auth/useAuthActions.ts`: Authentication action methods (email, phone, OTP, session).
- `apps/Admin/`:
  - `src/components/layout/AdminShell.tsx`: Right-hand vertical tabs navigation shell in Arabic RTL.
  - `src/pages/AdminOverview.tsx`: Operations dashboard with Arabic localization.
  - `src/components/booth-studio/BoothMemoryStudio.tsx`: Booth memory curation with Appwrite persistence.
  - `src/components/invitation-studio/InvitationStudio.tsx`: Invitation modular studio with Arabic localization.
  - `src/components/mailbox/AdminRsvpMailbox.tsx`: Invitation RSVP and guest mailbox management view.
- `apps/Main/`:
  - `src/components/auth/AuthModal.tsx`: Authentication modal with Phone/SMS OTP and Email OTP tabs.
  - `src/components/home/EcosystemHome.tsx`: Platform home page with clean JSX syntax.
