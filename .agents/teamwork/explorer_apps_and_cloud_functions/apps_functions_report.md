# ASAR Technical Audit: Apps, Dummy Components & Cloud Functions

**Auditor:** Teamwork Explorer (`explorer_apps_and_cloud_functions`)  
**Date:** 2026-11-05  
**Scope:** `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`, shared packages (`@repo/react-appwrite`, `@repo/ui-components`, `@repo/assets-shared`), and `appwrite/functions/`  
**Reference Codebase:** `d:\lyder-eco` & `docs/` (`ASAR_PROJECT_ARCHITECTURE.md`, `AGENT_01` through `AGENT_10`)

---

## 1. Executive Summary & Audit Scorecard

This audit provides an exhaustive technical inventory of dummy components, simulated delays, hardcoded mock responses, persistence mechanisms, cloud functions readiness, and monorepo health across ASAR's core applications and serverless services.

### Core Audit Findings Scorecard

| Area | Status | Key Findings & Observations |
| :--- | :---: | :--- |
| **Monorepo Compilation** | 🟢 PASS | All apps (`Admin`, `Booth`, `Invitation`, `Main`, `Renderer`) and shared packages pass `tsc --noEmit` with **0 compiler errors**. |
| **Automated Test Suites** | 🟢 PASS | 240/240 tests pass across 40 test suites covering domain parsing, order state machine, audio analyzer, filename parser, email payloads, and routing. |
| **Cloud Functions (Execution)** | 🟡 PARTIAL | `process-rsvp-action` & `generate-vip-pass` are fully implemented and pass adversarial stress tests. `send-rsvp-notification` has commented-out messaging logic. `sync-user-role` lacks unit tests. **Critical Gap**: Frontend apps never invoke cloud functions via `useAppwriteFunction()`. |
| **Appwrite Persistence** | 🟡 PARTIAL | Appwrite client and database `asar-db` connections are correctly configured across all apps. However, several critical user actions (RSVP submissions in Renderer, guestbook love notes, order asset saving, QR check-in) write only to `localStorage` or local state without mutating `asar-db`. |
| **Dummy & Mock Components** | 🔴 NEEDS WORK | Identified 16 major dummy components/simulated mock flows across `Booth`, `Invitation`, `Main`, and `Renderer`, including fake audio generation, dummy downloads disguised as text blobs, simulated timeouts, and static telephone/social URLs. |
| **Storage Buckets Alignment** | 🔴 MISMATCH | `appwrite.config.json` specifies only `asar_storage`, whereas client apps attempt to write to 5 separate bucket IDs (`payment_receipts`, `client_raw_assets`, `booth_mastered_audio`, `booth_gallery_media`, `invitation_assets`). |

---

## 2. Cross-App Dummy Component & Placeholder Inventory

### 2.1 `apps/Booth`

| Component / File Path | Line Range | Dummy / Simulated Behavior Description | Impact & Severity |
| :--- | :--- | :--- | :--- |
| `src/pages/BoothMemoryPage.tsx` | 403–406 | **Simulated Keepsake PDF Download:** `handleDownloadKeepsake` sets `downloadKeepsakeDone(true)` and runs `setTimeout(..., 3500)`. It does NOT trigger a real PDF generation or download. | Medium: User clicks "Download Keepsake Card (PDF)" and sees success checkmark, but no file is actually downloaded. |
| `src/pages/BoothMemoryPage.tsx` | 364–378 | **In-Memory Likes Only:** `handleToggleLikeVoice` updates React state `setVoiceRecords`, but does not persist the like count to Appwrite `booth_voice_records` collection. Refreshing reverts likes. | Medium: Guest heart reactions on audio heirlooms are lost on reload. |
| `src/components/memory/LeaveLoveModal.tsx` | 30–48 | **Local-Only Guest Note Submission:** Submitting a love note generates `gb-${Date.now()}` and calls `onAddNote(newNote)` which only updates React state `guestBookNotes`. It does NOT persist to Appwrite `booth_memories` or `wishing_wall_messages`. | High: Guest blessings for the couple are never stored in the database. |
| `src/components/memory/mockData.ts` | 16–266 | **Hardcoded Demo Voice Records & Photos:** 8 mock voice recordings (`DEMO_BOOTH_VOICE_RECORDS`) and mock photos with deterministic synthetic waveform generation (`generateWaveform`) used whenever remote records are absent. | Low/Expected: Necessary for offline demo fallback, but lacks dynamic synchronization if the database is seeded. |
| `src/components/sections/ContactSection.tsx` | 84–98, 151–183 | **Placeholder Contact Links:** Phone number is hardcoded to `"0100 000 0000"`, email is `"hello@athar.audio"`, location link is `href="#"`, social channels point to generic `https://instagram.com`, `https://tiktok.com`, `https://facebook.com`, and WhatsApp links to `201000000000`. | Medium: Non-functional external communication links on landing page. |
| `src/components/layout/Footer.tsx` | 104–117, 133 | **Dummy Social Links & Phone:** Hardcoded `0100 000 0000`, `hello@athar.audio`, and root domain social links (`https://instagram.com`). | Low: Marketing footer placeholders. |

