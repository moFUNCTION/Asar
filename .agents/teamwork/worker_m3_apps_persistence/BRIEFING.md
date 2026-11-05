# BRIEFING — 2026-11-05T16:57:00Z

## Mission
Replace dummy components with genuine Appwrite-wired implementations across Booth, Invitation, Main, and Renderer apps; ensure storage bucket resolution; verify end-to-end user journeys; ensure TypeScript compilation and unit tests pass.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: d:\asar\.agents\teamwork\worker_m3_apps_persistence
- Original parent: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Milestone: M3 Apps & Persistence

## 🔒 Key Constraints
- EXCLUSIVE WRITE OWNERSHIP:
  - `apps/Booth/**/*`
  - `apps/Invitation/**/*`
  - `apps/Main/**/*`
  - `apps/Renderer/**/*`
  - `packages/react-appwrite/src/**/*` (EXCEPT collections.ts, which is owned by worker_m1)
  - Do NOT edit files in `apps/Admin` or `appwrite/functions`.
- User Global Constraints:
  - Do NOT run npm run build without reason.
  - Do NOT make unnecessary scripts or code generators.
  - The team must NOT: Use pre-built libraries or frameworks for core functionality.
- Integrity: Genuine implementations only, no dummy/facade implementations, no hardcoded test shortcuts.

## Current Parent
- Conversation ID: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Updated: not yet

## Task Summary
- **What to build**:
  1. `apps/Renderer/src/components/invitation/InvitationDynamicRsvpForm.tsx`: Wire submission to `databases.createDocument` in `invitation_rsvps` in `asar-db`.
  2. `apps/Main/src/components/account/AudioReviewPlayer.tsx`: Remove synthetic 220Hz sine wave tone; stream actual audio file from Appwrite Storage (`storage.getFileView` or direct CDN URL); replace fake text-blob downloads with real binary audio downloads.
  3. `apps/Main/src/components/account/RawAssetsManager.tsx`: Persist assets directly to Appwrite `orders.clientSubmittedAssetsJson` using `databases.updateDocument`.
  4. `apps/Invitation/src/components/pass/VenueQrScanner.tsx`: Verify QR pass token against Appwrite `invitation_rsvps` and mark `isCheckedInAtVenue: true` via `databases.updateDocument`.
  5. `apps/Invitation/src/components/modular-renderer/sections/WishingWallSection.tsx`: Persist guest blessings to `wishing_wall_messages` collection in Appwrite.
  6. `apps/Booth/src/pages/BoothMemoryPage.tsx`: Implement real keepsake PDF generation/download; wire likes and blessings to update Appwrite `booth_voice_records`.
  7. `apps/Booth/src/components/sections/ContactSection.tsx` & `Footer.tsx`: Clean up dummy phone numbers and links with realistic brand contact info.
  8. Storage bucket resolution: Ensure safe resolution to `asar_storage` without bucket-not-found errors.
  9. Verification: `tsc --noEmit` across 4 apps and test suites pass.
- **Success criteria**: Genuine persistence logic, 0 compile errors, 100% test pass.
- **Interface contracts**: `PROJECT.md`, `packages/react-appwrite/src/collections.ts`
- **Code layout**: Monorepo layout defined in `PROJECT.md`.

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Not run yet
- **Lint status**: 0
- **Tests added/modified**: TBD

## Loaded Skills
- None specified

## Key Decisions Made
- Initializing briefing and reading background files.

## Artifact Index
- DISPATCH.md — Dispatch instructions
- BRIEFING.md — Working memory
- progress.md — Liveness tracker
- handoff.md — Final completion report
