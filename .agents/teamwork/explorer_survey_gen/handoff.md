# Handoff Report: Generation Stability & Workflow Audit

> **Agent**: `explorer_survey_gen`  
> **Target Path**: `d:\asar\.agents\teamwork\explorer_survey_gen\handoff.md`  
> **Working Directory**: `d:\asar\.agents\teamwork\explorer_survey_gen`  
> **Report Date**: 2026-11-04 / 2026-11-05 UTC  
> **Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Repository Test Suites & Execution**:
   - Monorepo contains 14 automated unit and stress test files:
     - `apps/Admin/test/adversarialStress.test.ts` (35 tests)
     - `apps/Admin/test/filenameParser.test.ts` (12 tests)
     - `apps/Admin/test/formSchemaValidation.test.ts` (10 tests)
     - `apps/Admin/test/modularWebsiteEditor.test.ts` (5 tests)
     - `apps/Booth/test/photoMemoriesAlignment.test.ts` (16 tests)
     - `apps/Invitation/test/dynamicRsvpFormValidation.test.ts` (18 tests)
     - `apps/Invitation/test/modularStorefront.test.ts` (14 tests)
     - `apps/Main/test/emailJsPayloadConstruction.test.ts` (11 tests)
     - `apps/Renderer/test/memoryClassifier.test.ts` (23 tests)
     - `apps/Renderer/test/storefrontRouting.test.ts` (12 tests)
     - `apps/Renderer/test/subdomainResolution.test.ts` (28 tests)
     - `packages/react-appwrite/test/domain.test.ts` (7 tests)
     - `packages/react-appwrite/test/sections.test.ts` (7 tests)
     - `packages/react-appwrite/test/storefront.test.ts` (21 tests)
   - Running raw Node 24 native type stripping (`node --test`) threw:
     `TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".tsx" for D:\asar\apps\Admin\src\components\booth-studio\BulkVoiceUploader.tsx`
   - Running with cached `tsx`:
     ```bash
     npx tsx --test apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts apps/Invitation/test/*.test.ts apps/Main/test/*.test.ts apps/Renderer/test/*.test.ts packages/react-appwrite/test/*.test.ts
     ```
     Result verbatim:
     ```text
     ℹ tests 219
     ℹ suites 37
     ℹ pass 219
     ℹ fail 0
     ℹ cancelled 0
     ℹ skipped 0
     ℹ todo 0
     ℹ duration_ms 6670.8514
     ```
     Zero builds triggered (`npm run build` was NOT invoked).

2. **Invitation Generation Architecture**:
   - `packages/react-appwrite/src/AsarDomain/sections.ts:149-161`: `EventSectionType` defines 11 discriminated union literals (`cover_hero`, `couple_story`, `event_schedule`, `photo_gallery`, `wishing_wall`, `digital_gift_registry`, `background_audio`, `venue_location`, `live_countdown`, `custom_highlight`, `dynamic_rsvp`).
   - `packages/react-appwrite/src/AsarDomain/sections.ts:397-448`: `parseModularWebsiteConfig()` safely migrates legacy flat block arrays into v2 `EventSection` models with zero runtime errors on empty/null inputs.
   - `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx:414-432`: Serializes `modularConfig` into `sectionsConfigJson` and validates RFC 1123 slugs before publishing.
   - `apps/Invitation/src/components/modular-renderer/ModularSectionDispatcher.tsx:120-138`: Filters enabled sections, sorts by `order`, and extracts `background_audio` to dock as a persistent floating bar at the bottom.

3. **Pass Link Hardcoding**:
   - `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx:112`:
     ```ts
     const passLink = `http://localhost:3003?pass=${rsvp.$id}&token=${passToken}`;
     const qrCodeUrl = buildQrCodeImageUrl(passLink, 500);
     ```
   - `apps/Invitation/src/components/pass/GuestAccessPass.tsx:33`:
     ```ts
     const passUrl = `http://localhost:3003?pass=${currentRsvp.$id || currentRsvp.id}&token=${currentRsvp.passToken}`;
     ```

4. **Resource Management & Object URLs**:
   - `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx:646`:
     ```ts
     const objectUrl = URL.createObjectURL(file);
     ```
     Called for every uploaded audio file in a loop without any corresponding `URL.revokeObjectURL(objectUrl)`.
   - `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:63`:
     ```ts
     fileUrl: URL.createObjectURL(file),
     ```
     Called for uploaded photos without revocation when deleted (`handleDeleteMedia:72`).

5. **Booth Memory Audio Playback**:
   - `apps/Booth/src/pages/BoothMemoryPage.tsx:224-258`:
     ```ts
     playTelephoneChime();
     setPlayingVoiceId(record.id);
     ...
     playbackTimerRef.current = setInterval(() => {
       runningTime += 0.2;
       ...
     }, 200);
     ```
     No `new Audio()` or `<audio>` element is attached to stream `record.audioUrl` during guest playback on `/memory/:slug`.

---

## 2. Logic Chain

1. **Test Execution Feasibility**:
   - *Premise*: The repository contains 219 tests (exceeding the 144+ baseline), but tests import `.tsx` components from React apps.
   - *Finding*: `node --experimental-strip-types` cannot strip JSX types in `.tsx` files (Observation 1).
   - *Inference*: `npx tsx --test` handles `.ts` and `.tsx` natively via `esbuild`. Running `npx tsx --test` across all 6 test directories executes in 6.67s with 100% pass rate without triggering `npm run build` or creating build artifacts.

2. **Invitation Production Readiness**:
   - *Premise*: Living invitations require dynamic reconfiguration, schema migration, and RSVP verification.
   - *Finding*: The discriminated union schema in `sections.ts`, default fallbacks in each section component, and locked `guestEmail` validation ensure that empty arrays, legacy configurations, and malformed inputs do not trigger crashes (Observation 2).
   - *Inference*: Invitation generation is production-ready at the schema and renderer layers, but the pass delivery URL has an environment coupling defect.

3. **Pass Delivery Failure Mode**:
   - *Premise*: Guests receive RSVP passes via EmailJS and scan them at venue check-in.
   - *Finding*: The pass URL generated in `ClientRsvpMailbox.tsx:112` and `GuestAccessPass.tsx:33` is hardcoded as `http://localhost:3003` (Observation 3).
   - *Inference*: In production, guests attempting to open this link on their phones or scanning the QR code will experience connection errors (`ERR_CONNECTION_REFUSED`) because `localhost:3003` resolves to their mobile device's local loopback rather than the ASAR platform.

