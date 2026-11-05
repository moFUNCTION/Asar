# Admin Alignment & Architecture Explorer Analysis Report

- **Explorer:** Teamwork Explorer Survey 3 (Admin Alignment & Architecture Explorer)
- **Target Systems:** `apps/Admin`, `docs/ASAR_PROJECT_ARCHITECTURE.md`, Monorepo App Ecosystem
- **Date:** 2026-11-03
- **Status:** Complete

---

## 1. Executive Summary

This investigation examines the current implementation of **Admin memory template management**, **Booth memories management**, **Invitation memories management**, and their alignment with the **dynamic subdomain-driven memory renderer architecture** and **monorepo-wide React Router integration**.

### Core Findings
1. **Current State of Admin Routing & URLs:**
   - `apps/Admin` currently uses component state (`activeTab: "overview" | "plans" | "orders" | "booth-studio" | "invitation-studio"`) in `App.tsx` and has **zero** React Router dependencies (`react-router-dom` is absent from all `apps/*/package.json`).
   - Links in Admin are hardcoded to port-based URLs (`http://localhost:3000`, `http://localhost:3002?memory=${memory.slug}`, `http://localhost:3003?event=${slug}`).
2. **Current Memory Template & Memory Management:**
   - **Plans / Templates (`PlanBuilderStudio.tsx`):** Manages `AsarPlan` entities defining pricing, tiers, features, and system quotas (`limitsJson`: max voices, max photos, video highlight flag, hosting days, max RSVP capacity).
   - **Booth Memories (`BoothMemoryStudio.tsx`):** Manages `BoothMemory` (slug, title, tagline, date, venue, quotes, hero photo, 5-tab contents, PIN lock, audio waveforms via bulk uploader). Real-time mirrored in a sticky iPhone 15 Pro mock.
   - **Invitation Memories (`InvitationStudio.tsx`):** Manages `AsarInvitationDocument` (slug, title, occasion, theme config, composable section blocks, and dynamic form schema with mandatory locked email). Real-time mirrored in a live viewport.
   - **Order Pipeline (`OrdersQueueManager.tsx`):** Coordinates a 7-stage concierge fulfillment lifecycle (`pending_payment` through `published`) and payment screenshot verification (`PaymentReceiptInspector.tsx`).
3. **Subdomain Alignment Needs:**
   - Both `BoothMemory` and `AsarInvitationDocument` already use a `slug` field.
   - To support the dynamic subdomain architecture (`https://[subdomain].asar.me`), Admin must enforce **DNS-compliant slug validation** (RFC 1123: `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`), prevent collision with **reserved subdomains** (`admin`, `api`, `booth`, `invitation`, `main`, `app`, `www`), and generate environment-aware preview/public URLs for both production (`https://${slug}.asar.me`) and local development (`http://${slug}.localhost:PORT` or `http://localhost:PORT?subdomain=${slug}`).
4. **Architecture Documentation Gaps:**
   - `docs/ASAR_PROJECT_ARCHITECTURE.md` currently models memory pages exclusively as path-based routes (`/memory/:slug` in Booth and `/e/:slug` in Invitation) and portrays app navigation as static path/port links without React Router.
   - A systematic documentation update is required to document the storefront-style dynamic subdomain renderer, DNS/local resolution, React Router integration across all apps, and Admin alignment.

---

## 2. Admin Memory Template & Management Flow Analysis (`apps/Admin`)

### 2.1. Memory Templates Management (`PlanBuilderStudio.tsx`)
- **File Location:** `apps/Admin/src/components/plans/PlanBuilderStudio.tsx` (1,299 lines).
- **Domain Entity:** `AsarPlan`
  ```typescript
  export interface AsarPlan {
    $id: string;
    serviceType: "booth" | "invitation";
    name: string;
    subtitle: string;
    badge: string;
    subBadge?: string;
    price: number;
    currency: string;
    depositRequired?: number;
    themeVariant: "ivory-royal" | "noir-obsidian";
    featuresJson: string; // JSON array of string[]
    addonsJson?: string;   // JSON array of AsarPlanAddon[]
    limitsJson: string;   // JSON object of AsarPlanLimits
    isActive: boolean;
    sortOrder: number;
  }
  ```
