# Reviewer 1 Handoff Report: Architecture & Router Review

**Agent**: `reviewer_m6_1` (Role: Architecture & Router Reviewer, reviewer & critic)  
**Parent / Caller**: `5b9b91d8-2ae1-48a5-9c39-c7909b1a52d5`  
**Milestone**: Milestone 6 (Independent Verification, Adversarial Stress Testing & Audit)  
**Verdict**: **APPROVE**  
**Date**: 2026-11-03T23:16:00Z  

---

## 1. Observation

### 1.1 Monorepo-Wide React Router v6 Integration

Every application within `apps/*` was inspected for client-side routing compliance:

1. **`apps/Main` (Client Platform Gateway & Account Portal — Port 3000)**:
   - `apps/Main/package.json`: Contains `"react-router-dom": "^6.28.0"`.
   - `apps/Main/src/main.tsx` (lines 3, 15-21): Root component is wrapped with `<BrowserRouter>`.
   - `apps/Main/src/App.tsx` (lines 2, 92-137): Declarative `<Routes>` defined with routes:
     - `/`: `<PlatformGateway>`
     - `/auth`: `<PlatformGateway initialAuthOpen={true}>`
     - `/account`: `<ClientAccountShell>`
     - `/account/*`: `<ClientAccountShell>`
     - `*`: `<Navigate to="/" replace />`
   - `apps/Main/src/components/account/ClientAccountShell.tsx` (lines 56-85): Tab state is derived from `location.pathname` (`/account/orders`, `/account/assets`, `/account/audio`, `/account/qr-hub`, `/account/mailbox`) with `navigate()` handling tab switching. No hidden unrouted state controls primary views.

2. **`apps/Admin` (Management Console — Port 3001)**:
   - `apps/Admin/package.json`: Contains `"react-router-dom": "^6.28.0"`.
   - `apps/Admin/src/main.tsx` (lines 3, 15-21): Root tree is wrapped with `<BrowserRouter>`.
   - `apps/Admin/src/App.tsx` (lines 2, 298-348): Declarative `<Routes>` defined with routes:
     - `/`: `<Navigate to="/overview" replace />`
     - `/overview`: `<AdminOverview>`
     - `/plans`: `<PlanBuilderStudio>`
     - `/orders`: `<OrdersQueueManager>`
     - `/orders/:orderId`: `<OrdersQueueManager>`
     - `/booth-studio/:orderId?`: `<BoothStudioRouteWrapper>`
     - `/invitation-studio/:orderId?`: `<InvitationStudioRouteWrapper>`
     - `*`: `<Navigate to="/overview" replace />`
   - `apps/Admin/src/components/layout/AdminShell.tsx` (lines 3, 20-39): Active tab derived from `location.pathname` (`/plans`, `/orders`, `/booth-studio`, `/invitation-studio`, `/overview`) and transitions trigger `navigate('/' + tabId)`.

3. **`apps/Booth` (Audio Guestbook Experience & Booking — Port 3002)**:
   - `apps/Booth/package.json`: Contains `"react-router-dom": "^6.28.0"`.
   - `apps/Booth/src/main.tsx` (lines 5, 17-19): Root component wrapped with `<BrowserRouter>`.
   - `apps/Booth/src/App.tsx` (lines 2, 303-319): Declarative `<Routes>` configured with:
     - `/`: `<DynamicBoothStorefrontIndex>` (uses `useSubdomain`)
     - `/book`: `<BoothLandingView autoOpenBooking={true}>`
     - `/memory/:slug`: `<BoothMemoryPage>`
     - `/m/:slug`: `<BoothMemoryPage>`
     - `*`: `<BoothLuxuryNotFound>`

