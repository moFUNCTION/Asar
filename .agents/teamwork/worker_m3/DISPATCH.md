## 2026-11-05T14:03:24Z
You are worker_m3, a teamwork_worker subagent.
Your working directory is d:\asar\.agents\teamwork\worker_m3.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and the survey findings at:
d:\asar\.agents\teamwork\explorer_functions_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION (Milestone 3: Authentication & 10k+ Scalability Data Architecture):
1. Client Portal Route Protection in `apps/Main`:
   - In `apps/Main/src/App.tsx`, wrap `/account` and `/account/*` routes with `<RequireAuth>` from `@repo/react-appwrite`.
   - In `apps/Main/src/components/account/ClientAccountShell.tsx:122-135`, fix Defect M1-CHALLENGE-01 by aligning the order status mapping with `ORDER_PIPELINE_STAGES`:
     - `pending_payment` -> `"draft"` (so assets remain locked until payment verified)
     - `payment_rejected` -> `"payment_rejected"`
     - `awaiting_client_assets` -> `"submitted"`
     - `event_scheduled` -> `"under_review"`
     - `audio_mastering` -> `"paid_confirmed"`
     - `studio_curation` -> `"assets_uploaded"`
     - `published` -> `"delivered"`
     - fallback -> `"draft"`
2. Phone/SMS OTP and Email OTP Exposure in `apps/Main`:
   - In `apps/Main/src/components/auth/AuthModal.tsx`, add UI tabs/modes for Phone/SMS OTP and Email OTP:
     - Use existing `useAuthActions.ts` methods from `@repo/react-appwrite`: `loginWithPhone`, `verifyPhone`, `loginWithEmailOTP`, `verifyEmailOTP`.
     - Support phone number input with country codes (e.g. +20 Egypt, +966 Saudi Arabia), 6-digit OTP verification screen, countdown timer for resend.
3. 10k+ Concurrency Scalability in `packages/react-appwrite`:
   - In `packages/react-appwrite/src/Provider/CacheFusionStore.ts`:
     - Implement LRU eviction with a maximum capacity limit of 500 entries (or configurable maxEntries = 500) on both `documentCache` and `collectionCache` Maps so that under 10,000+ real-time events, browser memory remains bounded and does not leak monotonically.
4. Database Indexing in `appwrite/appwrite.config.json`:
   - Add missing compound index on `wishing_wall_messages`: `idx_invitation_created` on `["invitationId", "$createdAt"]` with orders `["ASC", "DESC"]`.
   - Add missing index on `invitation_rsvps`: `idx_guest_email` on `["guestEmail"]`.
5. Testing & Verification:
   - Run typecheck: `npx tsc -b apps/Main`, `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json`.
   - Run tests: `npm test` and `npx tsx --test "test/e2e/tier1-feature-coverage/tier1-auth-guards.test.ts"`.

FILE OWNERSHIP:
You EXCLUSIVELY own:
- `d:\asar\apps\Main\src\App.tsx`
- `d:\asar\apps\Main\src\components/auth/AuthModal.tsx`
- `d:\asar\apps\Main\src\components/account/ClientAccountShell.tsx`
- `d:\asar\packages\react-appwrite\src\Provider\CacheFusionStore.ts`
- `d:\asar\appwrite/appwrite.config.json`
Do NOT modify files in `apps/Admin`, `apps/Booth`, `apps/Invitation`, or `apps/Renderer`.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.
