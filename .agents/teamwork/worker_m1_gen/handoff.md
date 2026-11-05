# Milestone 1: Invitation & Booth Memory Generation Stabilization — Handoff Report

> **Worker Agent**: `worker_m1_gen`  
> **Milestone**: M1 — Invitation & Booth Memory Generation Stabilization  
> **Target Files (Exclusive Ownership)**:
> 1. `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`
> 2. `apps/Invitation/src/components/pass/GuestAccessPass.tsx`
> 3. `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx`
> 4. `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`
> 5. `apps/Booth/src/pages/BoothMemoryPage.tsx`
> 6. `apps/Invitation/src/pages/ScannerRouteView.tsx`

---

## 1. Observation

1. **Pass Verification URL Hardcoding**:
   - In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx:112`, the pass link was previously hardcoded as:
     ```ts
     const passLink = `http://localhost:3003?pass=${rsvp.$id}&token=${passToken}`;
     ```
   - In `apps/Invitation/src/components/pass/GuestAccessPass.tsx:33`, the pass URL was hardcoded as:
     ```ts
     const passUrl = `http://localhost:3003?pass=${currentRsvp.$id || currentRsvp.id}&token=${currentRsvp.passToken}`;
     ```
   - When delivered via EmailJS to mobile recipients outside localhost, the link caused network errors (`ERR_CONNECTION_REFUSED`) because localhost was inaccessible to the mobile device.

2. **Unrevoked Object URLs (Memory Leaks)**:
   - In `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx:646`, `URL.createObjectURL(file)` was invoked for each ingested audio recording without tracking references or invoking `URL.revokeObjectURL(url)`.
   - In `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:63` and line 313, `URL.createObjectURL(file)` was invoked for gallery photos and video highlights without revoking URLs upon deletion, replacement, or component unmount.

3. **Audio Playback Simulation in Booth Client**:
   - In `apps/Booth/src/pages/BoothMemoryPage.tsx:224-258`, `handleTogglePlayVoice` played a Web Audio dial chime and ran a synthetic interval timer (`currentTime += 0.2`), but never instantiated an `HTMLAudioElement` to stream `record.audioUrl`. Visitors on the published Booth memory site could not hear recorded voice tracks.

4. **Missing Resilient Scanner View**:
   - `apps/Invitation/src/pages/ScannerRouteView.tsx` did not previously exist as a standalone page component. While `apps/Invitation/src/App.tsx` declared `<Route path="/scanner/:invitationId" element={<ScannerRouteView />} />` with an inline minimal wrapper, malformed tokens or empty queries lacked defensive validation and luxury editorial feedback.

5. **Test and Compilation Baseline**:
   - Monorepo TypeScript check commands:
     - `npx tsc --noEmit -p apps/Main/tsconfig.app.json` (exit code 0)
     - `npx tsc --noEmit -p apps/Invitation/tsconfig.app.json` (exit code 0)
     - `npx tsc --noEmit -p apps/Admin/tsconfig.app.json` (exit code 0)
     - `npx tsc --noEmit -p apps/Booth/tsconfig.app.json` (exit code 0)
   - Automated unit test suite:
     - `npx tsx --test apps/Main/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts`: 121 tests pass in 4.4s.
     - Full repository test suite (including Renderer & packages): 219 tests pass in 4.8s.

---

## 2. Logic Chain

1. **Canonical Pass URL Resolution**:
   - Importing `buildMemoryUrls` from `@repo/react-appwrite` in `ClientRsvpMailbox.tsx` and `GuestAccessPass.tsx` enables environment-aware pass link construction:
     - When `window.location.origin` is on a non-localhost host or production domain, it generates `https://${slug}.asar.me/pass/${rsvpId}?token=${passToken}`.
     - When in local development, it preserves `http://localhost:3003/pass/${rsvpId}?token=${passToken}` (or current origin on port 3003).
   - This ensures mobile guests clicking EmailJS invitation links or scanning QR passes are directed to the canonical accessible destination.

2. **Object URL Lifecycle Management**:
   - In `BulkVoiceUploader.tsx`:
     - Added `activeObjectUrlsRef = useRef<Set<string>>(new Set())`.
     - Whenever `URL.createObjectURL(file)` is called, the URL is registered in the set.
     - In `useEffect(() => () => { ... }, [])`, all registered URLs are revoked with `URL.revokeObjectURL(url)`.
     - Exported `revokeVoiceObjectUrl` and `revokeAllVoiceObjectUrls` helpers, and wired `handleDeleteVoice`.
   - In `MediaAndTabsEditor.tsx`:
     - Added `activeObjectUrlsRef` tracking all photo and video object URLs.
     - In `handleDeleteMedia(id)`, the item's `fileUrl` is revoked from browser memory and removed from the set.
     - In `videoInputRef` `onChange`, any prior video object URL is revoked before creating a replacement.
     - All remaining URLs are cleanly revoked on unmount.