- **How Admin Lists, Creates, Edits, and Configures:**
  - **Listing & Filtering:** Tabbed filtering by `All Plans`, `Booth Plans`, or `Invitation Plans`.
  - **CRUD Operations:** Modal dialogs for creating, editing, duplicating, or soft-deleting plans.
  - **Quota Limits Engine (`limitsJson`):**
    - `coverageHours`: hours of event presence.
    - `maxVoiceRecords`: numerical limit or `-1` for unlimited.
    - `maxGalleryPhotos`: numerical limit or `-1` for unlimited.
    - `hasVideoHighlight`: boolean (governs 30-second highlight video tab).
    - `hasGuestBookTab`: boolean.
    - `allowBulkZipDownload`: boolean (gates the "Download All Messages" button).
    - `hostingDurationDays`: cloud retention duration.
    - `maxRsvpCapacity`: invitation guest capacity limit.
  - **State & Sync:** Seeded with `DEFAULT_INITIAL_PLANS`, persisted to `localStorage` (`asar_synced_plans`), and synchronized with Appwrite collection `plans` when live.
  - **Impact on Subdomain Renderer:** Plans control quotas and feature flags, but do not dictate URLs or subdomains. Plan management remains **100% backward-compatible and intact**.

---

### 2.2. Booth Memories Management (`BoothMemoryStudio.tsx`)
- **File Location:** `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx` (615 lines) and subcomponents:
  - `HeroAndTextsEditor.tsx` (510 lines): Core metadata, slug, quote, dates, hero photo upload, category pills, PIN lock.
  - `BulkVoiceUploader.tsx`: Drag & drop audio uploader with real-time waveform generation.
  - `VoiceBatchGridEditor.tsx`: Inline spreadsheet batch editor for speaker names, roles, quotes.
  - `MediaAndTabsEditor.tsx` (533 lines): Photo gallery, 30s video highlight reel, guestbook notes, QR card kit.
  - `LiveMemoryMobilePreview.tsx` (727 lines): Sticky interactive iPhone 15 Pro bezel preview.
- **Domain Entity:** `BoothMemory`
  ```typescript
  export interface BoothMemory {
    id?: string;
    orderId?: string;
    clientId?: string;
    slug: string; // Current URL identifier
    eventHeaderTag: string;
    coupleTitle: string;
    tagline: string;
    eventDateDisplay: string;
    eventLocationDisplay: string;
    highlightBadge: string;
    coupleQuote: string;
    heroImageUrl?: string;
    videoHighlightTitle?: string;
    videoHighlightUrl?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    categories: string[];
    isPrivateLocked: boolean;
    accessPinCode?: string;
    qrCodeUrl?: string;
    isPublished: boolean;
  }
  ```
- **How Admin Manages Booth Memories:**
  1. **Order Context:** Selects an active order or receives `orderId` via navigation prop.
  2. **Asset Pulling:** Clicking `"Pull Client Submitted Assets"` populates couple title, quotes, venue, dates, categories, and hero photo from Stage 3 client submissions.
  3. **Studio Tabs:**
     - Tab 1: Hero, Texts, Slug, Categories, and 4-digit PIN lock.
     - Tab 2: Bulk Voice Studio (uploading 50–150+ tracks, `OfflineAudioContext` 48-peak waveform extraction, category mapping).
     - Tab 3: Photos gallery, 30s video reel.
     - Tab 4: Guestbook notes, thank-you card, printable QR code.
  4. **Quota Meter & VIP Override:** Real-time meter tracks voices count against plan quota with a VIP override checkbox.
  5. **Live iPhone Mirroring:** Real-time synchronized preview renders exact audio cards, waveform scrubbers, and photo galleries.
  6. **Save & Publish:** Persists to `localStorage` (`asar_booth_memories_cache`, `asar_booth_voices_cache`, `asar_booth_media_cache`) and alerts the user.

---

### 2.3. Invitation Memories Management (`InvitationStudio.tsx`)
- **File Location:** `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` (904 lines) and subcomponents:
  - `ThemeAndEffectsPanel.tsx`: Luxury color schemes, fonts, and `@repo/ui-components` shaders.
  - `SectionBlocksManager.tsx`: Reorderable, toggleable section blocks (`hero`, `countdown`, `story`, `gallery`, `venue_map`, `rsvp_form`).
  - `DynamicFormSchemaBuilder.tsx`: Visual schema builder for custom RSVP fields.
  - `LiveInvitationPreview.tsx` (984 lines): Real-time responsive preview with functional RSVP form testing.
