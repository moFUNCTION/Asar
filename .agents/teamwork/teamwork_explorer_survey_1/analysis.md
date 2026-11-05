# ASAR Monorepo Client-Side Routing & Dynamic Subdomain Renderer Architecture Analysis

**Author:** Monorepo Routing Explorer  
**Date:** 2026-11-03  
**Target Workspaces:** `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `packages/*`  
**Reference Specification:** `docs/ASAR_PROJECT_ARCHITECTURE.md`, `ORIGINAL_REQUEST.md`  

---

## 1. Executive Summary

This investigation audits the current navigation architecture across all four applications in the ASAR Turborepo monorepo (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`) and formulates a unified, production-ready routing design.

### Key Discoveries:
1. **Zero Routing Dependencies Currently Installed:** `react-router-dom` is completely absent across all `package.json` files and `package-lock.json`.
2. **Current Navigation Relies on Fragile In-Memory State & Pseudo-Routers:**
   - **`Admin`** uses in-memory `useState<AdminTab>("overview")` with prop callbacks (`onOpenStudio`, `onSelectOrderForStudio`). Direct deep linking is impossible.
   - **`Booth`** relies on a bespoke pseudo-router in `App.tsx` parsing `window.location.pathname.startsWith("/memory/")` and `searchParams.get("memory")`, manually calling `window.history.pushState` and listening to `popstate`.
   - **`Invitation`** parses `?event=`, `?pass=`, `/e/`, and `/pass/` via `useState` and synchronizes with `window.history.replaceState`.
   - **`Main`** parses `?view=account&tab=...` on initial load into `useState` ("gateway" vs. "account"), with tab state inside `ClientAccountShell`.
3. **Hardcoded Ports & Query Strings in Cross-App Links:**
   - Cross-app links and QR code generators currently emit brittle URLs like `http://localhost:3002?memory=mina-and-maryam`, `http://localhost:3003?event=omar-and-layla`, and `http://localhost:3003?pass=rsvp-123&token=...`.
4. **React 18.2.0 Monorepo Alignment:** React is pinned via root `overrides` to `18.2.0`, which is 100% compatible with `react-router-dom@^6.28.0`.
5. **Chakra UI v3 Link Component Collision:** Chakra UI v3 exports its own `<Link>` component that renders a stylized anchor, creating a potential name conflict with React Router's `<Link>`.

---

## 2. Monorepo Applications Catalog & Audit

The monorepo contains four Vite 5 applications under `apps/` and five shared packages under `packages/`.

### 2.1. Application Topology Matrix

| Application | Port | Title / Purpose | Core Dependencies | Entry Files | Current Routing State |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`apps/Admin`** | `3001` | Operations Console, Plan Builder, Order Queue & Memory Studios | `@chakra-ui/react: ^3.32.0`, `@emotion/react: ^11.14.0`, `@repo/react-appwrite: *`, `appwrite: ^17.0.2`, `react: 18.2.0` | `src/main.tsx`, `src/App.tsx`, `index.html` | In-memory `activeTab` useState ("overview", "plans", "orders", "booth-studio", "invitation-studio") |
| **`apps/Booth`** | `3002` | Audio Guestbook Landing & Private Memory Heirloom Page | `@chakra-ui/react: ^3.32.0`, `@emotion/react: ^11.14.0`, `@repo/react-appwrite: *`, `@repo/ui-components: *`, `react-icons: ^5.5.0` | `src/main.tsx`, `src/App.tsx`, `src/pages/BoothMemoryPage.tsx`, `index.html` | Pseudo-router with `getMemorySlugFromUrl`, `pushState`, `popstate`, query params `?memory=` |
| **`apps/Invitation`** | `3003` | Bespoke Event Websites & Digital QR VIP Passes | `@chakra-ui/react: ^3.32.0`, `@emotion/react: ^11.14.0`, `@repo/react-appwrite: *`, `appwrite: ^17.0.2`, `react: 18.2.0` | `src/main.tsx`, `src/App.tsx`, `src/pages/CustomEventPage.tsx`, `src/pages/GuestPassPage.tsx`, `index.html` | In-memory `view.mode` ("landing", "event", "pass"), `replaceState`, query params `?event=`, `?pass=` |
| **`apps/Main`** | `3000` | Ecosystem Gateway & Unified Client Account Portal | `@chakra-ui/react: ^3.32.0`, `@emotion/react: ^11.14.0`, `@repo/react-appwrite: *`, `appwrite: ^17.0.2`, `react: 18.2.0` | `src/main.tsx`, `src/App.tsx`, `src/components/account/ClientAccountShell.tsx`, `index.html` | In-memory `view` ("gateway", "account") and `accountTab` ("orders", "assets", "audio", "qr_hub", "mailbox") |

### 2.2. Common Tooling Configuration Across All Apps

- **Vite Configuration (`vite.config.ts`):**  
  All four apps share identical Vite configs with `@vitejs/plugin-react` and `vite-tsconfig-paths({ projects: ["./tsconfig.app.json"] })`.  
  Dev servers bind to `host: "0.0.0.0"` with distinct static ports (`3000`, `3001`, `3002`, `3003`).
- **TypeScript Configuration (`tsconfig.app.json`):**  
  All four apps use:
  - `"target": "ESNext"`
  - `"module": "ESNext"`
  - `"moduleResolution": "Bundler"`
  - `"jsx": "react-jsx"`
  - `"verbatimModuleSyntax": true`
  - `"allowImportingTsExtensions": true`
  - `"paths": { "@/*": ["./src/*"] }`
- **HTML Entry Points (`index.html`):**  
  All four apps correctly reference scripts using absolute paths (`/src/main.tsx`), preventing 404 asset failures on deeply nested paths like `/orders/:id` or `/memory/:slug`.

---

## 3. Deep Dive into Current Navigation & Routing Deficits

### 3.1. `apps/Admin` (Port 3001)

#### Current Implementation:
```tsx
// apps/Admin/src/App.tsx (lines 218-282)
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleOpenStudio = (orderId: string, serviceType: "booth" | "invitation") => {
    setSelectedOrderId(orderId);
    if (serviceType === "booth") {
      setActiveTab("booth-studio");
    } else {
      setActiveTab("invitation-studio");
    }
  };

  return (
    <AdminShell activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)}>
      {activeTab === "overview" && <AdminOverview ... />}
      {activeTab === "plans" && <PlanBuilderStudio ... />}
      {activeTab === "orders" && <OrdersQueueManager ... />}
      {activeTab === "booth-studio" && <BoothMemoryStudio orderId={selectedOrderId} ... />}
      {activeTab === "invitation-studio" && <InvitationStudio orderId={selectedOrderId} ... />}
    </AdminShell>
  );
};
```

#### Deficits & Breaking Failure Modes:
1. **Lack of Deep Linking:** Visiting `http://localhost:3001/orders` or `http://localhost:3001/plans` returns the default Overview tab if the page refreshes.
2. **Loss of Studio Context:** Editing order `ORD-8821` in `BoothMemoryStudio` loses all context on browser reload because `selectedOrderId` is stored only in React memory.
3. **Broken Browser History:** The browser's Back and Forward buttons do not work between Admin views; pressing Back navigates away from the Admin app entirely.

---

### 3.2. `apps/Booth` (Port 3002)

#### Current Implementation:
```tsx
// apps/Booth/src/App.tsx (lines 23-63)
const getMemorySlugFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/memory/")) {
    const slug = path.replace("/memory/", "").split("/")[0].trim();
    if (slug) return slug;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const memoryParam = searchParams.get("memory");
  if (memoryParam && memoryParam.trim()) return memoryParam.trim();
  return null;
};

export const App: React.FC = () => {
  const [currentMemorySlug, setCurrentMemorySlug] = useState<string | null>(getMemorySlugFromUrl);

  const handleNavigateToMemory = (slug: string) => {
    const newUrl = `${window.location.pathname}?memory=${slug}`;
    window.history.pushState({}, "", newUrl);
    setCurrentMemorySlug(slug);
  };
  ...
```

#### Deficits & Breaking Failure Modes:
1. **Mixed State Paradigm:** Combines manual `window.history.pushState` with query parameters (`?memory=...`) and path checking (`/memory/...`).
2. **Incomplete Subdomain Support:** No native extraction of subdomains from `window.location.hostname`.
3. **Tab History within Memory:** The 5 memory tabs (`Audio Messages`, `Photos`, `Video Highlights`, `Guest Book`, `Thank You`) are purely local component state and cannot be linked directly (e.g. sharing a link directly to photos).

---

### 3.3. `apps/Invitation` (Port 3003)

#### Current Implementation:
```tsx
// apps/Invitation/src/App.tsx (lines 14-65)
export const App: React.FC = () => {
  const [view, setView] = useState<AppViewState>(parseInitialRoute);

  useEffect(() => {
    let newUrl = window.location.pathname;
    if (view.mode === "event") {
      newUrl = `?event=${encodeURIComponent(view.slug)}`;
    } else if (view.mode === "pass") {
      newUrl = `?pass=${encodeURIComponent(view.rsvpId)}`;
    }
    window.history.replaceState(null, "", newUrl);
  }, [view]);
```

#### Deficits & Breaking Failure Modes:
1. **Url Replacement Rather than Navigation:** `window.history.replaceState` overwrites the URL history instead of creating real navigation entries, breaking browser back/forward buttons.
2. **Query String Dependency:** Uses `?event=` and `?pass=` rather than clean RESTful paths (`/e/:slug`, `/pass/:rsvpId`).
3. **Scanner Flow Not Routed:** The Venue QR Scanner component (`VenueQrScanner.tsx`) exists in `src/components/pass/` but is not accessible via any route.

---

### 3.4. `apps/Main` (Port 3000)

#### Current Implementation:
```tsx
// apps/Main/src/App.tsx (lines 9-29)
export const App: React.FC = () => {
  const [view, setView] = useState<ActiveView>("gateway");
  const [accountTab, setAccountTab] = useState<string>("orders");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "account") setView("account");
    if (params.get("tab")) setAccountTab(params.get("tab")!);
  }, []);
```

#### Deficits & Breaking Failure Modes:
1. **Unfriendly URLs:** Navigating to the client RSVP mailbox requires `http://localhost:3000/?view=account&tab=mailbox`.
2. **No Deep Linking for Orders:** A client returning to check order `ORD-902` cannot be deep-linked directly to `/account/orders/ORD-902`.
3. **No Auth Route Protection:** Account pages are rendered conditionally without route-level guard wrappers.

---

### 3.5. Cross-App Navigation & QR Link Audit

Investigation revealed multiple hardcoded localhost URLs across the codebase that will break in production without a dynamic URL/subdomain resolution helper:

| File Location | Line | Current Hardcoded URL | Target Production Pattern |
| :--- | :---: | :--- | :--- |
| `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx` | 43 | `http://localhost:3002?memory=${memory.slug}` | Subdomain `https://${slug}.asar.audio` or `/memory/${slug}` |
| `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` | 301, 343 | `http://localhost:3003?event=${slug}` | Subdomain `https://${slug}.asar.audio` or `/e/${slug}` |
| `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` | 112 | `http://localhost:3003?pass=${rsvp.$id}&token=${passToken}` | `https://invitation.asar.audio/pass/${rsvp.$id}?token=${passToken}` |
| `apps/Main/src/components/account/QrHubManager.tsx` | 29-30 | `http://localhost:3002?memory=${slug}` & `:3003?event=${slug}` | Dynamic subdomain or canonical route |
| `apps/Booth/src/components/sections/BookingModal.tsx` | 418 | `http://localhost:3000?orderId=${submittedOrderId}` | `https://asar.audio/account/orders/${orderId}` |
| `apps/Invitation/src/components/landing/InvitationBookingModal.tsx`| 958 | `http://localhost:3000/account` | `https://asar.audio/account` |

---

## 4. Full Target Routing Design (React Router v6)

### 4.1. `apps/Admin` Routing Blueprint

#### Provider Hierarchy:
```
<React.StrictMode>
  <ChakraProvider value={defaultSystem}>
    <AppwriteProvider endpoint={...} project={...} databaseId={...}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminShell />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="plans" element={<PlanBuilderStudio />} />
            <Route path="orders" element={<OrdersQueueManager />} />
            <Route path="orders/:orderId" element={<OrdersQueueManager />} />
            <Route path="booth-studio" element={<BoothMemoryStudio />} />
            <Route path="booth-studio/:orderId" element={<BoothMemoryStudio />} />
            <Route path="invitation-studio" element={<InvitationStudio />} />
            <Route path="invitation-studio/:orderId" element={<InvitationStudio />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppwriteProvider>
  </ChakraProvider>
</React.StrictMode>
```

#### Route Table:
| Path | Component | Purpose | URL Parameters / Context |
| :--- | :--- | :--- | :--- |
| `/` | Redirect | Redirects to `/overview` | — |
| `/overview` | `AdminOverview` | Operational KPIs, revenue stats, recent orders | — |
| `/plans` | `PlanBuilderStudio` | Booth & Invitation dynamic plans, feature toggles, limits | — |
| `/orders` | `OrdersQueueManager` | Filterable queue of all client orders across 7 stages | Query: `?status=`, `?service=` |
| `/orders/:orderId` | `OrdersQueueManager` | Direct modal/view for verifying payment of specific order | `orderId` |
| `/booth-studio` | `BoothMemoryStudio` | Standalone Booth studio editor | — |
| `/booth-studio/:orderId` | `BoothMemoryStudio` | Edit and bulk-upload voice recordings for a specific order | `orderId` via `useParams()` |
| `/invitation-studio` | `InvitationStudio` | Standalone Invitation visual builder | — |
| `/invitation-studio/:orderId`| `InvitationStudio` | Edit sections, themes & RSVP form for a specific order | `orderId` via `useParams()` |
| `*` | `AdminNotFound` | 404 screen styled with Asar luxury typography | — |

#### Layout Conversion:
- In `AdminShell.tsx`:
  - Replace tab `<button>` elements with `<NavLink to="/plans">`.
  - Use `style={({ isActive }) => ({ ... })}` or `className` to maintain existing active tab pill aesthetics (`bg="var(--athar-maroon)"`, white text, shadow).
  - Replace `{children}` with `<Outlet />`.

---

### 4.2. `apps/Booth` Routing Blueprint

#### Provider Hierarchy:
```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<BoothLandingPage />} />
    <Route path="/book" element={<BoothLandingPage openBooking={true} />} />
    <Route path="/memory/:slug" element={<BoothMemoryPage />} />
    <Route path="/m/:slug" element={<BoothMemoryPageRedirect />} />
    <Route path="*" element={<BoothNotFound />} />
  </Routes>
</BrowserRouter>
```

#### Route Table:
| Path | Component | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| `/` | `BoothLandingPage` | 14-section Arabic RTL luxury marketing page | Includes Hero, Packages, RealVoices, FAQ, Booking Modal |
| `/book` | `BoothLandingPage` | Direct landing with booking modal auto-opened | Supports `?package=Athar+Moment` |
| `/memory/:slug` | `BoothMemoryPage` | **Image #1** Private Memory Heirloom Page | Extracts `slug` via `useParams<{ slug: string }>()` |
| `/m/:slug` | Redirect | Shortened QR link alias | Redirects cleanly to `/memory/:slug` |
| `*` | `BoothNotFound` | Luxury 404 page | Link back to `/` |

#### Subdomain-Driven Automatic Routing:
When accessed via a custom subdomain (e.g., `mina-maryam.booth.asar.audio` or `mina-maryam.localhost:3002`):
A top-level `<SubdomainGate>` component checks `extractSubdomain()`. If a subdomain exists and is not a reserved name (`www`, `app`), it automatically renders `<BoothMemoryPage slug={subdomain} />` at the root!

---

### 4.3. `apps/Invitation` Routing Blueprint

#### Provider Hierarchy:
```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<InvitationLandingPage />} />
    <Route path="/book" element={<InvitationLandingPage openBooking={true} />} />
    <Route path="/e/:slug" element={<CustomEventPage />} />
    <Route path="/invitation/:slug" element={<CustomEventPage />} />
    <Route path="/pass/:rsvpId" element={<GuestPassPage />} />
    <Route path="/scanner/:invitationId" element={<VenueQrScannerPage />} />
    <Route path="*" element={<InvitationNotFound />} />
  </Routes>
</BrowserRouter>
```

#### Route Table:
| Path | Component | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| `/` | `InvitationLandingPage` | Invitation service showcase & booking engine | Occasions gallery, features showcase, dynamic packages |
| `/book` | `InvitationLandingPage` | Direct landing with booking modal auto-opened | Supports `?package=` |
| `/e/:slug` | `CustomEventPage` | Bespoke generated event website | Dynamic block stack + locked email RSVP form |
| `/invitation/:slug` | `CustomEventPage` | Semantic alias for `/e/:slug` | — |
| `/pass/:rsvpId` | `GuestPassPage` | Guest digital QR Pass for approved attendees | Reads `rsvpId` & validates `?token=` query param |
| `/scanner/:invitationId`| `VenueQrScannerPage` | Venue door host check-in scanner | Real-time attendee check-in via camera / manual search |
| `*` | `InvitationNotFound` | Luxury 404 page | — |

---

### 4.4. `apps/Main` (Client Portal) Routing Blueprint

#### Provider Hierarchy:
```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<EcosystemHome />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/account" element={<ClientAccountShell />}>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="orders" element={<OrderTrackerTimeline />} />
      <Route path="orders/:orderId" element={<OrderTrackerTimeline />} />
      <Route path="assets" element={<RawAssetsManager />} />
      <Route path="assets/:orderId" element={<RawAssetsManager />} />
      <Route path="audio" element={<AudioReviewPlayer />} />
      <Route path="audio/:orderId" element={<AudioReviewPlayer />} />
      <Route path="qr-hub" element={<QrHubManager />} />
      <Route path="qr-hub/:orderId" element={<QrHubManager />} />
      <Route path="mailbox" element={<ClientRsvpMailbox />} />
      <Route path="mailbox/:invitationId" element={<ClientRsvpMailbox />} />
    </Route>
    <Route path="*" element={<MainNotFound />} />
  </Routes>
</BrowserRouter>
```

#### Route Table:
| Path | Component | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| `/` | `EcosystemHome` | Master Brand Gateway & Service Showcase | Links to Booth, Invitation, Admin & Account |
| `/auth` | `AuthPage` | Unified Customer Login / Registration | Modal or dedicated route |
| `/account` | Redirect | Redirects to `/account/orders` | — |
| `/account/orders` | `OrderTrackerTimeline` | 7-Stage visual status tracker for latest active order | Tab 1 |
| `/account/orders/:orderId` | `OrderTrackerTimeline` | Status tracker for specific order ID | Deep-linkable |
| `/account/assets` | `RawAssetsManager` | Memory asset upload form (hero photo, quote, categories) | Tab 2 |
| `/account/assets/:orderId` | `RawAssetsManager` | Asset upload for specific order | — |
| `/account/audio` | `AudioReviewPlayer` | Client listens and reviews mastered recordings | Tab 3 |
| `/account/qr-hub` | `QrHubManager` | High-res printable QR cards and table signage kit | Tab 4 |
| `/account/mailbox` | `ClientRsvpMailbox` | Real-time RSVP inbox with capacity tracker & EmailJS | Tab 5 |
| `/account/mailbox/:invitationId` | `ClientRsvpMailbox` | RSVP mailbox for specific invitation | — |
| `*` | `MainNotFound` | Luxury 404 page | — |

---

## 5. Subdomain-Driven Dynamic Memory Renderer Architecture (Requirement R2)

### 5.1. Architectural Model Evaluation

Requirement R2 mandates:
> *"Implement dynamic memory rendering for Invitation memories and Booth memories based on subdomain detection (fetching and resolving the subdomain to determine what to render, similar to a web builder or Shopify storefront model). The team decides the best app structure (whether to introduce a new dedicated renderer app under `apps/` or adapt existing apps) and the subdomain resolution strategy for production and local environments."*

We evaluated two architectural strategies:

```
Strategy A: Dedicated Storefront App (apps/Renderer or apps/Storefront)
┌────────────────────────────────────────────────────────┐
│ Wildcard Subdomain DNS: *.asar.audio                   │
│ e.g. mina-maryam.asar.audio, omar-layla.asar.audio     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │ apps/Renderer (Port 3004) │
              └─────────────┬─────────────┘
                            │ Resolves slug in Appwrite
             ┌──────────────┴──────────────┐
             ▼                             ▼
    Found in booth_memories?      Found in invitations?
             │                             │
             ▼                             ▼
     Render Booth Memory          Render Custom Event
   (Audio messages, waveforms,    (Sections block stack,
      photos, video, PIN)           countdown, RSVP form)
```

```
Strategy B: Embedded Subdomain Resolvers in apps/Booth & apps/Invitation
┌─────────────────────────────────┐   ┌─────────────────────────────────────┐
│ *.booth.asar.audio (Port 3002)   │   │ *.invitation.asar.audio (Port 3003) │
│ e.g. mina-maryam.booth.asar.audio│   │ e.g. omar-layla.invitation.asar.audio│
└────────────────┬────────────────┘   └──────────────────┬──────────────────┘
                 │                                       │
                 ▼                                       ▼
       apps/Booth App Resolver                apps/Invitation App Resolver
```

### 5.2. Strategy Comparison Matrix

| Evaluation Dimension | Strategy A: Dedicated Renderer (`apps/Renderer`) | Strategy B: Embedded Resolvers (`apps/Booth` & `Invitation`) |
| :--- | :--- | :--- |
| **Storefront Domain Luxury** | **Superior:** Direct first-level subdomain (`mina-and-maryam.asar.audio`). Matches Shopify / Squarespace model. | Requires two prefixes (`mina-maryam.booth.asar.audio`) or dual DNS routing. |
| **Separation of Concerns** | **Clean:** Marketing landing pages are isolated from dynamic client memory rendering. | Marketing code and memory rendering live in the same bundle. |
| **Code Reusability** | Memory components (`BoothMemoryPage`, `CustomEventPage`) are shared or imported from packages. | Already co-located in existing apps. |
| **Maintenance & Build Overhead** | Adds a 5th app to Turborepo. | Zero new apps; preserves the 4 existing apps. |
| **Deployment Simplicity** | 1 wildcard CNAME for all memories. | Requires 2 wildcard DNS records. |

### 5.3. Recommended Hybrid Implementation Plan:
1. **Immediate Phase (Zero Monorepo Disruption):**
   Implement the **Universal Subdomain Resolution Engine** inside `@repo/react-appwrite` (or a lightweight utility) and integrate it directly into `apps/Booth` and `apps/Invitation`.
   - In `apps/Booth`: Hostname with subdomain resolves directly to `BoothMemoryPage` using the detected slug.
   - In `apps/Invitation`: Hostname with subdomain resolves directly to `CustomEventPage` using the detected slug.
2. **Next Step / Dedicated Storefront:**
   If the team introduces `apps/Renderer`, the resolution engine is already written and can be imported directly.

### 5.4. Universal Subdomain Resolution Engine Specification

```typescript
// Proposed Location: packages/react-appwrite/src/AsarDomain/subdomainResolver.ts

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "app",
  "main",
  "booth",
  "invitation",
  "api",
  "auth",
  "mail",
  "mailbox",
  "static",
  "cdn",
  "dev",
  "stage",
  "staging",
  "test",
  "localhost",
]);

/**
 * Extracts dynamic client memory slug from hostname or query override.
 * Fully supports RFC 6761 *.localhost in modern browsers without /etc/hosts edits!
 */
