# Project: ASAR Production Readiness, UI/UX Overhaul & Agent Guide

## Architecture

ASAR is a luxury event audio and digital invitation platform engineered as a high-performance Turborepo monorepo:
- `apps/Admin`: Luxury management console with React Router v6 declarative routes, dynamic plans builder, order queue pipeline, bulk voice studio, and modular section-based website creation editor.
- `apps/Booth`: Audio guestbook experience, dynamic plans selection, 14-section marketing landing page, and photo memories gallery with interactive telephone chime playback.
- `apps/Invitation`: Digital invitation showcase and dynamic storefront with modular section dispatcher (11 section types), wishing wall, multi-event schedule, background music player, digital gift box, and instant VIP QR pass.
- `apps/Main`: Platform gateway and client portal with orders, assets, audio player, QR hub, and VIP RSVP Mailbox.
- `apps/Renderer`: Universal multi-tenant dynamic memory storefront resolving subdomains via a 4-tier resolution engine (query override -> route param -> hostname subdomain -> fallback).
- `packages/react-appwrite`: Shared domain models, Appwrite collection/bucket constants, Storefront Subdomain Engine, modular section schema, audio analyzer, and order pipeline.
- `packages/UI-components`: 24 Awwwards-grade luxury UI components (`SplashCursor`, `CardNav`, `GradientWaves`, `BlurText`, `SplitText`, `TiltedCard`, etc.).
- `packages/assets-shared`: Shared luxury photography, brand logos, and visual assets.

---

## Feature Inventory

