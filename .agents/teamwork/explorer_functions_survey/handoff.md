# Handoff Report: Appwrite Cloud Functions, Authentication & 10k+ Scalability Survey

**Agent**: `explorer_functions_survey`  
**Date**: 2026-11-05T13:31:00Z  
**Target Working Directory**: `d:\asar\.agents\teamwork\explorer_functions_survey`  
**Parent Conversation ID**: `b5d74e17-aa59-4840-99b9-a702127a1c5c`  
**Status**: Hard Handoff (Investigation & Survey Complete)

---

## 1. Observation

### 1.1 Appwrite Cloud Functions Configuration & Implementation
1. **`appwrite/appwrite.config.json`**:
   - Lines 48–92 define exactly two serverless functions:
     - **`process-rsvp-action`**: Runtime `node-22`, path `functions/process-rsvp-action`, entrypoint `src/main.js`, execute permissions `["team:admins", "users"]`, `timeout: 15`, `scopes: []`, `commands: ""` (line 64).
     - **`generate-vip-pass`**: Runtime `node-22`, path `functions/generate-vip-pass`, entrypoint `src/main.js`, execute permissions `["team:admins", "users", "any"]`, `timeout: 15`, `scopes: []`, `commands: ""` (line 86).
2. **File Tree in `appwrite/functions/`**:
   - `appwrite/functions/generate-vip-pass/package.json` & `src/main.js`:
     - `package.json` lists dependency `"node-appwrite": "^14.1.0"`.
     - `src/main.js` (lines 1–60) uses Node built-in `node:crypto` (`createHmac`, `randomBytes`). It does **not** import `node-appwrite`. Generates signed tokens of format `ASAR-PASS-XXXX-XXXXXXXX`.
   - `appwrite/functions/process-rsvp-action/package.json` & `src/main.js`:
     - `package.json` lists dependency `"node-appwrite": "^14.1.0"`.
     - `src/main.js` line 1 imports `{ Client, Databases } from "node-appwrite"`.
     - Lines 30–37 initialize the Appwrite client using `process.env.APPWRITE_API_KEY`.
     - Lines 43–104 handle `"approve"` (generating `VIP-${timeComponent}-${randomSuffix}` and updating `invitation_rsvps` with `status: "approved"`) and `"decline"` (`status: "declined"`).
3. **Empirical Local Testing of Function Handlers**:
   - `generate-vip-pass`:
     ```powershell
     node -e "import('./appwrite/functions/generate-vip-pass/src/main.js').then(m => m.default({ req: { body: JSON.stringify({ rsvpId: 'rsvp-test-1', guestName: 'Mohamed Hassan', companionsCount: 2, invitationSlug: 'omar-and-layla', eventTitle: 'Wedding of Omar & Layla' }) }, res: { json: (data, code) => console.log('RESPONSE:', code, JSON.stringify(data)) }, log: console.log, error: console.error }))"
     ```
     **Result**: `[generate-vip-pass] Generated digital pass ASAR-PASS-4F90-EE18C259 for Mohamed Hassan (party of 3)` — Status 200, valid HMAC signature generated.
   - `process-rsvp-action`:
     ```powershell
     node -e "import('./appwrite/functions/process-rsvp-action/src/main.js').catch(e => console.error('IMPORT ERROR:', e.message))"
     ```
     **Result (Verbatim Error)**: `IMPORT ERROR: Cannot find package 'node-appwrite' imported from D:\asar\appwrite\functions\process-rsvp-action\src\main.js`.
     There is no `node_modules` folder inside `appwrite/functions/process-rsvp-action/`, and `node-appwrite` is not present in root `node_modules`.
4. **Live Cloud Environment Execution against Appwrite Cloud (Project `6ad1c66c0017b63ab8cc`)**:
   - `generate-vip-pass` (deployment `6aebbec5d97c56eaaf82`):
     - Executed via Appwrite MCP tool `functions_create_execution`.
     - **Status**: `completed`, HTTP 200. Returned signed pass token payload in `3.03s`.
   - `process-rsvp-action` (deployment `6aebbeb9c6971c82a004`):
     - Executed via Appwrite MCP tool `functions_create_execution`.
     - **Status**: `failed`, HTTP 503.
     - **Verbatim Error Log**:
       `"Failed to load module: Cannot find package 'node-appwrite' imported from /mnt/workspace/code/src/main.js\n"`
     - Root cause: `appwrite.config.json` line 64 had `"commands": ""`. OpenRuntimes did not run `npm install` during deployment build.
     - Furthermore, `vars: []` on the cloud function is empty, meaning `process.env.APPWRITE_API_KEY` is undefined and `scopes: []` has no document read/write scopes.

