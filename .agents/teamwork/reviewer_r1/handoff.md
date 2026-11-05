# Review & Adversarial Quality Report — Monorepo-Wide React Router Integration

**Reviewer Identity**: Monorepo Routing & Build Reviewer (`reviewer_r1`)  
**Target Milestone**: Milestone 2 & Milestone 3 (React Router v6 Monorepo Integration & Dynamic Subdomain Storefronts)  
**Final Verdict**: **APPROVE**  
**Integrity Audit**: **PASS (Zero integrity violations, zero facades, zero hardcoded shortcuts)**

---

## 1. Observation

### 1.1 Dependency Verification
Inspected `package.json` across all 4 applications:
- `apps/Admin/package.json`: Line 19 contains `"react-router-dom": "^6.28.0"`.
- `apps/Booth/package.json`: Line 21 contains `"react-router-dom": "^6.28.0"`.
- `apps/Invitation/package.json`: Line 19 contains `"react-router-dom": "^6.28.0"`.
- `apps/Main/package.json`: Line 19 contains `"react-router-dom": "^6.28.0"`.

### 1.2 Entry Point `<BrowserRouter>` Wrapping
Inspected `main.tsx` across all 4 applications:
- `apps/Admin/src/main.tsx` (lines 15-21):
  ```tsx
  <BrowserRouter>
    <ChakraProvider value={defaultSystem}>
      <AppwriteProvider endpoint={endpoint} project={project} databaseId={databaseId}>
        <App />
      </AppwriteProvider>
    </ChakraProvider>
  </BrowserRouter>
  ```
- `apps/Booth/src/main.tsx` (lines 15-21):
  ```tsx
  <ChakraProvider value={defaultSystem}>
    <AppwriteProvider endpoint={endpoint} project={project} databaseId={databaseId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppwriteProvider>
  </ChakraProvider>
  ```
- `apps/Invitation/src/main.tsx` (lines 15-21):
  ```tsx
  <ChakraProvider value={defaultSystem}>
    <AppwriteProvider endpoint={endpoint} project={project} databaseId={databaseId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppwriteProvider>
  </ChakraProvider>
  ```
- `apps/Main/src/main.tsx` (lines 15-21):
  ```tsx
  <BrowserRouter>
    <ChakraProvider value={defaultSystem}>
      <AppwriteProvider endpoint={endpoint} project={project} databaseId={databaseId}>
        <App />
      </AppwriteProvider>
    </ChakraProvider>
  </BrowserRouter>
  ```

### 1.3 Declarative `<Routes>` Architecture & Route Matching
- **`apps/Admin/src/App.tsx`** (lines 298-348):
  - Route `/` redirects to `/overview` (`<Navigate to="/overview" replace />`).
  - Route `/overview` renders `<AdminOverview />`.
  - Route `/plans` renders `<PlanBuilderStudio />`.
  - Route `/orders` renders `<OrdersQueueManager />`.
  - Route `/orders/:orderId` renders `<OrdersQueueManager />` with route parameter hydration.
  - Route `/booth-studio/:orderId?` renders `<BoothStudioRouteWrapper />`.
  - Route `/invitation-studio/:orderId?` renders `<InvitationStudioRouteWrapper />`.
  - Wildcard route `*` safely redirects to `/overview`.

- **`apps/Booth/src/App.tsx`** (lines 304-318):
  - Route `/` renders `<DynamicBoothStorefrontIndex />`: evaluates 4-tier subdomain resolution (`useSubdomain`); renders `<BoothMemoryPage slug={subdomain} />` if a slug is detected, otherwise renders marketing `<BoothLandingView />`.
  - Route `/book` renders `<BoothLandingView autoOpenBooking={true} />`.
  - Route `/memory/:slug` renders `<BoothMemoryPage />`.
  - Route `/m/:slug` renders `<BoothMemoryPage />`.
  - Wildcard route `*` renders `<BoothLuxuryNotFound />` (bespoke branded 404).

