# Handoff Report — Specification Mining & Gap Analysis (Docs, Appwrite & Lyder-Eco)

> **Agent**: `spec_miner_docs_and_appwrite`  
> **Working Directory**: `d:\asar\.agents\teamwork\spec_miner_docs_and_appwrite`  
> **Parent Orchestrator**: `c0cbc713-bb4b-4f5f-825c-c7aaa562056a`  
> **Timestamp**: 2026-11-05T16:55:00Z  
> **Handoff Type**: **Hard** (Task Complete)

---

## 1. Observation

1. **Monorepo Layout & Documentation**:
   - Monorepo consists of 5 apps (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`) and 5 shared packages (`@repo/react-appwrite`, `@repo/ui-components`, `@repo/assets-shared`, `@repo/typescript-config`, `@repo/eslint-config`).
   - Documentation in `docs/` comprises `AGENT_01` through `AGENT_10`, `AGENT_GUIDE.md`, `ASAR_PROJECT_ARCHITECTURE.md`, `ASAR_DESIGN_SYSTEM.md`, `ASAR_BOOTH_DESIGN_SPEC.md`, and `COMPETITIVE_ANALYSIS.md`.

2. **Appwrite Configuration (`appwrite/appwrite.config.json`)**:
   - Project ID: `6ad1c66c0017b63ab8cc`, Endpoint: `https://fra.cloud.appwrite.io/v1`.
   - Database: `asar-db` (Name: "ASAR Database", `enabled: true`).
   - Tables defined (10 total): `plans` (14 columns, 1 index), `orders` (16 columns, 3 indexes), `payments` (10 columns, 2 indexes), `booth_memories` (24 columns, 3 indexes), `booth_voice_records` (15 columns, 2 indexes), `booth_media` (7 columns, 2 indexes), `invitations` (18 columns, 3 indexes), `invitation_rsvps` (14 columns, 5 indexes), `wishing_wall_messages` (7 columns, 2 indexes), `users` (9 columns, 3 indexes).
   - Unified media bucket: `asar_storage` (50 MB limit, `fileSecurity: true`, encrypted).
   - RBAC Team: `admins` ("ASAR Administrators").
   - 4 Cloud Functions defined: `process-rsvp-action`, `generate-vip-pass`, `send-rsvp-notification`, `sync-user-role`.

3. **Cloud Functions Codebase Inspection (`appwrite/functions/`)**:
   - `process-rsvp-action`: Implemented in `src/main.js` (229 lines), with unit and stress tests. Atomically handles `"approve"` and `"decline"` actions, checks `maxCapacity`, generates pass token `VIP-XXXX-YYYY`, and updates document in `invitation_rsvps`.
   - `generate-vip-pass`: Implemented in `src/main.js` (70 lines). Signs HMAC-SHA256 digital pass and generates `ASAR-PASS-XXXX-YYYY`. Defect observed: Operates purely in-memory, missing database scopes, vars, and document persistence.
   - `send-rsvp-notification`: Implemented in `src/main.js` (85 lines). Defect observed: Lines 63–65 contain commented-out code `// await messaging.createEmail(...)`; function is an incomplete stub that never sends actual emails.
   - `sync-user-role`: Implemented in `src/main.js` (78 lines). Defect observed: Lines 47–49 define `databaseId` and `usersCollectionId = "users"`, but lines 50–71 return without ever executing `databases.createDocument` or `databases.updateDocument`. New Appwrite Auth users are never inserted into the `users` database collection.

4. **Reference Architecture (`d:\lyder-eco\appwrite\functions/`)**:
   - Contains 11 production cloud functions: `approve-admin`, `check-user-exists`, `generate-puck-design`, `manage-payment-provider`, `manage-platform-plan`, `register-admin`, `send-admin-notification`, `send-email-otp`, `sync-ai-models`, `sync-user-team`, `verify-email-otp`.
   - Standardized on OpenRuntimes Node.js 22, dual endpoint/project fallback, caller context validation via `req.headers["x-appwrite-user-id"]`, team role verification (`teams.listMemberships`), and atomic database document upserting.

5. **Admin Dashboard Usability & Cairo Font Inspection (`apps/Admin`)**:
   - In `apps/Admin/src/index.css`, `--font-body: 'Cairo'` is defined, but `--font-arabic-display` is `'Amiri', 'Aref Ruqaa', 'Playfair Display', serif`.
   - Across `AdminShell.tsx`, `AdminOverview.tsx`, `OrdersQueueManager.tsx`, `PlanBuilderStudio.tsx`, and `UsersManager.tsx`, headers explicitly use `fontFamily="var(--font-arabic-display)"`, forcing serif typography across the dashboard contrary to requirement R3.
   - Usability flaws directly observed:
     - `AdminShell.tsx` lines 137–143 hardcodes `<a href="http://localhost:3000/account">`, breaking outside default port/localhost.
     - `AdminLoginView.tsx` line 63 has demo bypass button rather than live team joining flow.
     - `UsersManager.tsx` line 107 updates `users` database table role but never syncs with Appwrite `admins` team.

---

## 2. Logic Chain

1. **Step 1 (Schema Alignment)**: Observation 2 identifies 10 tables in `appwrite.config.json`. Comparing each table against `packages/react-appwrite/src/AsarDomain/models.ts` and `docs/ASAR_PROJECT_ARCHITECTURE.md` reveals that the core schema matches. However, `useAdminAuth.ts` requires `status?: "active" | "suspended"` on user records, which is missing from `users` in `appwrite.config.json`.
2. **Step 2 (Cloud Functions Gap)**: Observation 3 proves that while `appwrite.config.json` lists 4 functions, only `process-rsvp-action` has complete business logic. `generate-vip-pass` lacks database persistence; `send-rsvp-notification` is a stub with commented-out sending; and `sync-user-role` fails to write user profiles to the database.
3. **Step 3 (Reference Architecture Transfer)**: Observation 4 demonstrates how `d:\lyder-eco` handles user synchronization (`sync-user-team`), admin onboarding (`register-admin`, `approve-admin`), and pre-auth checks (`check-user-exists`). Adapting these patterns directly resolves the defects found in Observation 3.
4. **Step 4 (Admin Dashboard UX & Cairo Typography)**: Observation 5 establishes that the Admin dashboard currently suffers from typography inconsistency (serif display fonts instead of Cairo) and specific navigation/auth flaws. Fixing `--font-arabic-display` to use `'Cairo'` and correcting the hardcoded URLs and role synchronization directly satisfies Requirement R3.

---

## 3. Caveats

1. **Live Appwrite Cloud Connectivity**: Probing was performed via local configuration files (`appwrite.config.json`), codebases, and test suites. Direct network calls to `https://fra.cloud.appwrite.io/v1` depend on the live server API key (`APPWRITE_API_KEY`), which is loaded via environment variables during deployment.
2. **Storage Bucket Aliases**: While the code references 5 bucket IDs (`payment_receipts`, etc.), the underlying Appwrite config defines a single unified bucket `asar_storage`. The application-level `resolveBucketId()` safely routes these to `asar_storage`.
3. **EmailJS Credentials**: In staging/development environments without configured EmailJS keys, `emailJsService.ts` automatically runs in defensive simulation mode, returning `{ simulated: true, success: true }`.

---

## 4. Conclusion

The specification mining and gap analysis is complete and fully documented in `spec_report.md`.
The Asar monorepo architecture is sound and well-tested, but requires four specific sets of actionable fixes to become ship-ready:
1. **Complete Cloud Functions**:
   - Wire `send-rsvp-notification` with EmailJS / Appwrite Messaging delivery.
   - Complete `sync-user-role` with atomic document upserting into the `users` collection.
   - Connect `generate-vip-pass` to persist signed passes to `invitation_rsvps`.
   - Consider adding `check-user-exists` from `d:\lyder-eco` for smooth auth modal routing.
2. **Admin Dashboard Cairo Redesign & Auth**:
   - Update `apps/Admin` typography variables to apply `'Cairo'` font universally.
   - Fix hardcoded URLs in `AdminShell.tsx`.
   - Wire `UsersManager.tsx` role toggles to invoke `sync-user-role` so database roles and Appwrite team memberships remain in lockstep.
3. **Appwrite Schema Minor Sync**:
   - Add optional `status` attribute to `users` collection in `appwrite.config.json`.
   - Synchronize `ASAR_FUNCTIONS` constants in `@repo/react-appwrite`.

---

## 5. Verification Method

To independently verify all findings and specifications:

1. **Verify Appwrite Configuration & Schema**:
   ```bash
   node -e "const c = require('./appwrite/appwrite.config.json'); console.log('Tables:', c.tables.length, 'Functions:', c.functions.length);"
   ```
2. **Inspect Incomplete Cloud Functions Code**:
   - View `appwrite/functions/send-rsvp-notification/src/main.js` (lines 60–70) to verify the commented-out messaging stub.
   - View `appwrite/functions/sync-user-role/src/main.js` (lines 45–70) to confirm absence of database document creation.
   - View `appwrite/functions/generate-vip-pass/src/main.js` (lines 35–65) to confirm in-memory signature without database update.
3. **Verify Reference Architecture in `d:\lyder-eco`**:
   ```powershell
   Get-ChildItem -Path "d:\lyder-eco\appwrite\functions" -Directory | Select-Object Name
   ```
4. **Inspect Admin Typography & Hardcoded URLs**:
   - View `apps/Admin/src/index.css` (lines 40–50) to verify `--font-arabic-display` uses `Amiri`.
   - View `apps/Admin/src/components/layout/AdminShell.tsx` (lines 135–145) to verify hardcoded `http://localhost:3000`.
5. **Run Existing Automated Cloud Function Tests**:
   ```bash
   node --test appwrite/functions/process-rsvp-action/test/test-process-rsvp.test.js
   ```

*Deliverable Artifacts Available at*:
- `d:\asar\.agents\teamwork\spec_miner_docs_and_appwrite\spec_report.md`
- `d:\asar\.agents\teamwork\spec_miner_docs_and_appwrite\handoff.md`