---

### 1.2 Authentication Architecture & Code
1. **Shared Library (`packages/react-appwrite`)**:
   - `src/Auth/useAuthActions.ts`:
     - Lines 34–68: `loginWithEmail(email, password)`
     - Lines 70–104: `register(email, password, name, userId)`
     - Lines 119–134: `loginWithOAuth(provider, successUrl, failureUrl, scopes)`
     - Lines 136–147: `loginWithMagicURL(email, redirectUrl, userId)`
     - Lines 149–156: `loginWithEmailOTP(email, userId)` -> `account.createEmailToken(userId, email)`
     - Lines 158–175: `verifyEmailOTP(userId, otp)` -> `account.createSession(userId, otp)`
     - Lines 177–184: `loginWithPhone(phone, userId)` -> `account.createPhoneToken(userId, phone)`
     - Lines 186–203: `verifyPhone(userId, secret)` -> `account.createSession(userId, secret)`
     - Lines 205–219: `loginWithAnonymous()`
     - Lines 221–247: `logout()` and `logoutAll()`
   - `src/AsarDomain/useAsarAuth.ts`:
     - Provides unified hook combining `account.get()`, user profile synchronization in collection `users` (`ASAR_COLLECTIONS.USERS`), admin team role check (`teams.list()` checking for `ASAR_TEAMS.ADMINS` or `profile.role === "admin"`).
     - Lines 176–192: Gracefully handles 409 session collision error (`"Creation of a session is prohibited"`) by deleting current session and retrying.
   - `src/Provider/AppwriteProvider.tsx`:
     - Stores session secret in `localStorage.getItem("appwrite:active_session")` and JWT in `localStorage.getItem("appwrite:active_jwt")`.
     - Auto-restores session on client mount if `autoRestoreSession: true` (lines 136–156).
   - `src/Teams/GuardComponents.tsx`:
     - Implements `RequireAuth`, `RequireGuest`, `HasRole(role)`, and `HasTeam(teamId, role)`.
   - `src/Teams/usePermissions.ts`:
     - Implements role evaluation against document permissions array (`read("team:admins")`, etc.).
2. **Client Apps Authentication State**:
   - `apps/Main`:
     - `src/components/auth/AuthModal.tsx`: Supports email/password login and register, and 1-click demo login. Does **not** expose Phone/SMS OTP or Email OTP UI tabs.
     - `src/App.tsx`: Routes `/account` and `/account/*` render `ClientAccountShell` with `currentUser` from local state or demo fallback, without wrapping in `<RequireAuth>`.
   - `apps/Admin`:
     - `src/App.tsx`: Renders `AdminShell` and routes `/overview`, `/plans`, `/orders`, `/booth-studio`, `/invitation-studio`, `/users` completely **unprotected**. Does not wrap routes in `<RequireAuth>` or `<HasTeam teamId="admins">`, and lacks an Admin Login view.
   - `apps/Booth` & `apps/Invitation`:
     - Public storefront pages correctly permit unauthenticated access (`read("any")`).

---

### 1.3 Scalability Analysis for 10k+ Concurrent Users
1. **Query Patterns & Indexing**:
   - `appwrite/appwrite.config.json` includes indexes:
     - `plans`: `idx_service_sort` on `[serviceType, sortOrder]`.
     - `orders`: `idx_client_id`, `idx_order_status`, `idx_service_type`.
     - `payments`: `idx_order_id`, `idx_status`.
     - `booth_memories` & `invitations`: `idx_slug`, `idx_subdomain`, `idx_order_id`.
     - `booth_voice_records`: `idx_memory_id`, `idx_category`.
     - `booth_media`: `idx_memory_id`, `idx_media_type`.
     - `invitation_rsvps`: `idx_invitation_id`, `idx_client_id`, `idx_status`, `idx_pass_token`.
     - `wishing_wall_messages`: `idx_invitation_id`.
     - `users`: `idx_user_id` (unique), `idx_user_email`, `idx_user_role`.
   - **Gaps Identified**:
     - `invitation_rsvps`: Missing index on `guestEmail`. Lookup by email requires full table scans under high concurrency.
     - `wishing_wall_messages`: Queried in `InteractiveWishingWallSection.tsx` line 112 via `Query.orderDesc("$createdAt")` and `Query.equal("invitationId", id)`. Without a composite index on `[invitationId, $createdAt]`, queries force filesort in MariaDB under high concurrent reads.