---

### 2.2 `apps/Invitation`

| Component / File Path | Line Range | Dummy / Simulated Behavior Description | Impact & Severity |
| :--- | :--- | :--- | :--- |
| `src/components/modular-renderer/sections/DigitalGiftRegistrySection.tsx` | 54–79 | **Hardcoded Mock Bank & InstaPay Accounts:** If `section.accounts` is empty, falls back to hardcoded CIB account `"1000-2458-9901-4421"` and InstaPay `"omar.layla@instapay"`. | Medium: Couples without configured gift registry display dummy account details. |
| `src/components/pass/VenueQrScanner.tsx` | 49–60, 91–106 | **LocalStorage-Only Check-In Verification:** Scanned tokens are checked only against `localStorage.getItem("asar_invitation_rsvps_cache")`. When checked in, updates only `localStorage` and does NOT call `databases.updateDocument` in Appwrite `invitation_rsvps`. | High: Door check-in scanners do not sync across multiple security devices or update cloud database. |
| `src/components/pass/VenueQrScanner.tsx` | 117–125 | **Hardcoded Simulation Quick-Scan Token:** `handleSimulateQuickScan` falls back to hardcoded dummy string `"INV-PASS-VIP-991"`. | Low: Quick-scan testing helper. |
| `src/components/modular-renderer/sections/InteractiveRsvpSection.tsx` | 166–183 | **Blessing Note Bypasses Appwrite Collection:** When an RSVP includes a blessing note, it pushes to `asar_wishing_wall_cache` in `localStorage`, but never creates a document in `ASAR_COLLECTIONS.WISHING_WALL_MESSAGES`. | High: Blessings submitted through RSVP form are invisible on other guests' screens or in Admin. |
| `src/components/landing/InvitationBookingModal.tsx` | 248–253 | **Invalid Document ID String:** Calls `databases.createDocument(databaseId, "payments", "unique()", paymentPayload)`. The string `"unique()"` is an Appwrite CLI artifact; the Web SDK expects `ID.unique()`. | High: In SDK execution, this creates a document with literal ID `"unique()"` rather than generating a unique ID, causing subsequent orders to fail with key collisions. |

---

### 2.3 `apps/Main`

| Component / File Path | Line Range | Dummy / Simulated Behavior Description | Impact & Severity |
| :--- | :--- | :--- | :--- |
| `src/components/account/AudioReviewPlayer.tsx` | 107–163 | **Synthetic Web Audio Sine Wave Tone Generator:** Does NOT play actual mastered MP3 audio from Appwrite Storage (`booth_mastered_audio`). Instead, instantiates a Web Audio `OscillatorNode` playing a synthetic 220Hz sine wave tone with an interval timer to simulate playback. | High: Client cannot listen to actual mastered voice recordings in client portal. |
| `src/components/account/AudioReviewPlayer.tsx` | 209–228 | **Fake Disguised Text Blob Downloads:** `handleDownloadSingle` creates a text blob `ATHAR_AUDIO_MEMORY_${track.speakerName}` and downloads it named `.mp3`. `handleDownloadAllZip` creates a text blob `ATHAR_COMPLETE_ZIP_ARCHIVE_${orderId}` and downloads it named `.zip`. Neither contains audio data. | Critical: Downloaded MP3 and ZIP files are corrupted plain text files of 20 bytes. |
| `src/components/account/RawAssetsManager.tsx` | 195–214 | **LocalStorage-Only Asset Submission with Simulated Timeout:** `handleSubmitAll` saves submitted asset data only to `localStorage` (`asar_orders_cache`) wrapped in `setTimeout(..., 600)`. It does NOT update the order document in Appwrite `orders` collection (`clientSubmittedAssetsJson`). | High: Client assets submitted in portal do not reach the Admin studio or database. |
| `src/components/account/RawAssetsManager.tsx` | 198–204 | **Cache Data Structure Type Collision:** Parses `asar_orders_cache` as an object dictionary `parsed[orderId] = ...`, whereas `useBoothBooking` and `InvitationBookingModal` store `asar_orders_cache` as an Array `[{ $id: ... }]`. This corrupts the cache. | High: Breaks cross-app order hydration. |
| `src/components/mailbox/ClientRsvpMailbox.tsx` | 106–233 | **Client-Side EmailJS Dispatch & Bypass of Cloud Function:** When an RSVP is approved, the app generates pass tokens and dispatches emails via client-side EmailJS simulation rather than executing Appwrite Cloud Function `process-rsvp-action`. | Medium: Bypasses serverless function and relies on browser environment keys. |