export function extractSubdomain(
  hostname: string = typeof window !== "undefined" ? window.location.hostname : "",
  search: string = typeof window !== "undefined" ? window.location.search : ""
): string | null {
  if (!hostname) return null;

  // 1. Query parameter override (ideal for local dev testing, e.g. ?subdomain=mina-and-maryam)
  const params = new URLSearchParams(search);
  const override = params.get("subdomain") || params.get("slug") || params.get("preview_subdomain");
  if (override && override.trim()) {
    return override.trim().toLowerCase();
  }

  // 2. RFC 6761 Localhost loopback (e.g. mina-and-maryam.localhost:3002)
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(/\.localhost$/, "").split(".");
    const sub = parts[parts.length - 1].toLowerCase();
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
  }

  // 3. IP address or plain localhost (no subdomain)
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return null;
  }

  // 4. Standard production or staging domains (e.g. mina-and-maryam.asar.audio)
  const segments = hostname.split(".");
  if (segments.length >= 3) {
    const candidate = segments[0].toLowerCase();
    if (!RESERVED_SUBDOMAINS.has(candidate)) {
      return candidate;
    }
  }

  return null;
}
```

### 5.5. Local Development Testing Protocol (Zero `/etc/hosts` Editing)

Modern web browsers (Chrome, Firefox, Edge, Safari) resolve `*.localhost` to `127.0.0.1` by standard specification (RFC 6761). Developers and testers can verify subdomains locally in three ways:
1. **Direct Subdomain:** `http://mina-and-maryam.localhost:3002`
2. **Query String Emulation:** `http://localhost:3002/?subdomain=mina-and-maryam`
3. **Canonical REST Route:** `http://localhost:3002/memory/mina-and-maryam`