2. **Pagination Limits (Appwrite 5,000 Offset Ceiling)**:
   - Appwrite strictly limits `Query.offset(offset)` to `<= 5000`. Exceeding this triggers an HTTP 400 error.
   - `packages/react-appwrite/src/Databases/useCollectionWithPagination.ts` (lines 114–117): Automatically switches to cursor pagination (`Query.cursorAfter(lastDocId)`) when offset reaches 5,000 or when `paginationMode: "cursor"`.
   - `useInfiniteCollection.ts` (line 185): Fully cursor-based (`cursorAfter`).
3. **Caching & Concurrency Safety**:
   - `CacheFusionStore.ts` (lines 5–180): In-memory Map caching for documents and collection queries with Realtime event synchronization.
     - **Memory Leak Risk**: No TTL or maximum capacity eviction policy. In long-running clients loading thousands of documents, memory grows monotonically.
   - **Race Conditions**:
     - **RSVP Capacity Overbooking**:
       In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` lines 198–214 and `apps/Invitation/src/components/modular-renderer/sections/InteractiveRsvpSection.tsx`:
       Approvals and submissions are performed client-side without an atomic capacity check or database transaction. Concurrent requests when nearing max venue capacity (e.g. 150) can result in overbooking.
     - **Double Check-In Scanner**:
       `apps/Invitation/src/components/pass/VenueQrScanner.tsx` checks `isCheckedInAtVenue` against local cache/state rather than executing a conditional atomic update in Appwrite.
4. **Discrepancy in RSVP Flows Across Apps**:
   - In `apps/Invitation/src/components/renderer/DynamicRsvpForm.tsx`: Saves RSVP to `localStorage` (`"asar_invitation_rsvps_cache"`) with `status: "pending"`, but **omits** calling `databases.createDocument()` in Appwrite.
   - In `apps/Invitation/src/components/modular-renderer/sections/InteractiveRsvpSection.tsx`: Calls `databases.createDocument()`, but sets `status: "approved"` immediately on submission, bypassing host mailbox approval.
   - In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`: Performs approval and decline directly via browser SDK calls to `databases.updateDocument()` and EmailJS `sendRsvpDecisionEmail`, bypassing the `process-rsvp-action` cloud function.

---

### 1.4 Live Environment Configuration
1. **`d:\asar\.env`**:
   - `VITE_IS_PRODUCTION=true`
   - `VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1`
   - `VITE_APPWRITE_PROJECT_ID=6ad1c66c0017b63ab8cc`
   - `VITE_APPWRITE_DATABASE_ID=asar-db`
   - `VITE_APPWRITE_BUCKET_ID=asar_storage`
   - No API keys are exposed in `.env` (consistent with client-side Vite security standards).
2. **Appwrite Cloud Project Status**:
   - Project: `6ad1c66c0017b63ab8cc` ("Asar", region `fra`).
   - Database `asar-db` active; collections and storage bucket `asar_storage` present.
3. **Test Suite Status**:
   - Full monorepo test suite executed (`npm test`):
     - **223 passed**, 0 failed, 37 suites, 9.92s duration.

---

## 2. Logic Chain