3. **Real Audio Streaming in Booth Memory**:
   - In `BoothMemoryPage.tsx`:
     - Added `audioElementRef = useRef<HTMLAudioElement | null>(null)`.
     - In `handleTogglePlayVoice(record)`:
       - Plays the vintage dial chime intro (`playTelephoneChime()`).
       - If `record.audioUrl` exists, attaches to `audioElementRef.current`, sets `src = record.audioUrl`, and calls `play()`.
       - Listens to native `ontimeupdate` to synchronize `currentTime` smoothly.
       - Listens to `onloadedmetadata` to synchronize exact `duration`.
       - Listens to `onended` to reset progress and clear playing voice ID.
       - Gracefully falls back to animated timer simulation if audio cannot be loaded, browser blocks autoplay, or running in an offline environment.
       - When switching tracks or pausing, pauses and resets the existing audio element.
       - Cleans up and pauses audio on component unmount and `AudioPlayerBar.onClose`.

4. **Resilient Scanner Route View**:
   - In `apps/Invitation/src/pages/ScannerRouteView.tsx`:
     - Built a defensive, dedicated scanner page component.
     - Implemented `extractTokenOrId(raw: unknown)`: extracts tokens from raw strings, query parameters (`token=`, `pass=`, `rsvp=`), or URLs without throwing exceptions.
     - Implemented `validatePassTokenFormat(tokenInput: unknown)`: validates token length and character set (`/^[A-Za-z0-9_-]{3,64}$/`), categorizing empty and malformed tokens.
     - Implemented `lookupRsvpRecord(tokenOrId: string)`: safely checks `localStorage` cache (`asar_invitation_rsvps_cache`) or demo fallback without JSON parse errors.
     - If a token is empty or malformed, displays a luxury editorial warning badge in ASAR Warm Vintage style (`#FFF5F5`, `#9B2C2C`, gold border `#D4AF37`) explaining the failure and guiding attendants.
     - Renders `VenueQrScanner`, updates attendance status on check-in, and renders an attendant context footer.

---

## 3. Caveats

- In headless test runner environments (Node.js without simulated DOM Audio), `window.Audio` is undefined; `BoothMemoryPage` safely detects this and falls back to visual timer simulation.
- `ClientRsvpMailbox` continues to fallback to `demo` data when offline without active Appwrite database connection.
- No caveats regarding file boundaries: only the 6 explicitly designated files were modified/created.

---

## 4. Conclusion

Milestone 1 (Invitation & Booth Memory Generation Stabilization) is complete and fully verified:
- Pass verification URLs resolve canonically across production and local environments.
- Object URL memory leaks in Bulk Audio and Media Editors are eliminated via automated tracking and unmount revocation.
- Real HTMLAudioElement streaming with analog chime intro and time synchronization is live in Booth Memory.
- Scanner route resiliency gracefully handles null, empty, and malformed pass inputs with luxury editorial feedback.
- TypeScript compiles with 0 errors across all 4 applications.
- All 219 tests across the repository pass without regressions.

---

## 5. Verification Method

1. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit -p apps/Main/tsconfig.app.json
   npx tsc --noEmit -p apps/Invitation/tsconfig.app.json
   npx tsc --noEmit -p apps/Admin/tsconfig.app.json
   npx tsc --noEmit -p apps/Booth/tsconfig.app.json
   ```
   *Expected Output*: Exit code 0, 0 errors.

2. **Verify Automated Tests**:
   ```bash
   npx tsx --test apps/Main/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts
   ```
   *Expected Output*: 121 tests pass, 0 failures.

3. **Verify Full Repository Test Suite**:
   ```bash
   npx tsx --test apps/Admin/test/*.test.ts apps/Booth/test/*.test.ts apps/Invitation/test/*.test.ts apps/Main/test/*.test.ts apps/Renderer/test/*.test.ts packages/react-appwrite/test/*.test.ts
   ```
   *Expected Output*: 219 tests pass, 0 failures.

4. **Inspect Modified Files**:
   - `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx`
   - `apps/Invitation/src/components/pass/GuestAccessPass.tsx`
   - `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx`
   - `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`
   - `apps/Booth/src/pages/BoothMemoryPage.tsx`
   - `apps/Invitation/src/pages/ScannerRouteView.tsx`
