## 2026-11-05T16:56:24Z
You are worker_m1_cloud_functions, a teamwork_worker subagent.
Your working directory is: d:\asar\.agents\teamwork\worker_m1_cloud_functions

EXCLUSIVE WRITE OWNERSHIP:
You own ONLY the following files and directories:
- `appwrite/functions/**/*`
- `appwrite/appwrite.config.json`
- `packages/react-appwrite/src/AsarDomain/collections.ts`
Do NOT edit files in `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, or `apps/Renderer`.

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
- `d:\asar\.agents\teamwork\spec_miner_docs_and_appwrite\spec_report.md` (Section 3: Cloud Functions Mapping vs Reference Architecture)

YOUR MISSION & TASKS:
1. Implement full business logic in `appwrite/functions/send-rsvp-notification/src/main.js`:
   - OpenRuntimes Node 22 handler signature.
   - Dual client fallback (endpoint, project ID, API key).
   - Real email dispatch logic supporting EmailJS REST API and Appwrite Messaging.
   - Update `invitation_rsvps` document setting `emailSent = true`.
   - Write unit tests in `appwrite/functions/send-rsvp-notification/test/send-rsvp-notification.test.js`.

2. Implement full business logic in `appwrite/functions/sync-user-role/src/main.js`:
   - Handle both `users.*.create` trigger and direct invocations.
   - Query `users` collection by `userId`. If document does not exist, create it in `users` with `userId`, `name`, `email`, `role`, `locale: "ar"` and row-level permissions. If exists, update role if changed.
   - If `role === "admin"`, manage `admins` team membership (`teams.createMembership`).
   - Write unit tests in `appwrite/functions/sync-user-role/test/sync-user-role.test.js`.

3. Complete `appwrite/functions/generate-vip-pass/src/main.js`:
   - When `rsvpId` is provided, persist the generated `passToken` and `qrCodeUrl` to `invitation_rsvps` in Appwrite database `asar-db`.
   - Update unit tests in `appwrite/functions/generate-vip-pass/test/` to verify persistence.

4. Implement reference function `appwrite/functions/check-user-exists/`:
   - Modeled after `d:\lyder-eco\appwrite\functions\check-user-exists`. Check if user email exists via `users.list([Query.equal("email", email)])`.
   - Create `package.json`, `src/main.js`, and `test/check-user-exists.test.js`.

5. Update `appwrite/appwrite.config.json`:
   - Add `check-user-exists` to `functions`.
   - Ensure required `scopes` and `vars` are declared for all functions (`databases.read`, `databases.write`, `users.read`, `teams.read`, `teams.write`).
   - Add optional `status` attribute (string, size 32, default `"active"`) to `users` table.

6. Update `packages/react-appwrite/src/AsarDomain/collections.ts`:
   - Ensure `ASAR_FUNCTIONS` exports all 5 function IDs: `PROCESS_RSVP_ACTION`, `GENERATE_VIP_PASS`, `SEND_RSVP_NOTIFICATION`, `SYNC_USER_ROLE`, `CHECK_USER_EXISTS`.

7. Verification:
   - Run unit tests: `node --test appwrite/functions/*/test/*.test.js`.
   - Ensure all cloud function tests pass cleanly.

8. Deliverables:
   - Write detailed `handoff.md` in your working directory.
   - Send completion message to parent orchestrator.