4. **Memory Leak Risk in Bulk Audio Dropzone**:
   - *Premise*: Ingesting 50–150 audio tracks (~500MB+ in memory) generates DOM object URLs.
   - *Finding*: `URL.createObjectURL(file)` is called on every drop, but neither component tracks nor revokes these URLs upon deletion, unmount, or re-upload (Observation 4).
   - *Inference*: Repeated bulk operations or long-running admin sessions will cause cumulative memory bloat and potential browser tab crashes.

5. **Audio Playback Synchronization**:
   - *Premise*: Visual Reference #1 requires interactive voice cards that play mastered guest recordings.
   - *Finding*: `BoothMemoryPage.tsx` synthesizes a telephone chime and increments a timer, but fails to stream `record.audioUrl` (Observation 5).
   - *Inference*: The user experience in `apps/Booth` appears functional visually, but lacks audible voice playback until wired to an `HTMLAudioElement`.

---

## 3. Caveats

1. **Appwrite Cloud Backend Live Connectivity**: The monorepo uses defensive offline fallbacks (local seed defaults and `localStorage` caching) when `VITE_APPWRITE_ENDPOINT` is unavailable. Live WebSocket realtime syncing (`CacheFusionStore`) was verified through code inspection and mock test assertions, but not against a live cloud instance in this offline read-only turn.
2. **EmailJS Live API Dispatch**: Tested using `emailJsService.ts` simulation mode, which fully validates payload formatting, subject lines, template selection, and recipient addresses without consuming live EmailJS quota credits.
3. **No Code Modifications**: Consistent with the read-only explorer mandate, zero production code or test files were altered.

---

## 4. Conclusion

1. **Test Suite Status**: Exceeds requirements. Exactly **219 unit and stress tests** exist across 14 test suites, all passing (219/219) cleanly via `npx tsx --test`.
2. **Invitation Generation**: Fully stable, highly resilient to edge cases (empty sections, oversized payloads, RTL Arabic, invalid subdomains). Requires one critical fix: replacing hardcoded `http://localhost:3003` with canonical subdomain URLs in `ClientRsvpMailbox.tsx` and `GuestAccessPass.tsx`.
3. **Booth Memory Generation**: Robust filename parser (4 patterns), automatic 48-peak waveform calculation, and split-screen visual preview. Requires two remediations:
   - Adding `URL.revokeObjectURL()` cleanup in `BulkVoiceUploader.tsx` and `MediaAndTabsEditor.tsx`.
   - Wiring real `HTMLAudioElement` playback to `handleTogglePlayVoice` in `BoothMemoryPage.tsx`.
4. **Primary Audit Artifact**: Comprehensive analysis and remediation specifications delivered at `d:\asar\.agents\teamwork\explorer_survey_gen\generation_stability_audit.md`.

---

## 5. Verification Method

To independently verify all claims made in this report:

1. **Run the Complete Repository Test Suite (Clean, No Build)**:
   ```powershell
   npx tsx --test apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts apps/Invitation/test/*.test.ts apps/Main/test/*.test.ts apps/Renderer/test/*.test.ts packages/react-appwrite/test/*.test.ts
   ```
   *Expected output*: `ℹ tests 219`, `ℹ suites 37`, `ℹ pass 219`, `ℹ fail 0`, completed in under 10 seconds.

2. **Verify Hardcoded Pass URL**:
   Inspect line 112 of `d:\asar\apps\Main\src\components\mailbox\ClientRsvpMailbox.tsx` and line 33 of `d:\asar\apps\Invitation\src\components\pass\GuestAccessPass.tsx` to confirm `http://localhost:3003` string literal.

3. **Verify Object URL Lifecycle**:
   Inspect line 646 of `d:\asar\apps\Admin\src\components\booth-studio\BulkVoiceUploader.tsx` and line 63 of `d:\asar\apps\Admin\src\components\booth-studio\MediaAndTabsEditor.tsx` to confirm `URL.createObjectURL(file)` without `URL.revokeObjectURL()`.

4. **Verify Booth Audio Playback Wiring**:
   Inspect lines 224-258 of `d:\asar\apps\Booth\src\pages\BoothMemoryPage.tsx` to confirm `playTelephoneChime()` and `playbackTimerRef` without `HTMLAudioElement.play()`.

5. **Invalidation Condition**:
   If any of the 219 tests fail, or if `node` is unable to run `npx tsx --test`, this assessment is invalidated.
