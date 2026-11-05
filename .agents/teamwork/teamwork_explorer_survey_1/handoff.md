# Monorepo Routing Explorer Handoff Report

**Agent Identity:** Monorepo Routing Explorer (`teamwork_explorer_survey_1`)  
**Parent Agent:** `4c825e6f-42b7-49c9-93f4-12289ac61350`  
**Mission:** Monorepo-Wide Client-Side Routing & Dynamic Subdomain Renderer Architecture Investigation  
**Working Directory:** `d:\asar\.agents\teamwork\teamwork_explorer_survey_1`  
**Associated Analysis:** `d:\asar\.agents\teamwork\teamwork_explorer_survey_1\analysis.md`  

---

## 1. Observation

### 1.1. Absence of Routing Dependencies Monorepo-Wide
Ripgrep search across all `package.json` files in `d:\asar` confirmed zero instances of `react-router` or `react-router-dom`:
- Search command: `grep_search(Query: "react-router", SearchPath: "d:\\asar", Includes: ["package.json"])`
- Result: `No results found`
- Also verified across `package-lock.json`: zero entries.
- Root `package.json` lines 22-25 enforce React 18:
  ```json
  "overrides": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
  ```

### 1.2. Existing Navigation Mechanisms per Application
1. **`apps/Admin` (`d:\asar\apps\Admin\src\App.tsx:218-334`)**:
   - Navigation is handled entirely in memory:
     ```tsx
     const [activeTab, setActiveTab] = useState<AdminTab>("overview");
     const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
     ```
   - In `AdminShell.tsx:191-235`, tabs are rendered as `<button onClick={() => onSelectTab(tab.id)}>`.
   - In `OrdersQueueManager.tsx` and `AdminOverview.tsx`, transitions occur via callbacks `onOpenStudio(orderId, serviceType)`. Refreshing loses all tab and order context.
2. **`apps/Booth` (`d:\asar\apps\Booth\src\App.tsx:23-87`)**:
   - Uses a custom pseudo-router:
     ```tsx
     const getMemorySlugFromUrl = (): string | null => {
       const path = window.location.pathname;
       if (path.startsWith("/memory/")) {
         return path.replace("/memory/", "").split("/")[0].trim();
       }
       const searchParams = new URLSearchParams(window.location.search);
       return searchParams.get("memory")?.trim() || null;
     };
     ```
   - Navigation calls `window.history.pushState({}, "", newUrl)` and attaches a `popstate` listener (`App.tsx:44-48`).
3. **`apps/Invitation` (`d:\asar\apps\Invitation\src\App.tsx:14-65`)**:
   - Uses in-memory state with query parameter sync:
     ```tsx
     const [view, setView] = useState<AppViewState>(parseInitialRoute);
     ...
     window.history.replaceState(null, "", newUrl);
     ```
   - Routes between landing, event (`?event=`), and pass (`?pass=`).
4. **`apps/Main` (`d:\asar\apps\Main\src\App.tsx:9-29`)**:
   - Parses query parameters on mount:
     ```tsx
     const [view, setView] = useState<ActiveView>("gateway");
     const [accountTab, setAccountTab] = useState<string>("orders");
     ```
   - In `ClientAccountShell.tsx:55-220`, tabs (`orders`, `assets`, `audio`, `qr_hub`, `mailbox`) are managed via `useState`.

### 1.3. Hardcoded Localhost & Query String Links Across Apps
- `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:43`:
  `const landingUrl = "http://localhost:3002?memory=" + (memory.slug || "mina-and-maryam");`
- `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx:301, 343`:
  `const invitationUrl = "http://localhost:3003?event=" + slug;`
- `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx:112`:
  `const passLink = "http://localhost:3003?pass=" + rsvp.$id + "&token=" + passToken;`
- `apps/Main/src/components/account/QrHubManager.tsx:29-30`:
  `order.serviceType === "booth" ? "http://localhost:3002?memory=" + slug : "http://localhost:3003?event=" + slug;`
- `apps/Booth/src/components/sections/BookingModal.tsx:418`:
  `href={"http://localhost:3000?orderId=" + submittedOrderId}`

### 1.4. Build & Test Tooling
- Node version: `v24.16.0`.
- Native test suite: `node --experimental-strip-types --test packages/react-appwrite/test/domain.test.ts` passes 7/7 tests in 315ms.
- Running `node --experimental-strip-types --test` on tests importing `.tsx` files fails with `ERR_UNKNOWN_FILE_EXTENSION: Unknown file extension ".tsx"`, proving that unit tests must import pure `.ts` modules.

---

## 2. Logic Chain

1. **Premise (Observation 1.1 & 1.2):**  
   Every app currently uses custom in-memory `useState` or primitive `window.history` wrappers. Therefore, users cannot bookmark, refresh, or share deep links (`/orders`, `/memory/mina-and-maryam`, `/account/mailbox`), violating production web standards and the monorepo architecture requirement (R1).