1. **Premise**: In Appwrite OpenRuntimes, when a function deployment is built, OpenRuntimes executes the string in `"commands"` to prepare dependencies before bundling `/mnt/workspace/code`.
2. **Observation**: In `appwrite.config.json` line 64, `process-rsvp-action` has `"commands": ""`. In `functions/process-rsvp-action/`, `package.json` specifies `"node-appwrite": "^14.1.0"`, but no `node_modules` was bundled.
3. **Observation**: Invoking the live cloud deployment of `process-rsvp-action` resulted in HTTP 503 with `"Cannot find package 'node-appwrite'"`.
4. **Inference**: `process-rsvp-action` cannot be executed in production on Appwrite Cloud until `"commands": "npm install"` is configured and a new deployment is built with installed dependencies.
5. **Premise**: In Appwrite, documents in `invitation_rsvps` require `team:admins` or `users` for update operations.
6. **Observation**: The deployed `process-rsvp-action` has empty `vars: []` and empty `scopes: []`.
7. **Inference**: Even after `node-appwrite` is available, `process-rsvp-action` calls `databases.updateDocument()` using `apiKey = process.env.APPWRITE_API_KEY`. Without an API key or execution scopes (`documents.write`), the function will fail on database update permissions.
8. **Premise**: Under 10,000+ concurrent users, unbounded in-memory caches, non-indexed lookups, and un-gated admin shells create severe performance degradation and security vulnerabilities.
9. **Observation**: `apps/Admin` lacks route protection; `invitation_rsvps.guestEmail` lacks an index; `CacheFusionStore` lacks eviction limits; and RSVP approval is done client-side without atomic capacity checks.
10. **Inference**: Production readiness for 10k+ users requires server-side function execution for capacity checks, index additions, cache size bounding, and Admin auth guards.

---

## 3. Caveats

1. The live Appwrite project `6ad1c66c0017b63ab8cc` does not currently contain production users (`users.total: 0`).
2. EmailJS credentials (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY`) are intentionally operating in documented simulation fallback mode in the dev environment.
3. No code modifications were made during this investigation, adhering strictly to the explorer read-only constraint.

---

## 4. Conclusion

1. **Cloud Functions Readiness**:
   - `generate-vip-pass` is **production-ready and verified live** (HTTP 200).
   - `process-rsvp-action` is **broken on Appwrite Cloud** due to missing build command (`"commands": "npm install"` in `appwrite.config.json`), unbundled `node-appwrite` package, and missing `APPWRITE_API_KEY` / execution scopes.
2. **Auth Implementation**:
   - `packages/react-appwrite` contains complete, robust implementations for email/password, phone/SMS OTP, email OTP, magic URLs, session tokens, and route guards.
   - `apps/Admin` is completely exposed without route guards.
   - `apps/Main` needs Phone/SMS OTP exposed in `AuthModal` and route enforcement on `/account/*`.
3. **10k+ Scalability & Concurrency**:
   - Cursor pagination in `packages/react-appwrite` is well-architected for >5,000 records.
   - Missing indexes on `invitation_rsvps.guestEmail` and `wishing_wall_messages.(invitationId, $createdAt)` must be added.
   - Atomic capacity enforcement must be delegated to `process-rsvp-action` to eliminate race conditions.
   - `CacheFusionStore` requires an LRU/max size limit (e.g. 500 entries) to prevent browser memory leaks.

---

## 5. Verification Method

### 5.1 Cloud Function Execution Verification
- **`generate-vip-pass` (Local)**:
  ```powershell
  node -e "import('./appwrite/functions/generate-vip-pass/src/main.js').then(m => m.default({ req: { body: JSON.stringify({ rsvpId: 'test', guestName: 'Karim', companionsCount: 1 }) }, res: { json: (d, c) => console.log('CODE:', c, 'DATA:', d) }, log: console.log, error: console.error }))"
  ```
- **`generate-vip-pass` (Live Appwrite Instance)**:
  Call MCP tool `functions_create_execution` with `function_id: "generate-vip-pass"`; verify response returns `responseStatusCode: 200`.

- **`process-rsvp-action` Error Reproduction**:
  Call MCP tool `functions_create_execution` with `function_id: "process-rsvp-action"`; observe `responseStatusCode: 503` and error log `"Cannot find package 'node-appwrite'"`.

### 5.2 Test Suite Execution
- **Run Monorepo Tests**:
  ```powershell
  npm test
  ```
  Expected output: 223 passing tests across `packages/react-appwrite` and all `apps/*/test`.

### 5.3 Invalidation Conditions
- If `appwrite.config.json` is updated with `"commands": "npm install"` and `process-rsvp-action` is redeployed with an active API key, the 503 error condition will be resolved.