4. **`apps/Invitation` (Digital Invitation Experience & Booking — Port 3003)**:
   - `apps/Invitation/package.json`: Contains `"react-router-dom": "^6.28.0"`.
   - `apps/Invitation/src/main.tsx` (lines 5, 17-19): Root component wrapped with `<BrowserRouter>`.
   - `apps/Invitation/src/App.tsx` (lines 2, 337-359): Declarative `<Routes>` configured with:
     - `/`: `<DynamicInvitationStorefrontIndex>` (uses `useSubdomain`)
     - `/book`: `<InvitationBookingRouteView>`
     - `/e/:slug`: `<CustomEventPage>`
     - `/pass/:rsvpId`: `<QrPassPage>`
     - `/scanner/:invitationId` & `/scanner`: `<ScannerRouteView>`
     - `*`: `<InvitationLuxuryNotFound>`
   - Fixed reviewer pill (lines 238-334) utilizes `useNavigate()` and `useLocation()`.

5. **`apps/Renderer` (Dedicated Dynamic Storefront Renderer — Port 3004)**:
   - `apps/Renderer/package.json`: Contains `"react-router-dom": "^6.28.0"`, `@repo/react-appwrite`, `@repo/ui-components`.
   - `apps/Renderer/vite.config.ts` (lines 10-16): Configured with `server: { port: 3004, host: "0.0.0.0" }`.
   - `apps/Renderer/src/main.tsx` (lines 5, 29-31): Root tree wrapped with `<BrowserRouter>`.
   - `apps/Renderer/src/App.tsx` (lines 2, 12-56): Declarative `<Routes>` configured with all 10 canonical route paths:
     - `/`: `<DynamicStorefrontIndex />` (renders `StorefrontShowcasePortal` at bare apex or resolves dynamic subdomain)
     - `/s/:slug`: `<DynamicStorefrontIndex />` (universal path)
     - `/booth/:slug`, `/memory/:slug`, `/m/:slug`: `<DynamicStorefrontIndex forcedType="booth" />`
     - `/invitation/:slug`, `/event/:slug`, `/e/:slug`: `<DynamicStorefrontIndex forcedType="invitation" />`
     - `/pass/:rsvpId`: `<GuestPassStorefrontPage />`
     - `*`: `<StorefrontNotFound />` (editorial luxury 404)

### 1.2 Dedicated Renderer UX & Components

- **`StorefrontShowcasePortal` (`apps/Renderer/src/pages/StorefrontShowcasePortal.tsx`)**:
  - Rendered when `subdomain` evaluates to `null` on bare apex (`http://localhost:3004/`, `http://127.0.0.1:3004/`).
  - Features real-time diagnostics display (`{currentHost}:{currentPort} · Bare Apex Storefront Portal`), interactive slug tester bar (`handleLaunchSlug`), quick launcher links for universal (`/s/mina-and-maryam`, `/s/omar-and-layla`), query override (`/?subdomain=...`), RFC 6761 loopback links (`http://*.localhost:3004/`), and VIP Pass launcher (`/pass/rsvp-demo-001`).
- **`StorefrontNotFound` (`apps/Renderer/src/pages/StorefrontNotFound.tsx`)**:
  - Editorial luxury Arabic typography (Amiri, Cairo, Playfair Display), Athar maroon and gold palette (`var(--athar-maroon)`, `var(--athar-gold)`).
  - Explicit diagnostic reason reporting (`reason="reserved"`, `reason="invalid"`, `reason="not-found"`), target slug and source badge (`target: [slug] ([source])`), and return navigation buttons.
- **`BoothMemoryRenderer` (`apps/Renderer/src/components/booth/BoothMemoryRenderer.tsx`)**:
  - 1,631 lines of comprehensive implementation: Web Audio waveform audio player (48 frequency peaks), PIN padlock modal, candid photo gallery with lightbox, 30s video highlight reel modal, guestbook blessings submission, and sharing actions.
- **`InvitationMemoryRenderer` (`apps/Renderer/src/components/invitation/InvitationMemoryRenderer.tsx`)**:
  - 617 lines of comprehensive implementation: Dynamic countdown ticker, interactive schedule timeline, Google Maps venue link & dress code guide, dynamic multi-field RSVP form, and VIP QR pass modal.