---

## 6. Admin Memory Template & Management Alignment (Requirement R3)

### 6.1. How Admin Flows Interact with Dynamic Renderers

Admin controls all memory creation, customization, and publishing:
1. **Plan & Quota Management (`/plans`):**  
   Admin creates or updates Booth Plans (setting `maxVoiceRecords`, `hasVideoHighlight`, `allowBulkZipDownload`) or Invitation Plans (setting `maxRsvpCapacity`, `allowCustomSections`).  
   Dynamic renderers read these plan limits directly from the Appwrite memory document.
2. **Orders & Payment Verification (`/orders`):**  
   When a payment receipt is approved, clicking **"Open Studio"** executes:
   ```ts
   navigate(`/booth-studio/${order.$id}`); // or `/invitation-studio/${order.$id}`
   ```
3. **Booth Memory Studio (`/booth-studio/:orderId`):**  
   - Admin pulls client assets (couple names, date, quote, categories) with one click.
   - Admin bulk-uploads voice recordings and configures the `slug` (e.g., `mina-and-maryam`).
   - The Studio generates the Table QR Card and links.  
   - **Alignment Change:** The generated link must be updated from `http://localhost:3002?memory=${slug}` to the canonical URL:
     ```ts
     const memoryUrl = getPublicMemoryUrl("booth", memory.slug);
     // Production: https://mina-and-maryam.asar.audio (or https://booth.asar.audio/memory/mina-and-maryam)
     // Local Dev: http://localhost:3002/memory/mina-and-maryam
     ```