---

### 2.4 `apps/Renderer`

| Component / File Path | Line Range | Dummy / Simulated Behavior Description | Impact & Severity |
| :--- | :--- | :--- | :--- |
| `src/components/invitation/InvitationDynamicRsvpForm.tsx` | 207–219 | **Complete Absence of Appwrite Cloud Persistence:** `handleSubmit` creates a `vipPass` object and saves it ONLY to `localStorage.getItem("asar_invitation_rsvps_cache")`. It NEVER calls Appwrite `databases.createDocument` or any Cloud Function! | Critical: Guest RSVPs submitted on the live rendered storefront never reach the database or host mailbox. |
| `src/pages/GuestPassStorefrontPage.tsx` | 50–70 | **Hardcoded Demo Invitation & Local-Only Lookup:** Displays `invitation: AsarInvitation = DEMO_INVITATION;` and looks up RSVP only in `localStorage`. If accessed on another device, displays fallback `DEMO_APPROVED_RSVP`. | High: Shared VIP pass URLs (`/pass/:rsvpId`) cannot be viewed or verified by guests on mobile devices. |
| `src/components/booth/BoothMemoryRenderer.tsx` | 304–324 | **Local State Only Guest Blessings:** `handleAddBlessing` and `handleToggleLikeBlessing` update only local React state `guestBookNotes`. Refreshing loses all guest notes. | High: Memory vault guestbook notes are ephemeral. |

---

## 3. End-to-End User Journeys & Appwrite Persistence

### 3.1 Journey Tracing & Data Flow Analysis

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               ASAR USER JOURNEYS MATRIX                                │
├──────────────┬──────────────────────────────┬─────────────────────────────┬────────────┤
│ Application  │ Core User Journey            │ Intended Appwrite Target    │ Actual DB  │
│              │                              │ (Collection / Bucket)       │ Mutation?  │
├──────────────┼──────────────────────────────┼─────────────────────────────┼────────────┤
│ Booth        │ Package selection & booking  │ orders, payments, receipts  │ YES (with  │
│              │ flow with deposit screenshot │                             │ fallback)  │
│ Booth        │ Memory Heirloom Listening    │ booth_memories, audio bucket│ READ ONLY  │
│ Booth        │ Guestbook blessing & likes   │ booth_memories / notes      │ NO (local) │
│ Invitation   │ Landing & Booking Flow       │ orders, payments            │ YES (bug:  │
│              │                              │                             │ "unique()")│
│ Invitation   │ Live RSVP Submission         │ invitation_rsvps            │ YES (in    │
│              │                              │                             │ app), NO(in│
│              │                              │                             │ Renderer)  │
│ Invitation   │ Wishing Wall post & likes    │ wishing_wall_messages       │ YES (mut)  │
│ Invitation   │ Pass Verification & Scanner  │ invitation_rsvps            │ NO (local) │
│ Main         │ Customer Auth Journey        │ users, Account API          │ YES (Appw) │
│ Main         │ Order Pipeline Tracking      │ orders                      │ READ ONLY  │
│ Main         │ Asset Submission             │ orders, client_raw_assets   │ FILES: YES │
│              │                              │                             │ DOC: NO    │
│ Main         │ Audio Review & Download      │ booth_mastered_audio        │ NO (synth) │
│ Main         │ Client RSVP Mailbox Approval │ invitation_rsvps, functions │ DOC: YES   │
│              │                              │                             │ FUNC: NO   │
│ Renderer     │ Subdomain Resolution         │ booth_memories, invitations │ READ ONLY  │
│ Renderer     │ Storefront RSVP Form         │ invitation_rsvps            │ NO (local) │
└──────────────┴──────────────────────────────┴─────────────────────────────┴────────────┘
```

### 3.2 Appwrite Client Instantiation & Configuration Audit

All 4 applications (`Booth`, `Invitation`, `Main`, `Renderer`) correctly instantiate the canonical `<AppwriteProvider>` in their `main.tsx`:
- **Endpoint**: `https://fra.cloud.appwrite.io/v1` (via `VITE_APPWRITE_ENDPOINT`)
- **Project ID**: `6ad1c66c0017b63ab8cc` (via `VITE_APPWRITE_PROJECT_ID`)
- **Database ID**: `asar-db` (via `VITE_APPWRITE_DATABASE_ID`)