### 1.3 TypeScript Compilation Verification

All 6 tsconfigs across packages and applications were independently compiled with `npx tsc --noEmit`:
1. `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json` -> Exit code `0` (clean, 0 errors)
2. `npx tsc --noEmit -p apps/Admin/tsconfig.json` -> Exit code `0` (clean, 0 errors)
3. `npx tsc --noEmit -p apps/Booth/tsconfig.json` -> Exit code `0` (clean, 0 errors)
4. `npx tsc --noEmit -p apps/Invitation/tsconfig.json` -> Exit code `0` (clean, 0 errors)
5. `npx tsc --noEmit -p apps/Main/tsconfig.json` -> Exit code `0` (clean, 0 errors)
6. `npx tsc --noEmit -p apps/Renderer/tsconfig.json` -> Exit code `0` (clean, 0 errors)

### 1.4 Automated Unit Test Verification

- `apps/Renderer/test/*.test.ts` (Command: `npx tsx --test apps/Renderer/test/*.test.ts`):
  - Result: **63 tests, 13 suites, 63 passed, 0 failed** (duration: 437ms).
  - Test suites:
    - `ASAR Memory Classifier — Preset Resolution`: 4/4 passed
    - `ASAR Memory Classifier — Route Hints & Forced Types`: 4/4 passed
    - `ASAR Memory Classifier — Query Parameter Overrides (?type=)`: 4/4 passed
    - `ASAR Memory Classifier — LocalStorage Cache Integration`: 5/5 passed
    - `ASAR Memory Classifier — Route & Prefix Heuristics`: 2/2 passed
    - `ASAR Memory Classifier — Unknown Slugs & 404 Fallbacks`: 4/4 passed
    - `ASAR Storefront Router — Navigation Paths & Patterns`: 7/7 passed
    - `ASAR Storefront Router — VIP Pass Token Resolution`: 5/5 passed
    - `ASAR Renderer — 4-Tier Subdomain Resolution Hierarchy`: 7/7 passed
    - `ASAR Renderer — RFC 6761 *.localhost Loopback & Hostname Parsing`: 4/4 passed
    - `ASAR Renderer — Bare Apex Detection (Showcase Portal Trigger)`: 4/4 passed
    - `ASAR Renderer — Reserved System Subdomains Rejection & 404 Trigger`: 5/5 passed
    - `ASAR Renderer — RFC 1123 Slug Validation Boundary & Adversarial Cases`: 8/8 passed
- Full Monorepo Unit Test Suites (Command: `npx tsx --test packages/react-appwrite/test/*.test.ts apps/Admin/test/*.test.ts apps/Invitation/test/*.test.ts apps/Renderer/test/*.test.ts`):
  - Result: **166 tests, 32 suites, 166 passed, 0 failed** (duration: 7.37s).

### 1.5 Integrity Violation Audit

- **Hardcoded test cheats / shortcuts**: Inspected `subdomain.ts`, `useSubdomain.ts`, `cacheHelper.ts`, `DynamicStorefrontIndex.tsx`. No artificial branch conditions inserted solely to satisfy unit test inputs. All resolution routines execute real regex checks, URL parsing, and cache retrieval.
- **Dummy / facade implementations**: Verified `apps/Renderer` contains fully realized, interactive components (`BoothMemoryRenderer` 1,631 lines, `InvitationMemoryRenderer` 617 lines).
- **External delegation bypasses**: All routing and storefront logic runs directly on local React Router v6 and native browser APIs.
- **Fabricated verification artifacts**: All commands executed live via shell tools with clean exit code 0.
- **Result**: Zero integrity violations found.

---

## 2. Logic Chain