- **Domain Entity:** `AsarInvitationDocument`
  ```typescript
  export interface AsarInvitationDocument {
    id: string;
    orderId: string;
    clientId: string;
    slug: string;
    eventTitle: string;
    occasionType: "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueAddress: string;
    venueMapUrl: string;
    maxCapacity: number;
    themeConfigJson: string;
    sectionsConfigJson: string;
    formSchemaJson: string;
    qrCodeUrl: string;
    isPublished: boolean;
  }
  ```
- **Key Architectural Features:**
  - **Occasion Flexibility:** Adapts layout and theme presets between weddings, festivals, galas, and corporate events.
  - **Mandatory Email Enforcement:** `guestEmail` is locked and non-deletable (`enforceMandatoryEmailConstraint`) to ensure RSVP approvals/declines can be dispatched via EmailJS.
  - **Live Preview:** Mirrors every theme, block, and form field alteration live.

---

### 2.4. Orders Queue & Fulfillment Pipeline (`OrdersQueueManager.tsx`)
- **File Location:** `apps/Admin/src/components/orders/OrdersQueueManager.tsx` (771 lines) & `AdminOverview.tsx` (560 lines).
- **The 7-Stage Concierge Lifecycle:**
  1. `pending_payment`: Awaiting payment screenshot inspection.
  2. `payment_rejected`: Screenshot rejected with admin notes.
  3. `awaiting_client_assets`: Payment approved; waiting for client to upload hero photo, text, quotes.
  4. `event_scheduled`: On-site booth scheduled; pre-event table QR cards ready.
  5. `audio_mastering`: Sound engineers mastering raw voice recordings.
  6. `studio_curation`: Admin curating tracks and media in Booth/Invitation Studio.
  7. `published`: Memory website live; final landing QR code distributed.
- **Studio Launching:**
  - Clicking `"🎙️ فتح في أستوديو هاتف أثر →"` calls `onOpenStudio(order.$id, "booth")`.
  - Clicking `"✉️ فتح في أستوديو الدعوات →"` calls `onOpenStudio(order.$id, "invitation")`.
  - In `App.tsx`, this sets `selectedOrderId` and activates the corresponding tab.

---

### 2.5. Current URL and Link Generation in Admin (Audit)

A comprehensive code audit reveals the following existing URL generation patterns in Admin:

| File | Line | Current Code Pattern | Intended Target |
| :--- | :--- | :--- | :--- |
| `AdminShell.tsx` | 112 | `href="http://localhost:3000"` | Main Hub (:3000) |
| `AdminShell.tsx` | 132 | `href="http://localhost:3002"` | Booth App (:3002) |
| `AdminShell.tsx` | 153 | `href="http://localhost:3003"` | Invitation App (:3003) |
| `HeroAndTextsEditor.tsx` | 103 | `🌐 /memory/{memory.slug \|\| "slug"}` | URL display badge |
| `HeroAndTextsEditor.tsx` | 116 | `e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")` | Slug input sanitization |
| `HeroAndTextsEditor.tsx` | 120 | `Live link: <code>http://localhost:3002?memory={memory.slug}</code>` | Live link helper text |
| `BoothMemoryStudio.tsx` | 254 | `http://localhost:3002?memory=${memory.slug}` | Save & publish toast notification |
| `MediaAndTabsEditor.tsx` | 43 | `landingUrl = "http://localhost:3002?memory=${memory.slug}"` | Destination for QR code generator |
| `MediaAndTabsEditor.tsx` | 466 | `href={landingUrl}` | "Open Live Memory Page ↗" button |
| `MediaAndTabsEditor.tsx` | 512 | `<code>{landingUrl}</code>` | QR Kit landing URL display |
| `InvitationStudio.tsx` | 184 | `.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)` | Slug generation from event title |
| `InvitationStudio.tsx` | 301 | `qrCodeUrl: "http://localhost:3003?event=${slug}"` | Document QR URL payload |
| `InvitationStudio.tsx` | 334 | `http://localhost:3003?event=${slug}` | Save & publish toast notification |
| `InvitationStudio.tsx` | 343 | `invitationUrl = "http://localhost:3003?event=${slug}"` | Destination for QR generator & copy |
| `InvitationStudio.tsx` | 854 | `<div>{invitationUrl}</div>` | QR Modal displayed link |