### 3.3 Database Collections vs. `appwrite.config.json` Schema Alignment

All 10 collection names specified in `packages/react-appwrite/src/AsarDomain/collections.ts` match the tables in `appwrite/appwrite.config.json` exactly:
1. `users` (Users)
2. `plans` (Plans)
3. `orders` (Orders)
4. `payments` (Payments)
5. `booth_memories` (Booth Memories)
6. `booth_voice_records` (Booth Voice Records)
7. `booth_media` (Booth Media)
8. `invitations` (Invitations)
9. `invitation_rsvps` (Invitation RSVPs)
10. `wishing_wall_messages` (Wishing Wall Messages)

### 3.4 Critical Storage Bucket Discrepancy

In `appwrite/appwrite.config.json`, only **one** bucket is provisioned:
- `$id`: `asar_storage` ("ASAR Storage")

However, client applications and hooks reference **5 distinct buckets**:
```typescript
export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "payment_receipts",
  CLIENT_RAW_ASSETS: "client_raw_assets",
  BOOTH_MASTERED_AUDIO: "booth_mastered_audio",
  BOOTH_GALLERY_MEDIA: "booth_gallery_media",
  INVITATION_ASSETS: "invitation_assets",
  DEFAULT: "asar_storage",
} as const;
```
**Impact**: When a user attempts to upload a payment receipt in `useBoothBooking` (`storage.createFile("payment_receipts", ...)`), the request fails with a 404 Bucket Not Found unless the bucket exists on the server or is resolved through `resolveBucketId()`.

---

## 4. Cloud Functions Status & Logic Gap Analysis

### 4.1 Inventory of Cloud Functions

| Function Name | Path in Repo | Declared in Config? | Runtime | Implementation Status | Test Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **`process-rsvp-action`** | `functions/process-rsvp-action` | ✅ Yes | `node-22` | **Complete**: Enforces atomic capacity check, generates `VIP-XXXX-YYYY` pass token, updates database status, handles rejection reasons. | ✅ 2 test suites (Unit + Adversarial Stress with 11+ test categories) passing. |
| **`generate-vip-pass`** | `functions/generate-vip-pass` | ✅ Yes | `node-22` | **Complete**: Generates cryptographic HMAC-SHA256 signed digital entry passes, party size verification, tamper detection. | ✅ 2 test suites (Unit + Adversarial Stress) passing. |
| **`send-rsvp-notification`** | `functions/send-rsvp-notification` | ✅ Yes | `node-22` | **Partial Stub**: Prepares diplomatic Arabic notification text, but Appwrite Messaging call (`// await messaging.createEmail(...)`) is commented out. Returns simulated `{ delivered: true }`. | ❌ No test suite present. |
| **`sync-user-role`** | `functions/sync-user-role` | ✅ Yes (`users.*.create`) | `node-22` | **Complete Logic**: Syncs created user into `users` collection and assigns admin membership in `admins` team. | ❌ No test suite present. |

### 4.2 Comparison with Reference Architecture (`d:\lyder-eco`)

Comparing Asar's functions with `d:\lyder-eco\appwrite\functions`:
1. **Packaging & Modules**: Both use OpenRuntimes Node.js 22 ES module format (`export default async ({ req, res, log, error }) => { ... }`) with `node-appwrite: ^14.1.0`.
2. **Environment Variable Robustness**: `d:\lyder-eco` handles multiple fallback variable names:
   ```javascript
   const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
   const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
   const apiKey = req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY || process.env.APPWRITE_FUNCTION_KEY;
   ```
   Asar's `process-rsvp-action` and `generate-vip-pass` follow this exact robust pattern.