1. **Requirement R1 (Monorepo-Wide React Router)**:
   - Each app in `apps/*` must have client-side routing with `<BrowserRouter>` and declarative `<Routes>`.
   - Inspection of `apps/Main`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, and `apps/Renderer` confirms `<BrowserRouter>` in each `main.tsx` and `<Routes>` with explicit paths in each `App.tsx`.
   - Tab switching in `apps/Main` and `apps/Admin` was verified to synchronize with browser URLs via `useLocation()` and `navigate()`.
   - **Conclusion**: Requirement R1 is fully met with zero regressions.

2. **Requirement R2 (Dedicated Dynamic Subdomain Renderer)**:
   - `apps/Renderer` must run on Port 3004, resolve dynamic subdomains (`*.localhost` and `*.asar.me`), support query/path fallbacks, and conditionally render Booth vs Invitation memories.
   - Vite server is explicitly configured for port 3004 and host `0.0.0.0`.
   - `DynamicStorefrontIndex.tsx` combines `useSubdomain` (4-tier hierarchy) with the memory classifier (presets, local caches, slug heuristics, Appwrite listDocuments).
   - Bare apex access (`http://localhost:3004/`) resolves `subdomain: null` and displays `StorefrontShowcasePortal`.
   - Unknown, reserved, or malformed slugs resolve to `StorefrontNotFound` with explicit Arabic and English messaging.
   - **Conclusion**: Requirement R2 is fully met.

3. **Requirement R3 (Admin Alignment)**:
   - Admin studios (`BoothMemoryStudio`, `HeroAndTextsEditor`, `MediaAndTabsEditor`, `InvitationStudio`) invoke `buildMemoryUrls` with `rendererPort: 3004`, generating `devRendererUrl` for localhost loopback previewing while strictly preserving canonical production targets (`https://${slug}.asar.me`) on QR codes.
   - **Conclusion**: Requirement R3 is fully met.

4. **Requirement R4 & Acceptance Criteria (Automated Testing & Compilation)**:
   - TypeScript compilation check (`tsc --noEmit`) passes cleanly with zero errors across all 6 targets.
   - Unit tests covering 4-tier subdomain resolution, RFC 6761 loopback, memory classification, cache normalization, and React Router navigation pass with 100% success rate (63/63 in Renderer, 166/166 monorepo).
   - **Conclusion**: Requirement R4 and all acceptance criteria are fully satisfied.

---

## 3. Caveats

1. **Production DNS / Reverse Proxy**: RFC 6761 `*.localhost` loopback is natively handled by modern browsers to `127.0.0.1`. In production (`*.asar.me`), wildcard DNS records (`*.asar.me -> Renderer cluster`) and SSL certificates must be provisioned at the cloud edge/infrastructure level.
2. **Appwrite Offline Fallback**: In local development without a running Appwrite backend container, `DynamicStorefrontIndex.tsx` uses try/catch defensive wrappers and seamlessly falls back to localStorage caches and built-in canonical presets (`mina-and-maryam`, `omar-and-layla`).
3. **No Unnecessary Builds / Scripts**: Strictly honored user rules — no `npm run build` executed without reason; zero unnecessary code generator scripts created.

---

## 4. Conclusion & Verdict

**Verdict**: **APPROVE**

The monorepo-wide React Router v6 architecture and dedicated `apps/Renderer` dynamic storefront implementation satisfy 100% of the requirements in `ORIGINAL_REQUEST.md` and the architecture specifications in `PROJECT.md`. Zero regressions, zero TypeScript compilation errors, zero test failures, and zero integrity violations exist across the codebase.

---

## 5. Verification Method

To independently reproduce this verification:

1. **Verify TypeScript compilation across all workspace tsconfigs**:
   ```powershell
   npx tsc --noEmit -p packages/react-appwrite/tsconfig.json
   npx tsc --noEmit -p apps/Admin/tsconfig.json
   npx tsc --noEmit -p apps/Booth/tsconfig.json
   npx tsc --noEmit -p apps/Invitation/tsconfig.json
   npx tsc --noEmit -p apps/Main/tsconfig.json
   npx tsc --noEmit -p apps/Renderer/tsconfig.json
   ```
   *Expected outcome*: All 6 commands exit with code 0 and zero errors.