- **`apps/Invitation/src/App.tsx`** (lines 339-358):
  - Route `/` renders `<DynamicInvitationStorefrontIndex />`: evaluates 4-tier subdomain resolution; renders `<CustomEventPage slug={subdomain} />` if slug is detected, otherwise renders `<InvitationLandingPage />`.
  - Route `/book` renders `<InvitationBookingRouteView />`.
  - Route `/e/:slug` renders `<CustomEventPage />`.
  - Route `/pass/:rsvpId` renders `<QrPassPage />`.
  - Route `/scanner/:invitationId` and `/scanner` render `<ScannerRouteView />`.
  - Wildcard route `*` renders `<InvitationLuxuryNotFound />` (bespoke branded 404).

- **`apps/Main/src/App.tsx`** (lines 93-137):
  - Route `/` renders `<PlatformGateway />`.
  - Route `/auth` renders `<PlatformGateway initialAuthOpen={true} />`.
  - Route `/account` and `/account/*` render `<ClientAccountShell />`.
  - Wildcard route `*` safely redirects to `/`.

### 1.4 Tab & Navigation URL Synchronization
- **`apps/Admin/src/components/layout/AdminShell.tsx`** (lines 23-39):
  - `getActiveTabFromLocation()` checks `location.pathname`:
    - `path.startsWith("/plans")` -> `"plans"`
    - `path.startsWith("/orders")` -> `"orders"`
    - `path.startsWith("/booth-studio")` -> `"booth-studio"`
    - `path.startsWith("/invitation-studio")` -> `"invitation-studio"`
    - fallback -> `"overview"`
  - `const currentTab = activeTab || getActiveTabFromLocation();`
  - Pill clicks call `navigate(`/${tabId}`)`.
  - Tab highlight reactively mirrors URL bar and browser history events (Back / Forward).

- **`apps/Main/src/components/account/ClientAccountShell.tsx`** (lines 59-84):
  - `getActiveTab()` evaluates `location.pathname.replace(/\/+$/, "")`:
    - `pathname.endsWith("/mailbox")` -> `"mailbox"`
    - `pathname.endsWith("/qr-hub")` or `pathname.endsWith("/qr_hub")` -> `"qr_hub"`
    - `pathname.endsWith("/audio")` -> `"audio"`
    - `pathname.endsWith("/assets")` -> `"assets"`
    - `pathname.endsWith("/orders")` -> `"orders"`
    - Query parameter fallback `?tab=...` supported.
    - Default fallback -> `"orders"`.
  - Tab clicks call `navigate(`/account/${route}`)`.

### 1.5 Chakra UI v3 Link Compatibility
- Monorepo apps utilize standard `useNavigate()` programmatic transitions and standard native HTML anchors `<a>` for cross-port ecosystem links (`http://localhost:3000`, `http://localhost:3002`, `http://localhost:3003`).
- No conflicting imports between Chakra UI v3 `<Link>` and React Router `<Link>` / `<NavLink>` exist in any component file.

### 1.6 Independent Terminal Verification Results
Executed the following terminal commands:
1. `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json`  
   **Result**: Exit Code 0 (0 errors).
2. `npx tsc --noEmit -p apps/Admin/tsconfig.app.json`  
   **Result**: Exit Code 0 (0 errors).
3. `npx tsc --noEmit -p apps/Booth/tsconfig.app.json`  
   **Result**: Exit Code 0 (0 errors).
4. `npx tsc --noEmit -p apps/Invitation/tsconfig.app.json`  
   **Result**: Exit Code 0 (0 errors).
5. `npx tsc --noEmit -p apps/Main/tsconfig.app.json`  
   **Result**: Exit Code 0 (0 errors).
6. `npx eslint apps/Admin/src/App.tsx apps/Admin/src/main.tsx apps/Booth/src/App.tsx apps/Booth/src/main.tsx apps/Invitation/src/App.tsx apps/Invitation/src/main.tsx apps/Main/src/App.tsx apps/Main/src/main.tsx apps/Admin/src/components/layout/AdminShell.tsx apps/Main/src/components/account/ClientAccountShell.tsx`  
   **Result**: Exit Code 0 (0 lint warnings or errors).
7. `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts`  
   **Result**: Exit Code 0 (13 passed, 0 failed, duration 194ms).

---

## 2. Logic Chain