Every feature identified in the Survey phase is mapped to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Pass Delivery Canonical URL Resolution | Fix hardcoded `localhost:3003` pass verification URLs in `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` and `apps/Invitation/src/components/pass/GuestAccessPass.tsx` using canonical subdomain URLs | M1 | explorer_survey_gen |
| 2 | Bulk Audio Object URL Cleanup | Track and revoke `URL.createObjectURL(file)` in `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx` on file delete, re-upload, and unmount to prevent memory leaks | M1 | explorer_survey_gen |
| 3 | Media Photos Object URL Cleanup | Add `URL.revokeObjectURL()` cleanup in `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx` when photos are deleted or replaced | M1 | explorer_survey_gen |
| 4 | Booth Real Audio Playback Streaming | Wire `HTMLAudioElement` streaming to `handleTogglePlayVoice` in `apps/Booth/src/pages/BoothMemoryPage.tsx` to stream `record.audioUrl` with progress, chime intro, and error handling | M1 | explorer_survey_gen |
| 5 | Pass Scanning Route Error Resiliency | Ensure QR Pass scanning in `apps/Invitation/src/pages/ScannerRouteView.tsx` handles missing/malformed pass tokens without unhandled exceptions | M1 | explorer_survey_gen |
| 6 | Renderer Dynamic Storefront Resolver Loading State | Eliminate flash of 404 in `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx` by adding an `isResolving` Warm Vintage luxury editorial loading screen | M2 | explorer_survey_ui |
| 7 | Workspace Package Dependency Alignment | Add `"@repo/ui-components": "*"` to `apps/Invitation/package.json` and `apps/Main/package.json`, and integrate luxury visual components into client-facing views | M2 | explorer_survey_ui |
| 8 | Admin Palette Sanitation | In `apps/Admin/src/components/dashboard/AdminOverview.tsx`, replace generic SaaS Tailwind hex colors (`#3B82F6`, `#8B5CF6`, `#EC4899`) with ASAR Warm Vintage luxury palette tokens | M2 | explorer_survey_ui |
| 9 | Admin Native Alert Elimination | In `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`, replace native browser `alert()` with an editorial Chakra UI luxury toast/modal | M2 | explorer_survey_ui |
| 10 | Workspace-Wide Loading Skeletons | Introduce Warm Vintage Editorial loading skeletons matching card geometries across `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, and `apps/Renderer` | M2 | explorer_survey_ui |
| 11 | Mobile Bottom Bar Ergonomic Layout in Booth | In `apps/Booth/src/components/memory/MemoryActionBar.tsx`, flatten button layout on mobile to prevent a 150px vertical stack colliding with `AudioPlayerBar` | M2 | explorer_survey_ui |
| 12 | Bilingual Text `dir="auto"` Alignment | Add `dir="auto"` to user-generated messages in `apps/Booth/src/components/memory/GuestBookFeed.tsx` and `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx` | M2 | explorer_survey_ui |
| 13 | HTML Header & Font Preload Normalization | Standardize `index.html` across `apps/Admin`, `apps/Invitation`, and `apps/Main` with Arabic typography preloads (`Amiri`, `Aref Ruqaa`, `Cairo`, `Plus Jakarta Sans`) and proper `lang`/`dir` attributes | M2 | explorer_survey_ui |
| 14 | CSS Token Harmonization | Synchronize CSS root variables in `apps/Renderer/src/index.css` and `apps/Booth/src/index.css` to include the full suite of `--athar-*` luxury palette tokens | M2 | explorer_survey_ui |
| 15 | Comprehensive Agent Onboarding Guide | Create `docs/AGENT_GUIDE.md` documenting architecture, app boundaries, packages, data flows, 4-tier storefront resolution, conflict prevention, and safe verification rules | M3 | spec_miner_survey_guide |
| 16 | Complete Repository Test Suite Execution | Verify all 219 tests across 14 test suites pass cleanly via `npx tsx --test` in under 10 seconds with zero builds | M4 | ORIGINAL_REQUEST §Acceptance |
| 17 | Monorepo-Wide TypeScript Typecheck | Verify `tsc --noEmit` cleanly passes across all 5 apps and packages with 0 errors | M4 | ORIGINAL_REQUEST §Acceptance |
| 18 | Adversarial Stress Testing | Empirical stress testing of generation stability, object URL cleanup, subdomain resolution, and responsive UI layouts | M4 | ORIGINAL_REQUEST §Acceptance |
| 19 | Forensic Integrity Audit | Systematic integrity verification verifying authentic, genuine implementation without shortcuts, mock bypasses, or dummy facades | M4 | ORIGINAL_REQUEST §Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Invitation & Booth Memory Generation Stabilization | Pass URL resolution, Object URL revocation, Booth real audio playback, scanner route resilience | none | DONE |
| M2 | Workspace UI/UX Overhaul (ASAR Warm Vintage Editorial) | Renderer resolver loading screen, UI components dependency & integration, Admin palette sanitation, native alert removal, loading skeletons, mobile action bar layout, bilingual `dir="auto"`, font preloads | none | DONE |
| M3 | Comprehensive Agent Onboarding Guide | Publication of `docs/AGENT_GUIDE.md` per spec blueprint | none | DONE |
| M4 | Workspace Verification, Adversarial Testing & Forensic Audit | 219 tests pass, TypeScript clean check, Challenger stress verification, Forensic Integrity Audit | M1, M2, M3 | DONE |

---

## Interface Contracts & File Ownership

### M1 Write Boundaries:
- `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`
- `apps/Invitation/src/components/pass/GuestAccessPass.tsx`
- `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx`
- `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`
- `apps/Booth/src/pages/BoothMemoryPage.tsx`
- `apps/Invitation/src/pages/ScannerRouteView.tsx`

### M2 Write Boundaries:
- `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`
- `apps/Invitation/package.json`
- `apps/Main/package.json`
- `apps/Admin/src/components/dashboard/AdminOverview.tsx`
- `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`
- `apps/Booth/src/components/memory/MemoryActionBar.tsx`
- `apps/Booth/src/components/memory/GuestBookFeed.tsx`
- `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx`
- `apps/Admin/index.html`, `apps/Invitation/index.html`, `apps/Main/index.html`
- `apps/Renderer/src/index.css`, `apps/Booth/src/index.css`
- Luxury skeleton components in shared/app components

### M3 Write Boundaries:
- `docs/AGENT_GUIDE.md` (exclusive ownership)

---

## Code Layout

- Standard Turborepo monorepo structure:
  - `apps/Admin` (Port 3001)
  - `apps/Booth` (Port 3002)
  - `apps/Invitation` (Port 3003)
  - `apps/Main` (Port 3000)
  - `apps/Renderer` (Port 3004)
  - `packages/react-appwrite`
  - `packages/UI-components`
  - `docs/`
