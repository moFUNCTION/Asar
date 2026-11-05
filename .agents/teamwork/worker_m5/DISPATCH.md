## 2026-11-05T14:21:23Z
You are worker_m5, a teamwork_worker subagent.
Your working directory is d:\asar\.agents\teamwork\worker_m5.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and the survey findings at:
d:\asar\.agents\teamwork\explorer_admin_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION (Milestone 5: Admin Full Feature Management & Appwrite Persistence):
1. Wire Appwrite Persistence in `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx`:
   - Currently, saving only commits to `localStorage` (`asar_booth_memories_cache`, etc.).
   - Wire Appwrite `databases.createDocument` / `databases.updateDocument` using `ASAR_DATABASE_ID` and `ASAR_COLLECTIONS.MEMORIES` and `VOICE_RECORDS`.
   - Preserve local cache update as a Tier 2 fallback so offline/demo modes continue functioning without errors.
2. Integrate RSVP Mailbox into `apps/Admin`:
   - Implement or mount an administrative RSVP Mailbox management view (`apps/Admin/src/components/mailbox/AdminRsvpMailbox.tsx` or expose `/mailbox` in Admin):
     - Displays incoming guest RSVPs filterable by status (`all`, `pending`, `approved`, `declined`).
     - Real-time venue capacity progress meter (`approvedSeats` vs `maxCapacity`).
     - Shows guest name, email, phone, companions count, and dynamic responses.
     - 1-click Approve and Decline actions invoking Appwrite databases or `process-rsvp-action`.
   - Add the Mailbox tab to the right-hand vertical navigation menu in `AdminShell.tsx`:
     - ID: `mailbox`, Label: "صندوق ردود الدعوات" (RSVP Mailbox), with unread/pending badge counter.
   - Update `apps/Admin/src/App.tsx` routing to support `/mailbox` tab.
3. Admin Route Protection & RBAC in `apps/Admin/src/App.tsx`:
   - Wrap the admin application routes with `<RequireAuth>` and `<HasTeam teamId="admins">` from `@repo/react-appwrite`.
   - When the user is unauthenticated or not an admin, render an elegant Arabic admin login view (`AdminLoginView` or login modal) with email/password authentication instead of exposing the admin console. Provide demo quick-login credentials for local evaluation.
4. Testing & Verification:
   - Run typecheck: `npx tsc -b apps/Admin`.
   - Run monorepo tests: `npm test`.
   - Run E2E tests: `npx tsx --test "test/e2e/**/*.test.ts"`.

FILE OWNERSHIP:
You EXCLUSIVELY own:
- `d:\asar\apps\Admin\src\components/booth-studio/BoothMemoryStudio.tsx`
- `d:\asar\apps\Admin\src\components/mailbox/AdminRsvpMailbox.tsx`
- `d:\asar\apps\Admin\src\components/layout/AdminShell.tsx`
- `d:\asar\apps\Admin\src\App.tsx`
- `d:\asar\apps\Admin\src\components/auth/AdminLoginView.tsx` (if created)
Do NOT modify files in `apps/Booth`, `apps/Invitation`, `apps/Main`, or `packages/*`.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

When finished, write your handoff report to:
`d:\asar\.agents\teamwork\worker_m5\handoff.md`
and notify the orchestrator via send_message.
