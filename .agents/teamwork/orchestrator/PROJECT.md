# Project: ASAR Monorepo Ship-Readiness

## Architecture
ASAR is a Turborepo v2 monorepo powering luxury digital heirlooms and interactive living event websites.
- **5 Applications**:
  - `apps/Main` (Port 3000): Brand gateway, customer auth modal, client portal (7-stage order tracker, raw assets submitter, audio player, QR hub, host mailbox).
  - `apps/Admin` (Port 3001): Operations dashboard with Cairo typography, KPI overview, plans studio, orders & receipts queue, booth studio, invitation studio, admin mailbox, users & RBAC.
  - `apps/Booth` (Port 3002): Dynamic audio guestbook memory storefront & 14-section booking landing.
  - `apps/Invitation` (Port 3003): Dynamic modular invitation storefront, booking, living event page, VIP QR pass view, venue entrance QR scanner.
  - `apps/Renderer` (Port 3004): Universal multi-tenant edge storefront router & memory classifier.
- **5 Shared Packages**:
  - `@repo/react-appwrite`: Appwrite provider, auth provider, subdomain engine, AsarDomain engine.
  - `@repo/ui-components`: 21 luxury interactive UI components (WebGL, Canvas, Framer Motion).
  - `@repo/assets-shared`: Shared branding and assets.
  - `@repo/typescript-config`: Shared TypeScript configurations.
  - `@repo/eslint-config`: Shared ESLint configurations.
- **Backend & Serverless**:
  - Appwrite Cloud: Frankfurt (`https://fra.cloud.appwrite.io/v1`), Project `6ad1c66c0017b63ab8cc`, Database `asar-db`.
  - 10 Collections: `plans`, `orders`, `payments`, `booth_memories`, `booth_voice_records`, `booth_media`, `invitations`, `invitation_rsvps`, `wishing_wall_messages`, `users`.
  - Cloud Functions: `process-rsvp-action`, `generate-vip-pass`, `send-rsvp-notification`, `sync-user-role`, `check-user-exists`.