3. **Execution Authorization & Roles**: `d:\lyder-eco` validates caller identities using `req.headers["x-appwrite-user-id"]` and checks team membership via `teams.listMemberships(adminTeamId)`. In Asar, `sync-user-role` inspects headers, but `process-rsvp-action` does not currently verify if the caller has permissions for the specific `invitationId` (relies on Appwrite execution roles).
4. **Error & Logging**: Both cleanly isolate `log()` and `error()` outputs and return structured JSON with proper HTTP status codes (200, 400, 401, 403, 404, 409, 500).

### 4.3 Client Invocation Gap

Although `packages/react-appwrite` provides `useAppwriteFunction(functionId)`:
- `apps/Main`'s `ClientRsvpMailbox.tsx` directly mutates `invitation_rsvps` and calls EmailJS directly, rather than executing `process-rsvp-action`.
- `apps/Invitation`'s `VenueQrScanner.tsx` checks local tokens rather than verifying HMAC signatures via `generate-vip-pass`.
- `apps/Admin`'s `AdminRsvpMailbox.tsx` is the **only** component in the entire monorepo that wires `useAppwriteFunction(ASAR_FUNCTIONS.PROCESS_RSVP_ACTION)`.

---

## 5. Monorepo & Test Health Assessment

### 5.1 Test Suites Execution Results

Executed the authoritative monorepo test suite via `npx tsx --test`:
```
Command: npx tsx --test packages/react-appwrite/test/*.ts apps/Admin/test/*.ts apps/Booth/test/*.ts apps/Invitation/test/*.ts apps/Main/test/*.ts apps/Renderer/test/*.ts
Result:
✔ 240 tests passed
✔ 40 suites passed
✔ 0 failures, 0 cancelled, 0 skipped
Duration: 7.71 seconds
```

Executed Cloud Function test suites via `node --test`:
- `appwrite/functions/process-rsvp-action/test/*.test.js`: **2/2 pass** (including 5,000 token collision checks and boundary stress tests).
- `appwrite/functions/generate-vip-pass/test/*.test.js`: **2/2 pass** (including cryptographic signature verification and payload tampering tests).

### 5.2 TypeScript Compilation Diagnostics (`tsc --noEmit`)

Checked TypeScript compilation status without running `npm run build`:
- `apps/Booth`: Clean (0 errors)
- `apps/Invitation`: Clean (0 errors)
- `apps/Main`: Clean (0 errors)
- `apps/Renderer`: Clean (0 errors)
- `apps/Admin`: Clean (0 errors)
- `packages/react-appwrite`: Clean (0 errors)
- `packages/UI-components`: Clean (0 errors)

---

## 6. Actionable Implementation Recommendations

1. **Fix Renderer RSVP Form Cloud Persistence**:
   In `apps/Renderer/src/components/invitation/InvitationDynamicRsvpForm.tsx`, replace the local-only `localStorage` write with `databases.createDocument(dbId, ASAR_COLLECTIONS.INVITATION_RSVPS, rsvpId, ...)`.

2. **Wire Cloud Functions in Mailboxes**:
   In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`, execute `useAppwriteFunction(ASAR_FUNCTIONS.PROCESS_RSVP_ACTION)` and `useAppwriteFunction(ASAR_FUNCTIONS.SEND_RSVP_NOTIFICATION)`.

3. **Replace Fake Audio Downloads with Real Files**:
   In `apps/Main/src/components/account/AudioReviewPlayer.tsx`, replace the 20-byte text blob generation with real file fetching from Appwrite Storage (`booth_mastered_audio`) and use JSZip or direct streaming URLs for multi-file downloads.

4. **Persist Booth Memory Guest Notes & Likes**:
   In `apps/Booth/src/pages/BoothMemoryPage.tsx` and `apps/Renderer/src/components/booth/BoothMemoryRenderer.tsx`, persist guestbook notes to `ASAR_COLLECTIONS.WISHING_WALL_MESSAGES` or update `guestBookNotesJson` on the memory document in Appwrite.

5. **Harmonize Storage Bucket IDs**:
   Update `appwrite/appwrite.config.json` to define all 5 storage buckets (`payment_receipts`, `client_raw_assets`, `booth_mastered_audio`, `booth_gallery_media`, `invitation_assets`), or configure `resolveBucketId()` to seamlessly route all uploads to `asar_storage`.

6. **Implement Real Appwrite Messaging in `send-rsvp-notification`**:
   Uncomment and implement the Appwrite Messaging service call with SMTP/SendGrid or dynamic EmailJS webhook fallback in `appwrite/functions/send-rsvp-notification/src/main.js`, and add unit tests.