**Key Finding:** Every single public link and preview URL in Admin is currently hardcoded to legacy query parameters (`?memory=${slug}` or `?event=${slug}`) on fixed localhost ports (`:3002` and `:3003`).

---

## 3. Dynamic Subdomain Architecture Alignment for Admin

### 3.1. Subdomain vs. Slug: Conceptual Model & Data Mapping
In the dynamic renderer architecture:
- The **Slug** is the canonical database key (stored in `booth_memories.slug` and `invitations.slug`).
- The **Subdomain** is the network host identifier extracted from the request's `Host` header (e.g., `Host: mina-and-maryam.asar.me` -> `subdomain: "mina-and-maryam"`).
- **Core Principle:** In ASAR, **Slug == Subdomain**. There is no need to add a separate `subdomain` column to the database; the existing `slug` column directly serves as the subdomain label.

### 3.2. DNS-Compliant Slug Validator & Reserved Subdomain Guards
Because the slug becomes an active DNS hostname label, it must strictly comply with **RFC 1123** and **RFC 1035**:
1. **Length:** 1 to 63 characters.
2. **Character Set:** Lowercase alphanumeric characters (`a-z`, `0-9`) and single hyphens (`-`).
3. **Boundary Constraints:** Must start and end with an alphanumeric character (no leading or trailing hyphens).
4. **Reserved Subdomains:** Must prevent users from choosing subdomains that collide with internal infrastructure, marketing domains, or reserved web standards:
   ```typescript
   export const RESERVED_SUBDOMAINS = new Set([
     "admin", "api", "app", "auth", "booth", "invitation", "main", "storefront",
     "renderer", "dev", "staging", "test", "preview", "cdn", "assets", "static",
     "mail", "email", "support", "help", "account", "dashboard", "portal", "www"
   ]);
   ```
5. **Slug Validator Specification:**
   ```typescript
   export interface SlugValidationResult {
     isValid: boolean;
     error?: string;
     normalizedSlug: string;
   }

   export function validateSubdomainSlug(rawSlug: string): SlugValidationResult {
     const normalized = rawSlug
       .trim()
       .toLowerCase()
       .replace(/[^a-z0-9-]/g, "-")
       .replace(/-+/g, "-");

     if (!normalized) {
       return { isValid: false, error: "Subdomain cannot be empty", normalizedSlug: "" };
     }
     if (normalized.length < 3) {
       return { isValid: false, error: "Subdomain must be at least 3 characters", normalizedSlug: normalized };
     }
     if (normalized.length > 63) {
       return { isValid: false, error: "Subdomain cannot exceed 63 characters", normalizedSlug: normalized.slice(0, 63) };
     }
     if (normalized.startsWith("-") || normalized.endsWith("-")) {
       return { isValid: false, error: "Subdomain cannot start or end with a hyphen", normalizedSlug: normalized };
     }
     if (RESERVED_SUBDOMAINS.has(normalized)) {
       return { isValid: false, error: `"${normalized}" is a reserved system subdomain`, normalizedSlug: normalized };
     }
     if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(normalized)) {
       return { isValid: false, error: "Subdomain contains invalid characters", normalizedSlug: normalized };
     }

     return { isValid: true, normalizedSlug: normalized };
   }
   ```

---

### 3.3. Public URL Preview & Resolution Strategy (Production vs. Local Development)

Admin requires a unified URL builder that resolves the correct URL based on the runtime environment:

```typescript
export interface MemoryUrlConfig {
  slug: string;
  serviceType: "booth" | "invitation";
}

export function buildMemoryUrls({ slug, serviceType }: MemoryUrlConfig) {
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || "asar.me";
  const isDev = import.meta.env.DEV;
  const rendererPort = import.meta.env.VITE_RENDERER_PORT || (serviceType === "booth" ? "3002" : "3003");

  // Production Canonical URL: https://[slug].asar.me
  const productionUrl = `https://${slug}.${baseDomain}`;

  // Local Development URLs:
  // Option 1 (Local Subdomain): http://[slug].localhost:PORT (Works natively in modern Chrome/Edge)
  const localSubdomainUrl = `http://${slug}.localhost:${rendererPort}`;

  // Option 2 (Universal Query Fallback): http://localhost:PORT?subdomain=[slug]
  const localQueryFallbackUrl = `http://localhost:${rendererPort}?subdomain=${slug}`;

  return {
    canonicalUrl: productionUrl,
    localUrl: isDev ? localSubdomainUrl : productionUrl,
    fallbackUrl: localQueryFallbackUrl,
    // The active URL to open on click and to encode into QR cards
    activeUrl: isDev ? localQueryFallbackUrl : productionUrl,
  };
}
```

#### Application in Admin:
1. **HeroAndTextsEditor (`apps/Admin/.../HeroAndTextsEditor.tsx`):**
   - Display canonical badge: `🌐 https://${memory.slug || "slug"}.asar.me`
   - Real-time DNS slug validation error message displayed below the input.
   - Quick action link: "Open Live Site ↗" pointing to `activeUrl`.
