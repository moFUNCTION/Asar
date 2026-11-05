# Worker Dispatch: Milestone 1 — Invitation & Booth Memory Generation Stabilization

## Mandate
Implement production readiness and stabilization fixes for Invitation and Booth memory generation across the workspace apps.

## Required References (Read First)
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY)
2. `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`
3. `d:\asar\.agents\teamwork\explorer_survey_gen\generation_stability_audit.md` (Detailed audit with line numbers and fix specs)
4. `d:\asar\.agents\teamwork\explorer_survey_gen\handoff.md`

## Exclusive File Ownership (Write Boundaries)
You EXCLUSIVELY own and may modify ONLY these files:
- `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`
- `apps/Invitation/src/components/pass/GuestAccessPass.tsx`
- `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx`
- `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`
- `apps/Booth/src/pages/BoothMemoryPage.tsx`
- `apps/Invitation/src/pages/ScannerRouteView.tsx`

## Implementation Tasks

### 1. Canonical Pass Verification URL Resolution
- In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` (around line 112) and `apps/Invitation/src/components/pass/GuestAccessPass.tsx` (around line 33):
  - Replace the hardcoded `http://localhost:3003` string literal.
  - Dynamically construct the pass URL using the canonical host:
    - If `window.location.origin` is available and not on localhost, use the current origin or dynamic storefront subdomain.
    - If in production/subdomain mode, route through the dynamic invitation URL (or `buildMemoryUrls` / fallback to origin).
    - In local development, maintain port 3003 (or current origin) cleanly without breaking local tests.

### 2. Bulk Audio Object URL Memory Leak Prevention
- In `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx`:
  - When creating object URLs via `URL.createObjectURL(file)`, track all created object URLs in a `useRef<Set<string>>` or cleanup map.
  - In `handleDeleteVoice` / clear actions, call `URL.revokeObjectURL(url)`.
  - In a `useEffect` cleanup return function, iterate over all tracked object URLs and invoke `URL.revokeObjectURL(url)` upon unmount.
- In `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`:
  - Track created preview object URLs for media photos and call `URL.revokeObjectURL(url)` on deletion, replacement, and unmount.

### 3. Real Audio Playback Streaming in Booth Memory Page
- In `apps/Booth/src/pages/BoothMemoryPage.tsx`:
  - Update `handleTogglePlayVoice`:
    - In addition to playing the telephone chime intro (`playTelephoneChime()`), instantiate or attach a real `HTMLAudioElement` (via `useRef<HTMLAudioElement | null>`) to stream `record.audioUrl`.
    - Handle `audio.play()` promise, `timeupdate`, `ended`, `error`, and `pause` events.
    - Synchronize playback timer and progress bar with the real audio duration/currentTime.
    - Ensure stopping or switching voices properly pauses and cleans up the previous audio element.

### 4. Scanner Route Resiliency
- In `apps/Invitation/src/pages/ScannerRouteView.tsx`:
  - Ensure null, empty, or malformed pass tokens or RSVP IDs do not cause unhandled runtime exceptions. Display a luxury editorial invalid pass badge with clear feedback.

## Constraints & Mandatory Warnings
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULE: Do not over-run `npm run build` without any reason, and do not make scripts or code generators without reason.

## Verification
- Verify TypeScript compilation:
  `npx tsc --noEmit -p apps/Main/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Invitation/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Admin/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Booth/tsconfig.app.json`
- Verify automated tests:
  `npx tsx --test apps/Main/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts`
- Write your completion handoff report to `d:\asar\.agents\teamwork\worker_m1_gen\handoff.md`.


## 2026-11-04T22:29:15Z
You are worker_m1_gen, a teamwork_worker implementation agent.
Your working directory is d:\asar\.agents\teamwork\worker_m1_gen.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Read d:\asar\.agents\teamwork\worker_m1_gen\DISPATCH.md and d:\asar\.agents\teamwork\explorer_survey_gen\generation_stability_audit.md for full technical details.

Your mission:
Implement Milestone 1: Invitation & Booth Memory Generation Stabilization:
1. Canonical pass verification URL resolution in apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx and apps/Invitation/src/components/pass/GuestAccessPass.tsx (replace hardcoded localhost:3003).
2. Bulk audio & media photo Object URL cleanup in apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx and apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx to prevent memory leaks.
3. Real audio playback streaming in apps/Booth/src/pages/BoothMemoryPage.tsx (wire HTMLAudioElement to stream record.audioUrl with chime intro, time sync, and error handling).
4. Scanner route resiliency in apps/Invitation/src/pages/ScannerRouteView.tsx.

Exclusive file ownership: ONLY touch the files listed above.
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
USER RULE: Do not over-run npm run build without reason, do not make scripts or code generators without reason.

Verify with:
npx tsc --noEmit -p apps/Main/tsconfig.app.json
npx tsc --noEmit -p apps/Invitation/tsconfig.app.json
npx tsc --noEmit -p apps/Admin/tsconfig.app.json
npx tsc --noEmit -p apps/Booth/tsconfig.app.json
npx tsx --test apps/Main/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts

Deliver your handoff report to d:\asar\.agents\teamwork\worker_m1_gen\handoff.md and notify me via send_message.


## 2026-11-04T22:39:11Z
**Context**: Milestone 1 Generation Stability Status Check
**Content**: Milestone 3 (docs/AGENT_GUIDE.md) is complete. Checking on your progress regarding the 4 stability and resource management tasks.
**Action**: Please share your current status or ETA for delivery of your handoff.