4. **Invitation Studio (`/invitation-studio/:orderId`):**  
   - Admin configures the theme, dynamic section blocks, and the locked-email RSVP form.
   - **Alignment Change:** When publishing, the generated QR Code and URL must point to:
     ```ts
     const invitationUrl = getPublicMemoryUrl("invitation", slug);
     // Production: https://omar-and-layla.asar.audio (or https://invitation.asar.audio/e/omar-and-layla)
     // Local Dev: http://localhost:3003/e/omar-and-layla
     ```

---

## 7. Package Requirements & Monorepo Alignment

### 7.1. Recommended Package Version
- **Package:** `react-router-dom: ^6.28.0` (or `^6.28.2`)
- **Reasoning:**
  - React version in root `package.json` has `overrides`:
    ```json
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
    ```
  - `react-router-dom` v6 is the industry-standard, battle-tested version for React 18 and Vite 5 SPAs.
  - Types are built directly into `react-router-dom` (no need for separate `@types/react-router-dom`).
  - Zero peer dependency warnings or build friction.

### 7.2. Workspaces to Update
Add `"react-router-dom": "^6.28.0"` to:
1. `apps/Admin/package.json`
2. `apps/Booth/package.json`
3. `apps/Invitation/package.json`
4. `apps/Main/package.json`