2. **MediaAndTabsEditor QR Kit (`apps/Admin/.../MediaAndTabsEditor.tsx`):**
   - QR code generation uses `activeUrl`.
   - Table QR Card mockup displays both `https://${slug}.asar.me` and the QR image.
   - "Open Live Memory Page ↗" opens `activeUrl`.
3. **InvitationStudio (`apps/Admin/.../InvitationStudio.tsx`):**
   - Save notification displays `activeUrl`.
   - QR Modal displays `https://${slug}.asar.me` with a one-click copy button.
   - Document `qrCodeUrl` saved to Appwrite uses `canonicalUrl`.

---

### 3.4. In-App Studio Preview vs. External Live Site Launcher
- **In-App Studio Preview (Must Be Preserved 100%):**
  - `LiveMemoryMobilePreview.tsx` and `LiveInvitationPreview.tsx` provide immediate, latency-free feedback as the Admin types text, uploads photos, or changes category pills.
  - They operate directly on React state before saving to Appwrite or localStorage.
  - **Decision:** Keep the split-screen in-app live previews completely intact.
- **External Live Site Launcher:**
  - Used when Admin clicks "Open Live Site", downloads QR codes, or copies links to share with clients.
  - Passes the validated subdomain/slug to the dynamic renderer.

---

### 3.5. Non-Regression Guarantee for Existing Admin Features
The alignment with dynamic subdomains strictly preserves all existing functionality:
- **No changes** to Plan creation, pricing, quotas, or add-ons in `PlanBuilderStudio.tsx`.
- **No changes** to the 7-stage order status progression in `OrdersQueueManager.tsx`.
- **No changes** to payment receipt verification, zoom modal, or rejection reasons in `PaymentReceiptInspector.tsx`.
- **No changes** to the Bulk Voice Uploader, Web Audio API waveform peak extractor, or inline spreadsheet editor.
- **No changes** to the Invitation Theme and Effects panel or Dynamic Form Schema builder.

---

## 4. Review of `docs/ASAR_PROJECT_ARCHITECTURE.md` & Required Updates

### 4.1. Section-by-Section Audit of Current Documentation

| Section | Current Documentation Description | Shortcoming / Gap to Address |
| :--- | :--- | :--- |
| **Title & Meta** (Lines 1–8) | References 4 apps (`Main`, `Admin`, `Booth`, `Invitation`). | Does not list `react-router-dom` in the frontend stack or mention the dynamic subdomain renderer model. |
| **§ 1. Executive Summary** (Lines 35–57) | Describes Booth memories at `/memory/:slug` and Invitation custom events at `/e/:slug`. | Must be updated to describe the storefront-style dynamic subdomain renderer (`https://[subdomain].asar.me`) resolving both Booth and Invitation memories. |
| **§ 2. Monorepo Audit** (Lines 59–84) | Lists apps on ports 3000–3003 with static path routes. | Table 2.2 needs update: routing across all `apps/*` upgraded to React Router v6; memory delivery upgraded to dynamic subdomains. |
| **§ 3. Monorepo Architecture & Topology** (Lines 86–124) | Diagram shows path-based routing (`/memory/:slug`, `/e/:slug`, `/pass/:rsvpId`). | Mermaid diagram and architecture topology must reflect: (1) React Router in all apps, (2) Subdomain Resolution Flow from incoming host header. |
| **§ 4. Service 1: ASAR Booth** (Lines 126–336) | § 4.4 titled "Located at `apps/Booth` route `/memory/:slug`". § 4.6 mentions QR pointing to `https://{booth-domain}/memory/{slug}`. | Needs update to reflect dynamic subdomain resolution (`https://[subdomain].asar.me`), DNS slug validation, and local dev fallback (`?subdomain=...`). |
| **§ 5. Service 2: ASAR Invitation** (Lines 339–474) | § 5.1 and § 5.3 describe invitations rendering at `/e/:slug`. | Needs update to reflect dynamic subdomain rendering for custom invitation websites. |
| **§ 6. Database Schemas** (Lines 476–643) | `BOOTH_MEMORIES` and `INVITATIONS` have `slug UK`. | Add explicit documentation that `slug` is the canonical DNS-compliant subdomain key. |
| **§ 7. Target Directory Structure** (Lines 646–745) | App directory trees show rudimentary `App.tsx` files switching views via state. | Update trees to show React Router routing structure (`routes.tsx` or `<Routes>` in `App.tsx`) across `Admin`, `Main`, `Booth`, `Invitation`, and the dynamic memory renderer. |
| **§ 8. Implementation Roadmap** (Lines 749–767) | Mentions path-based routes throughout Phases 3, 4, 5. | Update milestones to include React Router integration and Subdomain Resolver implementation. |