2. **Premise (Observation 1.1):**  
   React is fixed to `18.2.0` across the monorepo. `react-router-dom@^6.28.0` is the standard, stable release line supporting React 18 without peer dependency warnings or breaking API shifts.
3. **Premise (Observation 1.3):**  
   Cross-app references and QR code generators rely on hardcoded ports and query strings (`?memory=...`, `?event=...`). Therefore, introducing standard routes (`/memory/:slug`, `/e/:slug`, `/pass/:rsvpId`) requires synchronizing the URL generation logic across Admin studios, the Client QR Hub, and EmailJS dispatchers.
4. **Premise (Observation 1.4 & Requirement R2):**  
   Dynamic subdomain rendering (e.g. `mina-maryam.asar.audio` or `mina-maryam.localhost:3002`) cannot rely on hardcoded paths. A universal resolver function (`extractSubdomain()`) supporting RFC 6761 `.localhost` and query overrides (`?subdomain=...`) allows instant local testing without editing `/etc/hosts`, while resolving wildcard subdomains in production.
5. **Conclusion:**  
   Installing `react-router-dom@^6.28.0` across `apps/*`, converting layouts and tabs to `<NavLink>` and `<Outlet />`, routing parameters via `useParams()`, and implementing `extractSubdomain()` fully satisfies requirements R1, R2, and R3 with zero disruption to existing business logic.

---

## 3. Caveats

1. **Subdomain Architecture Decision (Single Dedicated App vs. Embedded):**  
   As analyzed in `analysis.md` Section 5, both Strategy A (dedicated `apps/Renderer` on port 3004) and Strategy B (embedded resolvers in `apps/Booth` and `apps/Invitation`) are viable. We recommend starting with Strategy B for zero monorepo footprint changes, while architecting `subdomainResolver.ts` so it can be extracted to a dedicated app at any time.
2. **Chakra UI v3 Link Component Collision:**  
   Both `@chakra-ui/react` and `react-router-dom` export `Link`. Developers must import React Router's Link as `RouterLink` or compose via Chakra's `asChild` prop (`<ChakraLink asChild><RouterLink to="...">...</RouterLink></ChakraLink>`).
3. **Testing Constraints:**  
   `node --experimental-strip-types --test` cannot parse JSX/TSX syntax. Subdomain resolution and route generation helpers must be authored in `.ts` files to enable lightning-fast native Node testing.

---

## 4. Conclusion

1. **Target Dependency:** Install `react-router-dom@^6.28.0` in `apps/Admin`, `apps/Booth`, `apps/Invitation`, and `apps/Main`.
2. **Target Routing Map:**
   - **`Admin`**: `/overview`, `/plans`, `/orders`, `/orders/:orderId`, `/booth-studio/:orderId`, `/invitation-studio/:orderId`.
   - **`Booth`**: `/`, `/book`, `/memory/:slug` (Image #1 memory heirloom), `/m/:slug`.
   - **`Invitation`**: `/`, `/book`, `/e/:slug` (Custom event), `/pass/:rsvpId` (VIP QR Pass), `/scanner/:invitationId`.
   - **`Main`**: `/` (Gateway), `/auth`, `/account/orders`, `/account/assets`, `/account/audio`, `/account/qr-hub`, `/account/mailbox`.
3. **Subdomain Engine:** Introduce `extractSubdomain()` in `@repo/react-appwrite` supporting RFC 6761 `*.localhost`, query overrides (`?subdomain=`), and production subdomains (`*.asar.audio`).
4. **Admin Alignment:** Update QR Code and preview URLs in `MediaAndTabsEditor.tsx` and `InvitationStudio.tsx` to emit canonical paths or subdomains.

---

## 5. Verification Method

To independently verify this investigation and the upcoming implementation:

1. **Verify No React Router Currently Installed:**
   ```powershell
   Select-String -Path "apps\*\package.json", "package.json" -Pattern "react-router"
   ```
   *Expected:* No matches found.

2. **Verify Node.js Version & Native Test Runner:**
   ```powershell
   node -v
   node --experimental-strip-types --test packages/react-appwrite/test/domain.test.ts
   ```
   *Expected:* Node v24.x, 7/7 tests pass in < 500ms.

3. **Verify Absolute Script Path in index.html Across All Apps:**
   ```powershell
   Select-String -Path "apps\*\index.html" -Pattern "/src/main.tsx"
   ```
   *Expected:* All 4 apps have `<script type="module" src="/src/main.tsx"></script>`.

4. **Verify TypeScript Compatibility (Post-Implementation):**
   ```powershell
   npm run build
   ```
   *Expected:* Turbo completes `tsc -b` and `vite build` across all packages and apps with zero errors.

5. **Invalidation Conditions:**
   - Upgrading to React 19 before React Router v7 stability would invalidate the `react-router-dom@^6.28.0` recommendation.
   - If production hosting cannot support wildcard DNS (`*.asar.audio`), path-based routing (`/memory/:slug`, `/e/:slug`) must be the primary presentation mode.