### 7.3. Vite Dev Server & Production SPA Rewrites Configuration

#### Development Mode:
In `vite.config.ts`, Vite's development server automatically provides HTML5 history fallback for all requests with `Accept: text/html` that do not match a static file. To guarantee that paths containing dots (e.g. `/memory/mina.maryam`) don't fail as asset lookups, ensure `appType: "spa"` is explicitly set or left as Vite's default.

#### Production Mode:
Static web servers must rewrite all non-file requests to `index.html`:
- **Nginx:**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Vercel (`vercel.json`):**
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Netlify (`_redirects`):**
  ```
  /*    /index.html   200
  ```

---

## 8. Component Conversion Strategy & Code Recipes

### 8.1. Converting Tab Navigation to `<NavLink>`

#### In `apps/Admin/src/components/layout/AdminShell.tsx`:
```tsx
// Before (in-memory button click):
<button onClick={() => onSelectTab(tab.id)}>
  {tab.icon} {tab.label}
</button>

// After (React Router NavLink):
import { NavLink } from "react-router-dom";

<NavLink
  to={`/${tab.id}`}
  style={({ isActive }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.55rem 1.15rem",
    borderRadius: "9999px",
    fontSize: "0.88rem",
    fontWeight: 700,
    border: isActive ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.1)",
    backgroundColor: isActive ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.85)",
    color: isActive ? "#ffffff" : "var(--athar-text-title)",
    boxShadow: isActive ? "0 4px 14px rgba(107, 29, 40, 0.22)" : "none",
    textDecoration: "none",
  })}
>
  <span>{tab.icon}</span>
  <span>{tab.label}</span>
</NavLink>
```