2. **Run dedicated Renderer automated test suite**:
   ```powershell
   npx tsx --test apps/Renderer/test/*.test.ts
   ```
   *Expected outcome*: 63 tests across 13 suites pass with 0 failures in <500ms.

3. **Run full monorepo test suite**:
   ```powershell
   npx tsx --test packages/react-appwrite/test/*.test.ts apps/Admin/test/*.test.ts apps/Invitation/test/*.test.ts apps/Renderer/test/*.test.ts
   ```
   *Expected outcome*: 166 tests across 32 suites pass with 0 failures.

4. **Inspect key architecture files**:
   - `apps/Renderer/package.json` (port 3004 dev script, dependencies)
   - `apps/Renderer/vite.config.ts` (port 3004, host 0.0.0.0)
   - `apps/Renderer/src/App.tsx` (master 10-route tree)
   - `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx` (subdomain & classifier resolution)
   - `apps/Renderer/src/pages/StorefrontShowcasePortal.tsx` (bare apex luxury portal)
   - `apps/Renderer/src/pages/StorefrontNotFound.tsx` (editorial luxury 404)
   - `apps/Main/src/main.tsx` & `App.tsx`
   - `apps/Admin/src/main.tsx` & `App.tsx`
   - `apps/Booth/src/main.tsx` & `App.tsx`
   - `apps/Invitation/src/main.tsx` & `App.tsx`

---

## 6. Adversarial Challenge Report

### Overall Risk Assessment: LOW

### Stress Testing Scenarios & Evaluations

1. **Scenario 1: Query Override Hijacking on Route-Param Paths**
   - *Attack*: Navigating to `/booth/mina-and-maryam?subdomain=malicious-slug`.
   - *Evaluation*: Tier 1 evaluates `?subdomain=malicious-slug` unless `allowQueryOverride: false`. However, if the slug is invalid or unknown, it safely routes to `StorefrontNotFound`. In `DynamicStorefrontIndex.tsx`, `forcedType="booth"` remains anchored by route params, preventing cross-type spoofing.
   - *Status*: PASS.

2. **Scenario 2: Reserved Subdomain Impersonation**
   - *Attack*: Attempting to load `http://admin.localhost:3004/` or `/?subdomain=admin` to spoof administrative views through the storefront renderer.
   - *Evaluation*: `isReservedSubdomain("admin")` catches all 16 reserved system subdomains (`admin`, `api`, `auth`, `booth`, `main`, etc.) at both `extractSubdomain` and `DynamicStorefrontIndex` layers, immediately terminating into `StorefrontNotFound` with `reason="reserved"`.
   - *Status*: PASS.

3. **Scenario 3: Corrupt or Array vs Single-Object localStorage Cache Schemas**
   - *Attack*: Injecting malformed JSON (`"{ bad json"`) or single objects (`{ slug: "x" }`) into `asar_booth_memories_cache` or `asar_invitations_cache`.
   - *Evaluation*: `normalizeCacheArray` defensively catches JSON parse exceptions, unpacks envelope keys (`items`, `memories`, `documents`), and coerces single objects into arrays without throwing unhandled runtime exceptions.
   - *Status*: PASS.

4. **Scenario 4: RFC 1123 Boundary Injections**
   - *Attack*: Subdomains with 64+ characters, uppercase letters (`MINA`), leading/trailing hyphens (`-slug-`), and path traversal characters (`../`).
   - *Evaluation*: `validateSubdomainSlug` enforces RFC 1123 regex `/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/` and 63-character limit, safely rejecting all malformed inputs into `StorefrontNotFound` (`reason="invalid"`).
   - *Status*: PASS.
