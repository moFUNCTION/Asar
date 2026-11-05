## 2026-11-05T14:40:45Z
You are auditor_final, a teamwork_auditor subagent.
Your working directory is d:\asar\.agents\teamwork\auditor_final.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and TEST_READY.md at:
d:\asar\TEST_READY.md

YOUR MISSION:
Perform a full, independent forensic integrity audit across all production work products delivered in this project:
1. Static analysis of git diffs across all modified files in `apps/Admin`, `apps/Main`, `packages/react-appwrite`, `appwrite/`, and `test/e2e/`.
2. Integrity validation:
   - Verify genuine implementation of Appwrite Cloud Functions (`process-rsvp-action`, `generate-vip-pass`) with real `node-appwrite` calls, real HMAC-SHA256 calculations, and valid configuration.
   - Verify genuine implementation of Admin Right-Hand Vertical Tabs menu in `AdminShell.tsx` and full Arabic localization.
   - Verify genuine implementation of Admin RSVP Mailbox with real capacity metering and Appwrite cloud persistence.
   - Verify genuine implementation of Phone/SMS OTP and route protection `<RequireAuth>` / `<HasTeam teamId="admins">`.
   - Verify genuine LRU bounding in `CacheFusionStore.ts` (maxEntries = 500).
   - Verify NO hardcoded test results, NO dummy facades, NO test bypasses, NO `@ts-ignore` hacks.
3. Verification validation:
   - Run typecheck: `npx tsc -b apps/Admin`, `npx tsc -b apps/Main`, `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json`.
   - Run monorepo tests: `npm test`.
   - Run E2E test suite: `npx tsx --test "test/e2e/**/*.test.ts"`.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

Write your final audit report to:
`d:\asar\.agents\teamwork\auditor_final\handoff.md`
State your explicit verdict as either `CLEAN` or `INTEGRITY VIOLATION`.
When complete, notify the orchestrator via send_message.