### 8.2. Converting Action Handlers to `useNavigate`

#### In `apps/Admin/src/components/orders/OrdersQueueManager.tsx`:
```tsx
// Before:
onOpenStudio(order.$id, order.serviceType);

// After:
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate(`/${order.serviceType}-studio/${order.$id}`);
```

### 8.3. Reading Route Parameters via `useParams`

#### In `apps/Booth/src/pages/BoothMemoryPage.tsx`:
```tsx
// Before:
export const BoothMemoryPage: React.FC<{ slug?: string; onBackToLanding?: () => void }> = ({
  slug: propSlug = "mina-and-maryam",
  onBackToLanding,
}) => { ... };

// After:
import { useParams, useNavigate } from "react-router-dom";

export const BoothMemoryPage: React.FC = () => {
  const { slug = "mina-and-maryam" } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const handleBack = () => navigate("/");
  ...
};
```

### 8.4. Cross-App URL Helper

To replace hardcoded `localhost:300X` references:
```typescript
// Shared cross-app link generator
export function getAppUrl(
  app: "main" | "admin" | "booth" | "invitation",
  path: string = ""
): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const envMap: Record<string, string | undefined> = {
    main: import.meta.env.VITE_MAIN_APP_URL,
    admin: import.meta.env.VITE_ADMIN_APP_URL,
    booth: import.meta.env.VITE_BOOTH_APP_URL,
    invitation: import.meta.env.VITE_INVITATION_APP_URL,
  };
  const fallbackMap: Record<string, string> = {
    main: "http://localhost:3000",
    admin: "http://localhost:3001",
    booth: "http://localhost:3002",
    invitation: "http://localhost:3003",
  };

  const base = envMap[app] || fallbackMap[app];
  return `${base.replace(/\/$/, "")}${cleanPath}`;
}
```