---

### 4.2. Exact Documentation Updates Needed

The following exact text and architectural additions must be incorporated into `docs/ASAR_PROJECT_ARCHITECTURE.md`:

#### 1. React Router v6 Adoption Across All Monorepo Apps
- Add `react-router-dom: ^6.28.0` to the Core Frontend Stack in Section 1.
- Detail the route trees for each app:
  - **`apps/Admin` Route Map:**
    - `/` -> `<Navigate to="/overview" replace />`
    - `/overview` -> `<AdminOverview />`
    - `/plans` -> `<PlanBuilderStudio />`
    - `/orders` -> `<OrdersQueueManager />`
    - `/booth-studio` -> `<BoothMemoryStudio />` (with optional `?orderId=...` or route param)
    - `/booth-studio/:orderId` -> `<BoothMemoryStudio />`
    - `/invitation-studio` -> `<InvitationStudio />`
    - `/invitation-studio/:orderId` -> `<InvitationStudio />`
  - **`apps/Main` Route Map:**
    - `/` -> `<EcosystemHome />`
    - `/auth/login`, `/auth/register` -> `<AuthModalOrPage />`
    - `/account` -> `<ClientAccountShell />`
    - `/account/orders` -> `<OrderPipelineTracker />`
    - `/account/orders/:orderId` -> `<OrderDetailView />`
    - `/account/mailbox` -> `<ClientRsvpMailbox />`
    - `/account/mailbox/:invitationId` -> `<ClientRsvpMailbox />`
  - **Memory & Marketing Route Map (Booth & Invitation / Storefront):**
    - Root marketing: `/`
    - Booking modal: `/book` (or modal route)
    - Subdomain root: `/` (when host matches `[subdomain].asar.me`)
    - Subdomain pass: `/pass/:rsvpId`
    - Backward-compatible path fallback: `/memory/:slug` and `/e/:slug`

#### 2. Dynamic Subdomain-Driven Memory Renderer Architecture
- **Architecture Model:** Multi-tenant web builder / storefront model (analogous to Shopify or Vercel platforms).
- **Subdomain Resolution Lifecycle:**
  ```
  HTTP Request -> Hostname Inspection (window.location.hostname)
       |
       +--> Apex Domain (asar.me, localhost:PORT) -> Marketing Landing Page
       |
       +--> Subdomain Detected (e.g. mina-and-maryam.asar.me)
       |    OR Query Fallback (?subdomain=mina-and-maryam)
            |
            +--> Appwrite Cache / DB Lookup:
                 1. Query booth_memories where slug == subdomain
                    -> Found: Render <BoothMemoryPage memory={doc} />
                 2. Query invitations where slug == subdomain
                    -> Found: Render <CustomEventPage invitation={doc} />
                 3. Neither Found: Render <MemoryNotFoundView subdomain={subdomain} />
  ```
- **Local Development Multi-Tenant Strategy:**
  - Modern Chromium browsers natively resolve `*.localhost` to `127.0.0.1` without modifying `/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`.
  - For cross-browser and mobile testing, provide a universal query parameter fallback (`?subdomain=${slug}`).
  - Document DNS wildcard configuration (`*.asar.me CNAME ...`) for production deployment.