1. **Routing Coverage**: Observations in §1.1 through §1.3 demonstrate that `react-router-dom@^6.28.0` is installed and actively linked across all 4 applications. Every app provides a top-level `<BrowserRouter>` in `main.tsx` and defines declarative `<Routes>` in `App.tsx`.
2. **Path Contract Compliance**: Comparing observed routes in §1.3 against the dispatch requirements:
   - Admin routes: `/overview`, `/plans`, `/orders`, `/orders/:orderId`, `/booth-studio/:orderId?`, `/invitation-studio/:orderId?` are all defined and mapped to their respective studio components.
   - Booth routes: `/` (dynamic storefront index), `/book`, `/memory/:slug`, `/m/:slug`, `*` (luxury 404) are all defined.
   - Invitation routes: `/` (dynamic storefront index), `/book`, `/e/:slug`, `/pass/:rsvpId`, `/scanner/:invitationId`, `*` (luxury 404) are all defined.
   - Main routes: `/`, `/auth`, `/account` (with `/account/orders`, `/account/assets`, `/account/audio`, `/account/qr-hub`, `/account/mailbox`) are all defined.
   Therefore, all routing specifications from Milestone 2 and Milestone 3 are 100% satisfied.
3. **Deep Linking and URL Synchronization**: Observations in §1.4 demonstrate that active tab state in both `AdminShell.tsx` and `ClientAccountShell.tsx` is directly computed from `location.pathname`. Clicking browser back/forward or deep-linking directly into a specific URL updates the highlighted tab and view synchronously without out-of-sync visual glitches.
4. **Typecheck & Linter Integrity**: Observations in §1.6 confirm that across all 4 apps and the core shared library, TypeScript compilation succeeds with zero errors, ESLint produces zero warnings/errors, and the 13 automated tests in `storefront.test.ts` pass cleanly.
5. **Absence of Integrity Violations**: Forensic review of `packages/react-appwrite/src/Storefront` and application components verified genuine logic:
   - RFC 1123 regex matching, 63-character limit, reserved subdomain filtering, and case normalization.
   - Real 4-tier resolution engine (Query -> RouteParam -> Hostname -> Fallback).
   - Dynamic parameter extraction via `useParams()`.
   - No mock test bypasses or facade stubs detected.

---

## 3. Caveats

- **Infrastructure / DNS Wildcarding**: Local development is thoroughly covered by RFC 6761 `*.localhost` (native browser loopback to 127.0.0.1 without `/etc/hosts` modifications) and query parameters (`?subdomain=slug`). In production, wildcard DNS records (`*.asar.me`, `*.asar.audio`) and SSL certificates must be provisioned at the cloud hosting provider layer, which is external to repository source code.
- **Client Account Subpaths**: Navigating to `/account` without a subpath defaults cleanly to the orders tab (`initialTab || "orders"`), preserving UX resilience.

---

## 4. Conclusion

The implementation of Monorepo-Wide React Router Integration (Milestones 2 & 3) across `apps/Admin`, `apps/Booth`, `apps/Invitation`, and `apps/Main` is complete, robust, type-safe, and adheres to project architectural contracts.

**Verdict**: **APPROVE**

---

## 5. Verification Method

To independently reproduce this verification, run the following commands from the repository root:

```bash
# 1. Typecheck shared package
npx tsc --noEmit -p packages/react-appwrite/tsconfig.json

# 2. Typecheck Admin app
npx tsc --noEmit -p apps/Admin/tsconfig.app.json

# 3. Typecheck Booth app
npx tsc --noEmit -p apps/Booth/tsconfig.app.json

# 4. Typecheck Invitation app
npx tsc --noEmit -p apps/Invitation/tsconfig.app.json

# 5. Typecheck Main client portal app
npx tsc --noEmit -p apps/Main/tsconfig.app.json

# 6. ESLint modified routing files
npx eslint apps/Admin/src/App.tsx apps/Admin/src/main.tsx apps/Booth/src/App.tsx apps/Booth/src/main.tsx apps/Invitation/src/App.tsx apps/Invitation/src/main.tsx apps/Main/src/App.tsx apps/Main/src/main.tsx apps/Admin/src/components/layout/AdminShell.tsx apps/Main/src/components/account/ClientAccountShell.tsx

# 7. Automated Storefront Unit Tests
node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts
```

**Invalidation Conditions**:
- Any non-zero exit code on the above `tsc` or `eslint` commands.
- Failure of any unit test in `storefront.test.ts`.
- Mismatched route parameter extraction when accessing dynamic memories or orders.