---

## 9. Breaking Changes, Type Conflicts & Risk Mitigation

### 9.1. Chakra UI v3 Link Component Collision ⚠️
- **The Issue:** `@chakra-ui/react` v3 exports `<Link>`. If a file imports `{ Link }` from both `@chakra-ui/react` and `react-router-dom`, TypeScript errors with `Duplicate identifier 'Link'`.
- **Mitigation:**
  - Standardize on aliasing React Router's Link:
    ```tsx
    import { Link as RouterLink, NavLink as RouterNavLink } from "react-router-dom";
    ```
  - In Chakra UI v3, use the `asChild` composition pattern:
    ```tsx
    import { Link as ChakraLink } from "@chakra-ui/react";
    import { Link as RouterLink } from "react-router-dom";

    <ChakraLink asChild>
      <RouterLink to="/orders">View Orders</RouterLink>
    </ChakraLink>
    ```

### 9.2. TypeScript `verbatimModuleSyntax` & `Bundler` Resolution
- **The Issue:** All apps use `"verbatimModuleSyntax": true` in `tsconfig.app.json`. Type-only imports from `react-router-dom` (such as `NavigateFunction`, `Location`, `RouteObject`) must use explicit `import type`:
  ```tsx
  import type { NavigateFunction } from "react-router-dom";
  ```