#### 3. Admin Template & Memory Management Alignment
- Document the DNS-compliant slug validation specification (RFC 1123, 1-63 characters, reserved subdomain guard).
- Document the unified URL generator helper (`buildMemoryUrls`) used across Admin studio editors, toast notifications, and QR Code kits.
- Document that existing Admin management flows, plan quotas, and order status pipelines remain intact without regression.

---

## 5. Concrete Implementation Blueprint for Admin

### 5.1. Admin React Router Setup (`apps/Admin/src/App.tsx`)
Currently, `apps/Admin/src/App.tsx` switches tabs via `useState<AdminTab>("overview")`. The modernized router architecture replaces this with React Router v6:

```tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { AdminShell } from "./components/layout/AdminShell";
// ... imports for AdminOverview, PlanBuilderStudio, OrdersQueueManager, BoothMemoryStudio, InvitationStudio

export const AdminRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from current URL pathname
  const currentTab = location.pathname.split("/")[1] || "overview";

  return (
    <AdminShell activeTab={currentTab} onSelectTab={(tab) => navigate(`/${tab}`)}>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<AdminOverview onNavigateTab={(t) => navigate(`/${t}`)} />} />
        <Route path="/plans" element={<PlanBuilderStudio />} />
        <Route path="/orders" element={<OrdersQueueManager onOpenStudio={(id, type) => navigate(`/${type}-studio/${id}`)} />} />
        <Route path="/booth-studio" element={<BoothMemoryStudio onBack={() => navigate("/orders")} />} />
        <Route path="/booth-studio/:orderId" element={<BoothMemoryStudioWithParams onBack={() => navigate("/orders")} />} />
        <Route path="/invitation-studio" element={<InvitationStudio onBack={() => navigate("/orders")} />} />
        <Route path="/invitation-studio/:orderId" element={<InvitationStudioWithParams onBack={() => navigate("/orders")} />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AdminShell>
  );
};

const BoothMemoryStudioWithParams: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { orderId } = useParams<{ orderId: string }>();
  return <BoothMemoryStudio orderId={orderId} onBack={onBack} />;
};

const InvitationStudioWithParams: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { orderId } = useParams<{ orderId: string }>();
  return <InvitationStudio orderId={orderId} onBack={onBack} />;
};
```

### 5.2. Subdomain Field & Validator in Booth Studio (`HeroAndTextsEditor.tsx`)
In `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx`:
1. Use `validateSubdomainSlug` to provide immediate inline feedback:
   ```tsx
   const slugValidation = validateSubdomainSlug(memory.slug);
   const memoryUrls = buildMemoryUrls({ slug: memory.slug, serviceType: "booth" });
   ```
2. Display the canonical subdomain URL and local dev link:
   ```tsx
   <div style={{ marginTop: "0.4rem" }}>
     <span style={{ fontSize: "0.78rem", color: "var(--athar-text-muted)" }}>
       Public Subdomain URL:{" "}
       <strong style={{ color: "var(--athar-maroon)" }}>
         {memoryUrls.canonicalUrl}
       </strong>
     </span>
     {!slugValidation.isValid && (
       <div style={{ color: "var(--athar-status-danger)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
         ⚠️ {slugValidation.error}
       </div>
     )}
   </div>
   ```

### 5.3. Dynamic Subdomain QR Code Kit (`MediaAndTabsEditor.tsx`)
In `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`:
- Compute `const memoryUrls = buildMemoryUrls({ slug: memory.slug, serviceType: "booth" });`
- Use `memoryUrls.activeUrl` for both the QR code API query and the "Open Live Memory Page ↗" button.
- Printed reception table card mockup displays `memoryUrls.canonicalUrl`.

---

## 6. Synthesis and Recommendations

1. **Adopt a Unified URL & Slug Utility in `@repo/react-appwrite` or shared package:**
   - Centralize `validateSubdomainSlug`, `RESERVED_SUBDOMAINS`, and `buildMemoryUrls` so both Admin and Client portals share identical logic.
2. **Implement React Router Across All Apps in Parallel:**
   - Add `react-router-dom` to `package.json` for all 4 apps.
   - Retain backward compatibility by accepting query parameters (`?subdomain=...`, `?memory=...`, `?event=...`) alongside React Router path routes.
3. **Execute `docs/ASAR_PROJECT_ARCHITECTURE.md` Revision:**
   - Apply the enumerated updates in Sections 1, 2, 3, 4, 5, 7, and 8 of the architecture document to reflect React Router and the dynamic subdomain renderer architecture.
