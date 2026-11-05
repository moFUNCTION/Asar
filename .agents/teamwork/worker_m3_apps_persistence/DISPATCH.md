## 2026-11-05T16:56:24Z
You are worker_m3_apps_persistence, a teamwork_worker subagent.
Your working directory is: d:\asar\.agents\teamwork\worker_m3_apps_persistence

EXCLUSIVE WRITE OWNERSHIP:
You own ONLY the following files and directories:
- `apps/Booth/**/*`
- `apps/Invitation/**/*`
- `apps/Main/**/*`
- `apps/Renderer/**/*`
- `packages/react-appwrite/src/**/*` (EXCEPT collections.ts, which is owned by worker_m1)
Do NOT edit files in `apps/Admin` or `appwrite/functions`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER GLOBAL CONSTRAINTS:
- Do NOT run npm run build without reason.
- Do NOT make unnecessary scripts or code generators.
- The team must NOT: Use pre-built libraries or frameworks for core functionality.

MANDATORY FIRST STEP:
Read:
- `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md`
- `d:\asar\PROJECT.md`
- `d:\asar\.agents\teamwork\explorer_apps_and_cloud_functions\apps_functions_report.md`
- `d:\asar\.agents\teamwork\explorer_apps_and_cloud_functions\handoff.md`

YOUR MISSION & TASKS:
1. Replace all identified dummy components with functional implementations wired to Appwrite:
   - `apps/Renderer/src/components/invitation/InvitationDynamicRsvpForm.tsx`: Wire form submission to call `databases.createDocument` in `invitation_rsvps` in database `asar-db`.
   - `apps/Main/src/components/account/AudioReviewPlayer.tsx`: Remove synthetic 220Hz sine wave tone; stream actual audio file from Appwrite Storage (`storage.getFileView` or direct CDN URL); replace fake text-blob downloads with real binary audio downloads.
   - `apps/Main/src/components/account/RawAssetsManager.tsx`: Persist assets directly to Appwrite `orders.clientSubmittedAssetsJson` using `databases.updateDocument`.
   - `apps/Invitation/src/components/pass/VenueQrScanner.tsx`: Verify QR pass token against Appwrite `invitation_rsvps` and mark `isCheckedInAtVenue: true` via `databases.updateDocument`.
   - `apps/Invitation/src/components/modular-renderer/sections/WishingWallSection.tsx`: Persist guest blessings to `wishing_wall_messages` collection in Appwrite.
   - `apps/Booth/src/pages/BoothMemoryPage.tsx`: Implement real keepsake PDF generation/download; wire likes and blessings to update Appwrite `booth_voice_records`.
   - `apps/Booth/src/components/sections/ContactSection.tsx` & `Footer.tsx`: Clean up dummy phone numbers and links with realistic brand contact info.

2. Ensure Storage Bucket Resolution:
   - Ensure all client file uploads and downloads safely resolve to bucket `asar_storage` (the single bucket configured in `appwrite.config.json`), ensuring no storage calls fail with bucket-not-found errors.

3. Verify End-to-End User Journeys across all 4 apps:
   - Booth booking & memory creation.
   - Invitation modular sections, RSVP submission, wishing wall.
   - Main portal order tracker, raw assets upload, audio preview.
   - Renderer multi-tenant edge resolution.

4. Verification:
   - Verify TypeScript compilation without build:
     `npx tsc --noEmit -p apps/Booth/tsconfig.json`
     `npx tsc --noEmit -p apps/Invitation/tsconfig.json`
     `npx tsc --noEmit -p apps/Main/tsconfig.json`
     `npx tsc --noEmit -p apps/Renderer/tsconfig.json`
     All must compile with 0 errors.
   - Verify test suite: `npx tsx --test apps/Booth/test/*.ts apps/Invitation/test/*.ts apps/Main/test/*.ts apps/Renderer/test/*.ts packages/react-appwrite/test/*.ts` -> All must pass.

5. Deliverables:
   - Write detailed `handoff.md` in your working directory.
   - Send completion message to parent orchestrator.