### 9.3. Node.js Native Test Runner (`node --test`) Compatibility
- **The Issue:** Testing in this monorepo uses Node v24's native `node --experimental-strip-types --test`.  
  As discovered during investigation, Node's type stripper does NOT parse JSX/TSX syntax (`.tsx` files throw `ERR_UNKNOWN_FILE_EXTENSION`).
- **Mitigation:**
  - Pure domain functions, parsers, and routing helpers must reside in pure `.ts` files (e.g. `subdomainResolver.ts`, `routeContracts.ts`).
  - Unit tests for routing and subdomain resolution should target `.ts` modules directly to execute in sub-millisecond time with zero build steps.

---

## 10. Step-by-Step Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Dependency Installation & Universal Subdomain Helper          │
│ • npm install react-router-dom@^6.28.0 in all 4 apps                   │
│ • Add subdomainResolver.ts & crossAppUrl.ts in @repo/react-appwrite    │
│ • Add unit tests for subdomain extraction & route matching            │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Client Portal & Gateway Integration (apps/Main)               │
│ • Wrap main.tsx with <BrowserRouter>                                   │
│ • Convert EcosystemHome buttons & ClientAccountShell tabs to NavLinks  │
│ • Implement nested routes: /account/orders, /account/mailbox, etc.     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Operations Console Integration (apps/Admin)                   │
│ • Wrap main.tsx with <BrowserRouter>                                   │
│ • Refactor AdminShell.tsx with <Outlet /> and <NavLink> tabs          │
│ • Wire /orders/:orderId, /booth-studio/:orderId, /invitation-studio/:id│
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Audio Guestbook & Memory Presentation (apps/Booth)            │
│ • Replace pseudo-router in App.tsx with <Routes>                       │
│ • Connect /memory/:slug and /m/:slug routes                            │
│ • Integrate SubdomainGate for *.booth.asar.audio / *.localhost         │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Event Websites & QR Passes (apps/Invitation)                  │
│ • Replace parseInitialRoute in App.tsx with <Routes>                   │
│ • Connect /e/:slug, /pass/:rsvpId, and /scanner/:invitationId          │
│ • Integrate SubdomainGate for *.invitation.asar.audio / *.localhost   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Admin Studios QR & Link Generator Alignment                   │
│ • Update MediaAndTabsEditor.tsx and InvitationStudio.tsx QR urls       │
│ • Verify zero tsc compilation errors (`tsc -b`) across all apps        │
│ • Update docs/ASAR_PROJECT_ARCHITECTURE.md with new routing topologies │
└────────────────────────────────────────────────────────────────────────┘
```