## Code Layout & Write Boundaries
- **Milestone 1**: `appwrite/functions/**/*`, `appwrite/appwrite.config.json`, `packages/react-appwrite/src/AsarDomain/collections.ts`
- **Milestone 2**: `apps/Admin/**/*`
- **Milestone 3**: `apps/Booth/**/*`, `apps/Invitation/**/*`, `apps/Main/**/*`, `apps/Renderer/**/*`, `packages/react-appwrite/src/**/*` (except collections.ts)
- **Milestone 4**: Test suites, verification scripts, reports

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | `send-rsvp-notification` Cloud Function | Complete email notification logic via EmailJS / Appwrite Messaging | M1 | R2, appwrite.config.json, d:\lyder-eco |
| 2 | `sync-user-role` Cloud Function | Sync users.*.create to database `users` collection and manage `admins` team | M1 | R2, appwrite.config.json, d:\lyder-eco |
| 3 | `generate-vip-pass` Cloud Function | Persist signed passes with HMAC-SHA256 to `invitation_rsvps` | M1 | R2, appwrite.config.json |
| 4 | `check-user-exists` Cloud Function | Pre-auth account existence probe for seamless auth modal routing | M1 | R2, d:\lyder-eco |
| 5 | Cloud Functions Test Suites | Automated unit and integration tests for all cloud functions | M1 | R2, verification resources |
| 6 | Admin Cairo Font Integration | Universal Cairo font hierarchy (300..900) across all Admin views, replacing serif overrides | M2 | R3, ASAR_DESIGN_SYSTEM.md |
| 7 | Admin Compilation Fixes | Fix undeclared `profile`, `fetchUsers`, `isLoading`, and type mismatches | M2 | R1, tsc audit |
| 8 | Admin Luxury UI Redesign | Warm Vintage Editorial styling, eliminate raw hex colors, responsive mobile drawer | M2 | R3, ASAR_DESIGN_SYSTEM.md |
| 9 | Admin Flawless Auth Journey | Split-screen login, password recovery, session persistence without race conditions | M2 | R3, d:\lyder-eco |
| 10 | Admin Role Sync & Dynamic URLs | Wire `UsersManager` to `sync-user-role`, dynamic origin URLs in `AdminShell` | M2 | R3, spec report |
| 11 | Admin Studio Real Appwrite Data | Remove mock `DEFAULT_ORDERS`/`DEMO_ORDERS`; persist plans & booth memories to Appwrite | M2 | R1, R2, spec report |
| 12 | Renderer Live RSVP Persistence | Wire `InvitationDynamicRsvpForm` to call `databases.createDocument` in `invitation_rsvps` | M3 | R1, R4, audit report |
| 13 | Main Audio Player & Downloads | Replace 220Hz synthetic oscillator with Appwrite storage audio streaming & real binary downloads | M3 | R1, R4, audit report |
| 14 | Main Client Assets Persistence | Persist submitted couple assets directly to Appwrite `orders.clientSubmittedAssetsJson` | M3 | R1, R4, audit report |
| 15 | Invitation Live Venue Scanner | Wire `VenueQrScanner` to verify and check in guests against Appwrite `invitation_rsvps` | M3 | R1, R4, audit report |
| 16 | Invitation Wishing Wall Wiring | Persist RSVP blessings to `wishing_wall_messages` collection | M3 | R1, R4, audit report |
| 17 | Booth Keepsake & Reactions | Real PDF keepsake generation and Appwrite persistence for heart likes and guest notes | M3 | R1, R4, audit report |
| 18 | Contact & Footer Cleanup | Eliminate generic placeholders, fake phone numbers, and dead links | M3 | R1, R4, audit report |
| 19 | Monorepo Typecheck & Build Health | Clean `tsc --noEmit` across all 5 apps and packages, zero lint errors | M4 | Acceptance criteria |
| 20 | Monorepo Test Suite Verification | Pass all 240+ unit and integration tests across monorepo | M4 | Acceptance criteria |
| 21 | Reviewers, Challengers & Forensic Audit | 2 Reviewers (APPROVE), 2 Challengers (APPROVE), 1 Forensic Auditor (CLEAN) | M4 | Iteration gate criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Appwrite Backend & Cloud Functions | Implement all missing cloud functions with business logic, env vars, tests, and config | none | IN_PROGRESS |
| M2 | Admin Dashboard Redesign & Auth Journey | Cairo font typography, luxury UI, compile error fixes, real Appwrite data in studios, flawless auth & RBAC | none | IN_PROGRESS |
| M3 | Cross-App User Journeys & Dummy Remediation | Replace dummy components across Booth, Invitation, Main, and Renderer with live Appwrite persistence | none | IN_PROGRESS |
| M4 | Monorepo Health, E2E Verification & Gate Audit | Full test suite pass, zero tsc errors, 2 Reviewers, 2 Challengers, Forensic Auditor veto gate | M1, M2, M3 | PLANNED |

## Interface Contracts
### Appwrite Cloud Functions ↔ Client Applications
- `process-rsvp-action`: Input `{ rsvpId, action: "approve" | "decline", rejectionReason?, maxVenueCapacity? }` -> Output `{ success: true, status: "approved" | "declined", passToken, qrCodeUrl }`.
- `generate-vip-pass`: Input `{ rsvpId, guestName, companionsCount, invitationSlug, eventTitle }` -> Output `{ success: true, pass: { token, signature, checkInUrl, totalGuests } }`. Persists to `invitation_rsvps`.
- `send-rsvp-notification`: Input `{ rsvpId, decision: "approved" | "declined", toEmail, toName, eventTitle, passLink?, passToken?, rejectionReason? }` -> Output `{ success: true, delivered: true, recipient, sentAt }`.
- `sync-user-role`: Input `{ userId, email, name, role }` -> Output `{ success: true, userId, role, syncedAt }`. Upserts into `users` collection and syncs with `admins` team.
- `check-user-exists`: Input `{ email }` -> Output `{ success: true, exists: boolean, email }`.

### Admin Studios ↔ Appwrite Collections
- `BoothMemoryStudio`: Reads from `orders` (where `serviceType === "booth"`), writes to `booth_memories` and `booth_voice_records`.
- `InvitationStudio`: Reads from `orders` (where `serviceType === "invitation"`), writes to `invitations`.
- `PlanBuilderStudio`: Creates and deletes documents in `plans` collection via `databases.createDocument` / `databases.deleteDocument`.
- `OrdersQueueManager`: Updates `payments.status` when reviewing receipts.
