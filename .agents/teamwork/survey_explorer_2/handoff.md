# Storefront & Subdomain Resolution Survey Report (Explorer 2)

**Agent**: `survey_explorer_2`  
**Role**: Storefront Subdomain Explorer  
**Working Directory**: `d:\asar\.agents\teamwork\survey_explorer_2\`  
**Milestone**: Investigation & Survey for R1, R2, R3, R4  
**Date**: 2026-11-03T22:20:00Z  

---

## Executive Summary

This survey provides a comprehensive architectural investigation into the Storefront domain utilities, dynamic subdomain resolution mechanisms, memory data fetching pathways, rendering components across `apps/Booth` and `apps/Invitation`, and concrete blueprints for introducing a **new dedicated dynamic renderer application** under `apps/` in the ASAR monorepo.

The ASAR codebase already contains a robust RFC 1123-compliant subdomain engine and 4-tier resolution hook in `packages/react-appwrite/src/Storefront/`. All 13 unit tests in `packages/react-appwrite/test/storefront.test.ts` execute cleanly with zero failures. Existing applications (`Admin`, `Booth`, `Invitation`, `Main`) already have `react-router-dom: ^6.28.0` installed and utilize `Routes`/`Route` structures. This report defines exact data interfaces, rendering component trees, error boundaries, data caching quirks, and an automated testing strategy for the dedicated dynamic renderer application.

---

## 1. Observation

### 1.1 Storefront Domain Utilities in `@repo/react-appwrite`

The Storefront domain engine is located in `d:\asar\packages\react-appwrite\src\Storefront\` and exported directly from `@repo/react-appwrite` (`packages/react-appwrite/src/index.ts:54`).

#### A. Subdomain Parser & RFC 1123 Slug Validator (`packages/react-appwrite/src/Storefront/subdomain.ts`)
- **Reserved Subdomains (`lines 6–27`)**:
  ```ts
  export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
    "admin", "api", "booth", "main", "invitation", "app",
    "cdn", "mail", "auth", "dev", "staging", "test",
    "www", "storefront", "status", "account",
  ]);
  export const RESERVED_SUBDOMAIN_LIST: readonly string[] = Array.from(RESERVED_SUBDOMAINS);
  ```
- **Default Apex Root Domains (`lines 29–32`)**:
  ```ts
  export const DEFAULT_ROOT_DOMAINS: readonly string[] = ["asar.me", "asar.audio"];
  ```
- **Validation Rules (`lines 46–103`, `validateSubdomainSlug`)**:
  * Null/undefined/type check: Returns `SubdomainValidationResult { isValid: false, error: "Subdomain slug is required." }`.
  * Non-empty check after `.trim()`.
  * Max length: $\le 63$ characters (RFC 1123).
  * No leading or trailing hyphen (`trimmed.startsWith("-") || trimmed.endsWith("-")`).
  * Lowercase enforcement: `trimmed !== trimmed.toLowerCase()`.
  * RFC 1123 Regex: `/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/`.
  * Reserved subdomains check: `RESERVED_SUBDOMAINS.has(trimmed)`.
- **Hostname & Query Extractor (`lines 126–223`, `extractSubdomain`)**:
  * Step 1: Query parameter override check (`?subdomain=`, `?memory=`, `?event=`) if `searchParams` provided and `allowQueryOverride !== false`.
  * Step 2: Normalizes hostname by stripping protocol (`/^[a-z]+:\/\//i`), port (`host.split(":")[0]`), and path/query.
  * Step 3: Returns `null` for bare localhost (`"localhost"`, `"127.0.0.1"`, `"0.0.0.0"`) and numeric IPv4 patterns (`/^(\d{1,3}\.){3}\d{1,3}$/`).
  * Step 4: RFC 6761 `*.localhost` extraction (`host.endsWith(".localhost") -> host.slice(0, -".localhost".length)`).
  * Step 5: Apex root domain matching against `asar.me`, `asar.audio`, or custom `rootDomains`. Returns `null` for bare root apex domain.

#### B. URL Builder (`packages/react-appwrite/src/Storefront/urlBuilder.ts`)
- Interface and Function Signature:
  ```ts
  export interface BuildMemoryUrlsParams {
    slug: string;
    type: "booth" | "invitation";
    port?: number;
    isDev?: boolean;
    rootDomain?: string;
  }
  export interface MemoryUrls {
    canonicalUrl: string;       // e.g. https://mina-and-maryam.asar.me
    devLocalhostUrl: string;    // e.g. http://mina-and-maryam.localhost:3002
    devQueryUrl: string;        // e.g. http://localhost:3002?subdomain=mina-and-maryam
    isSubdomain: boolean;
    primaryUrl: string;         // points to devLocalhostUrl if isDev, else canonicalUrl
  }
  export function buildMemoryUrls(params: BuildMemoryUrlsParams): MemoryUrls;
  ```
- Default ports: Booth = `3002`, Invitation = `3003`.

#### C. 4-Tier Subdomain Resolution Hook (`packages/react-appwrite/src/Storefront/useSubdomain.ts`)
- Pure Resolution Hierarchy (`lines 113–198`, `resolveSubdomain`):
  * **Tier 1 (Highest)**: Query parameter (`?subdomain=`, `?memory=`, `?event=`) via `searchParams` or `window.location.search`.
  * **Tier 2**: Route parameter (`options.routeParam`, e.g. React Router `useParams().slug`).
  * **Tier 3**: Hostname subdomain (`candidate.localhost` or `candidate.asar.me`).
  * **Tier 4 (Lowest)**: Fallback subdomain (`options.fallbackSubdomain`).
  * Returns: `{ subdomain: string | null, isSubdomain: boolean, source: "query" | "param" | "hostname" | "fallback" | null }`.
- React Hook (`lines 203–229`, `useSubdomain`): Wraps `resolveSubdomain` in `useMemo` with proper browser window checks for SSR/hydration safety.

---

### 1.2 Memory Data Fetching Pathways

#### A. Canonical Appwrite Identifiers (`packages/react-appwrite/src/AsarDomain/collections.ts`)
- Database ID: `ASAR_DATABASE_ID = "asar-db"`
- Collections:
  * `ASAR_COLLECTIONS.BOOTH_MEMORIES = "booth_memories"`
  * `ASAR_COLLECTIONS.BOOTH_VOICE_RECORDS = "booth_voice_records"`
  * `ASAR_COLLECTIONS.BOOTH_MEDIA = "booth_media"`
  * `ASAR_COLLECTIONS.INVITATIONS = "invitations"`
  * `ASAR_COLLECTIONS.INVITATION_RSVPS = "invitation_rsvps"`
  * `ASAR_COLLECTIONS.ORDERS = "orders"`
  * `ASAR_COLLECTIONS.PLANS = "plans"`
  * `ASAR_COLLECTIONS.PAYMENTS = "payments"`
- Buckets:
  * `ASAR_BUCKETS.BOOTH_MASTERED_AUDIO = "booth_mastered_audio"`
  * `ASAR_BUCKETS.BOOTH_GALLERY_MEDIA = "booth_gallery_media"`
  * `ASAR_BUCKETS.INVITATION_ASSETS = "invitation_assets"`

#### B. Domain Models (`packages/react-appwrite/src/AsarDomain/models.ts`)
- **BoothMemory (`lines 114–142`)**:
  * `$id?`, `orderId?`, `clientId?`, `slug: string`, `subdomain?`, `customDomain?`
  * `eventHeaderTag?` ("THE WEDDING OF"), `coupleTitle: string` ("Mina & Maryam")
  * `tagline?`, `eventDateDisplay?`, `eventLocationDisplay?`, `highlightBadge?`, `coupleQuote?`
  * `heroImageFileId?`, `heroImageUrl?`, `videoHighlightFileId?`, `videoHighlightTitle?`
  * `thankYouTitle?`, `thankYouMessage?`, `categoriesJson?` (JSON `string[]`)
  * `isPrivateLocked: boolean`, `accessPinCode?`, `qrCodeUrl?`, `isPublished: boolean`
- **BoothVoiceRecord (`lines 144–163`)**:
  * `memoryId: string`, `audioFileUrl?`, `speakerName: string`, `speakerRole: string`, `category: string`
  * `quoteSnippet?`, `avatarUrl?`, `durationFormatted: string` ("0:42"), `durationSeconds: number`
  * `waveformPeaksJson: string` (JSON stringified 48 normalized floats `[0.15..1.0]`), `likesCount: number`
- **AsarInvitation (`lines 246–268`)**:
  * `$id?`, `orderId?`, `clientId?`, `slug: string`, `subdomain?`, `customDomain?`
  * `eventTitle: string`, `occasionType: "wedding" | "festival" | "gala" | ...`
  * `eventDate: string`, `eventTime?`, `venueName: string`, `venueAddress?`, `venueMapUrl?`
  * `maxCapacity?`, `themeConfigJson?`, `sectionsConfigJson?`, `formSchemaJson?`, `qrCodeUrl?`, `isPublished: boolean`
- **InvitationRsvp (`lines 272–290`)**:
  * `invitationId: string`, `clientId: string`, `guestName: string`, `guestEmail: string` (strictly locked), `companionsCount: number`, `dynamicResponsesJson?: string`, `status: "pending" | "approved" | "declined"`, `passToken?: string`, `qrCodeUrl?: string`

#### C. Seed Defaults & In-Memory Presets (`packages/react-appwrite/src/AsarDomain/seedDefaults.ts`)
- `DEMO_BOOTH_MEMORY`: Default Booth memory for couple **Mina & Maryam** (`slug: "mina-and-maryam"`).
- `DEMO_BOOTH_VOICE_RECORDS`: 5 exact demo voice tracks matching UI specifications.
- `DEMO_INVITATION`: Default Invitation for **Omar & Layla** (`slug: "omar-and-layla"`).
- In `apps/Invitation/src/pages/CustomEventPage.tsx:28–147`: `INVITATION_PRESETS` contains 3 rich presets:
  1. `"omar-and-layla"` (Wedding in Alexandria, Ivory Royal theme)
  2. `"cairo-jazz-festival"` (Festival in The Greek Campus, Cairo theme)
  3. `"asar-leadership-gala"` (VIP Gala in St. Regis Almasa, Noir Obsidian theme)

#### D. Fetching Strategy in Current Applications
1. **In `apps/Booth/src/pages/BoothMemoryPage.tsx:90–150`**:
   - Step 1: Check `localStorage.getItem("asar_booth_memories_cache")`.
   - Step 2: Query Appwrite: `databases.listDocuments(dbId, "booth_memories", [Query.equal("slug", slug), Query.limit(1)])`.
   - Step 3: Fallback to `DEMO_BOOTH_MEMORY` if slug is `"mina-and-maryam"` or empty, or synthetic record formatted from slug.
2. **In `apps/Invitation/src/pages/CustomEventPage.tsx:170–232`**:
   - Step 1: Check `INVITATION_PRESETS[slug]`.
   - Step 2: Check `localStorage.getItem("asar_invitations_cache")`.
   - Step 3: Query Appwrite: `databases.listDocuments(dbId, "invitations", [Query.equal("slug", slug), Query.limit(1)])`.
   - Step 4: If not found, render luxury 404 screen.

#### E. Critical Data Cache Disparity
- In `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx:254`:
  ```ts
  localStorage.setItem("asar_booth_memories_cache", JSON.stringify(updatedMemory)); // SINGLE OBJECT
  ```
- Whereas in `apps/Booth/src/pages/BoothMemoryPage.tsx:56–57`:
  ```ts
  const list: BoothMemoryData[] = JSON.parse(cached);
  const found = list.find((m) => m.slug === slug || m.id === slug); // EXPECTS ARRAY
  ```
- In `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx:321–331`:
  It correctly saves an array: `list = list.filter(...); list.push(invitationPayload); localStorage.setItem("asar_invitations_cache", JSON.stringify(list));`.
- **Impact for dedicated renderer**: The renderer's cache retrieval helper MUST normalize single object vs array defensively:
  ```ts
  function getCachedRecords<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed as T];
      return [];
    } catch {
      return [];
    }
  }
  ```

---

### 1.3 Memory Rendering Components

#### A. Booth Memory Rendering Architecture (`apps/Booth/src/components/memory/`)
| Component | File Path | Responsibilities & Visual Layout |
|-----------|-----------|----------------------------------|
| `MemoryHeader` | `apps/Booth/src/components/memory/MemoryHeader.tsx` | Top bar with back-to-landing button, couple title, category tags count, share action trigger. |
| `MemoryHero` | `apps/Booth/src/components/memory/MemoryHero.tsx` | Full-width editorial hero image, "THE WEDDING OF", couple title ("Mina & Maryam"), date, location, couple quote, video teaser button. |
| `MemoryTabs` | `apps/Booth/src/components/memory/MemoryTabs.tsx` | Interactive tabs: Audio Messages (`audio`), Digital Guestbook (`guestbook`), Keepsake Gallery (`gallery`), Video Highlight (`highlights`). |
| `VoiceCard` | `apps/Booth/src/components/memory/VoiceCard.tsx` | 48-bar dynamic waveform peaks visualizer, play/pause state, speaker name, role badge, category filter, likes counter. |
| `AudioPlayerBar` | `apps/Booth/src/components/memory/AudioPlayerBar.tsx` | Fixed bottom luxury floating player bar, scrubber, volume control, dial tone chime trigger using Web Audio API (sine oscillators at 440Hz + 480Hz). |
| `GuestBookFeed` | `apps/Booth/src/components/memory/GuestBookFeed.tsx` | Grid of heartfelt written guest notes with author names, timestamps, and "Leave a Note" trigger. |
| `LeaveLoveModal` | `apps/Booth/src/components/memory/LeaveLoveModal.tsx` | Dialog for attendees to submit written blessings to the couple. |
| `PhotoGalleryGrid`| `apps/Booth/src/components/memory/PhotoGalleryGrid.tsx` | Masonry/grid layout for wedding photography with lightbox viewing and bulk ZIP download. |
| `VideoHighlightCard`| `apps/Booth/src/components/memory/VideoHighlightCard.tsx` | Embedded video card for the 30-second cinema reel. |
| `MemoryActionBar` | `apps/Booth/src/components/memory/MemoryActionBar.tsx` | Actions: Share QR pass, download audio ZIP bundle, leave note. |
| `ShareSheetModal` | `apps/Booth/src/components/memory/ShareSheetModal.tsx` | QR code display, canonical link copy, Web Share API integration. |
| `MemoryPinLockGate`| `apps/Booth/src/components/memory/MemoryPinLockGate.tsx` | Numeric keypad PIN protection gate for private locked audio heirlooms. |

#### B. Invitation Memory Rendering Architecture (`apps/Invitation/src/components/renderer/`)
| Component | File Path | Responsibilities & Visual Layout |
|-----------|-----------|----------------------------------|
| `ThemeWrapper` | `apps/Invitation/src/components/renderer/ThemeWrapper.tsx` | Dynamic CSS variables injector supporting `ivory-royal` and `noir-obsidian`, typography font injection, RTL/LTR directionality. |
| `EventHeroSection` | `apps/Invitation/src/components/renderer/EventHeroSection.tsx` | Full-screen hero with couple/event title, date, venue, tagline, and direct "RSVP Now" smooth scroll CTA. |
| `EventCountdownSection` | `apps/Invitation/src/components/renderer/EventCountdownSection.tsx` | Real-time live countdown counter (Days, Hours, Minutes, Seconds) leading to event date/time. |
| `EventScheduleSection` | `apps/Invitation/src/components/renderer/EventScheduleSection.tsx` | Timeline schedule cards (Reception, Main Ceremony, Dinner, Jam Session) with time badges. |
| `EventMediaGallery` | `apps/Invitation/src/components/renderer/EventMediaGallery.tsx` | Event gallery with curated photos and optional WebGL/video highlights. |
| `EventLocationMap` | `apps/Invitation/src/components/renderer/EventLocationMap.tsx` | Venue location details, interactive Google Maps link, dress code swatches, valet parking instructions. |
| `DynamicRsvpForm` | `apps/Invitation/src/components/renderer/DynamicRsvpForm.tsx` | Dynamic schema-driven RSVP form: strictly enforces locked guest email, companion counter, custom questions, Appwrite database write, unique pass token generation, EmailJS notification dispatch. |

---

### 1.4 Dedicated Renderer App Architecture

To meet **R2** ("Dedicated Dynamic Subdomain Renderer App"), a new dedicated application should be established under `apps/` (e.g., `apps/Renderer`).

#### A. Port & Workspace Configuration
- Workspace: `apps/Renderer`
- Port allocation: `3004` (Main is 3000, Admin is 3001, Booth is 3002, Invitation is 3003).
- Host: `0.0.0.0` (matching existing apps in `vite.config.ts`).
- Root Domain: `asar.me` (or `asar.audio`).

#### B. Subdomain Resolution & Fallback Routing Matrix
The application will resolve the active memory slug and service type according to the following matrix:

| Priority / Source | Example Request | Resolution Behavior |
|-------------------|-----------------|---------------------|
| **1. Query Param** | `http://localhost:3004?subdomain=mina-and-maryam` | Highest precedence. Extracts `"mina-and-maryam"`. Perfect for local manual testing. |
| **2. Path Parameter** | `http://localhost:3004/s/omar-and-layla` or `/memory/:slug` or `/e/:slug` | Extracts slug from React Router `useParams()`. Enables explicit path-based testing. |
| **3. Localhost Subdomain** | `http://mina-and-maryam.localhost:3004` | RFC 6761 compliant. Browser resolves `*.localhost` to `127.0.0.1`. Extracts `"mina-and-maryam"`. |
| **4. Production Subdomain**| `https://mina-and-maryam.asar.me` | Production apex extraction. Extracts `"mina-and-maryam"`. |
| **5. Bare Root (No slug)**| `http://localhost:3004/` or `https://asar.me` | No subdomain provided. Renders **Storefront Directory & Demo Showcase** with direct interactive preview links. |
| **6. Reserved Subdomain** | `http://admin.localhost:3004` or `?subdomain=api` | Subdomain is in `RESERVED_SUBDOMAINS`. Rejected by `validateSubdomainSlug`. Renders informative Reserved Subdomain / Portal screen. |
| **7. Unknown Slug** | `http://unknown-event.localhost:3004` | Subdomain valid format, but record not found in Booth or Invitation data. Renders luxury **404 Heirloom Not Found** screen. |

#### C. Memory Type Discrimination Algorithm
When a valid slug `candidateSlug` is detected:
```
                                [Extract Slug]
                                      │
                                      ▼
                      [Concurrent Data Resolution]
                      ├── Check Booth Memory Sources
                      │     ├── DEMO_BOOTH_MEMORY (slug == "mina-and-maryam")
                      │     ├── localStorage ("asar_booth_memories_cache")
                      │     └── Appwrite "booth_memories" collection
                      │
                      └── Check Invitation Memory Sources
                            ├── INVITATION_PRESETS[slug]
                            ├── localStorage ("asar_invitations_cache")
                            └── Appwrite "invitations" collection
                                      │
                                      ▼
                      ┌───────────────┴───────────────┐
                      │                               │
              [Booth Found?]                 [Invitation Found?]
                      │                               │
                     YES                             YES
                      │                               │
                      ▼                               ▼
            <BoothMemoryView />             <CustomEventView />
                      │                               │
                      └───────────────┬───────────────┘
                                     NO
                                      │
                                      ▼
                            <Storefront404View />
```

---

### 1.5 Test Suites Survey & Expansion Requirements

#### Current Existing Test Suites
Running `node --test packages/react-appwrite/test/storefront.test.ts`:
- **13 test cases passed** (Duration: 274ms):
  1. `Reserved Subdomains: contains all required system subdomains` (PASS)
  2. `validateSubdomainSlug: accepts RFC 1123 compliant slugs` (PASS)
  3. `validateSubdomainSlug: rejects invalid and reserved slugs` (PASS)
  4. `extractSubdomain: extracts RFC 6761 localhost subdomains` (PASS)
  5. `extractSubdomain: extracts production apex subdomains` (PASS)
  6. `extractSubdomain: returns null for bare apex, localhost, and IPs` (PASS)
  7. `extractSubdomain: returns null for reserved subdomains` (PASS)
  8. `extractSubdomain: handles query param overrides` (PASS)
  9. `buildMemoryUrls: generates correct URLs for Booth service` (PASS)
  10. `buildMemoryUrls: generates correct URLs for Invitation service` (PASS)
  11. `buildMemoryUrls: handles empty or missing slug gracefully` (PASS)
  12. `resolveSubdomain: adheres strictly to the 4-tier resolution hierarchy` (PASS)
  13. `Domain Models: BoothMemory and AsarInvitation include subdomain and customDomain` (PASS)

Running `node --test packages/react-appwrite/test/domain.test.ts`:
- **7 test cases passed** (Duration: 194ms) covering canonical Appwrite IDs, safe JSON parsers, order pipeline, audio analyzer, filename parser, EmailJS & QR code service, and seed defaults.

#### Test Suites Needing Expansion for R4
1. **Dynamic Subdomain Resolution & Fallback Integration Tests**:
   - Verify resolution under `subdomain.localhost:3004` vs `localhost:3004?subdomain=slug` vs `/s/:slug`.
   - Verify precedence: Query param override > Route param > Hostname subdomain > Fallback.
   - Verify rejection of reserved subdomains (`admin`, `api`, `booth`, `main`, `invitation`, etc.).
2. **Conditional Storefront Memory Rendering Tests**:
   - Verify that resolving `mina-and-maryam` classifies as `serviceType: "booth"` and resolves Booth data structures.
   - Verify that resolving `omar-and-layla` classifies as `serviceType: "invitation"` and resolves Invitation data structures.
   - Verify that an unknown slug gracefully resolves to `type: null` triggering the luxury 404 page.
3. **React Router Navigation Tests**:
   - Verify route switching between `/`, `/s/:slug`, `/memory/:slug`, `/e/:slug`, `/pass/:rsvpId`, and fallback 404.

---

## 2. Logic Chain

1. **Premise 1**: RFC 1123 defines domain label standards (1–63 alphanumeric characters and hyphens, no leading/trailing hyphen). RFC 6761 reserves `.localhost` as a special-use top-level domain where all subdomains resolve to loopback `127.0.0.1`.
2. **Premise 2**: In `packages/react-appwrite/src/Storefront/subdomain.ts`, `validateSubdomainSlug` and `extractSubdomain` implement these exact RFC specifications and maintain a set of 16 reserved subdomains.
3. **Premise 3**: In `packages/react-appwrite/src/Storefront/useSubdomain.ts`, `resolveSubdomain` defines a 4-tier resolution hierarchy (Query $\to$ RouteParam $\to$ Hostname $\to$ Fallback). This enables local development on bare `localhost:3004?subdomain=...` or `/s/...` without requiring local DNS changes, while simultaneously supporting `*.localhost` in modern browsers.
4. **Premise 4**: The ASAR monorepo stores Booth memories in Appwrite collection `booth_memories` and Invitation memories in collection `invitations`. In offline/development mode, memories are cached in `localStorage` under `asar_booth_memories_cache` and `asar_invitations_cache`, with default presets `DEMO_BOOTH_MEMORY` and `INVITATION_PRESETS`.
5. **Premise 5**: Because memories of both types are addressed via slugs, a dedicated storefront renderer can inspect both stores concurrently to automatically classify any requested slug as either a Booth memory or an Invitation memory.
6. **Inference**: A dedicated app (`apps/Renderer`) built on Vite, React Router v6, Chakra UI, and `@repo/react-appwrite` can provide dynamic storefront rendering with full fallback support for local testing, completely fulfilling requirements R1, R2, R3, and R4.

---

## 3. Caveats

1. **Browser Support for `*.localhost`**: Chromium and modern Firefox resolve `*.localhost` to `127.0.0.1` natively without modifying `/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`. However, some corporate proxies, VPNs, or older Safari versions may not. The query parameter fallback (`?subdomain=...`) and path fallback (`/s/...`) are therefore critical for developer ergonomics.
2. **Appwrite Backend Offline State**: If Appwrite is not provisioned or offline during automated testing, all fetching logic must gracefully fall back to local cache or seed presets without throwing unhandled promise rejections.
3. **Node Test Runner JSX Limitations**: When running unit tests via native Node `node --test` with `--experimental-strip-types`, TypeScript `.ts` files run natively, but `.tsx` (React JSX) files require a compiler/loader (such as Vite/Vitest or tsx). Test files for routing/rendering logic should either test pure resolution/model functions or run within a JSX-aware test harness.

---

## 4. Conclusion & Recommendations

1. **Introduce Dedicated App `apps/Renderer` (or `apps/Storefront`)**:
   - Establish `apps/Renderer` using port `3004`.
   - Configure React Router v6 with routes: `/` (dynamic index / showcase), `/s/:slug` (universal memory path), `/memory/:slug` (explicit booth), `/e/:slug` (explicit invitation), `/pass/:rsvpId` (VIP QR pass), and `*` (luxury 404).
2. **Utilize Shared `@repo/react-appwrite` Storefront Utilities**:
   - Leverage `useSubdomain` and `extractSubdomain` directly without re-implementing slug validation or hostname parsing.
3. **Implement Unified Memory Discriminator**:
   - Implement `resolveMemoryRecord(slug)` that queries local presets, local storage caches, and Appwrite databases in parallel to identify whether the record is `booth` or `invitation`.
4. **Fix LocalStorage Cache Normalization**:
   - Ensure the renderer's cache retrieval parser safely handles both single-object and array schemas (`asar_booth_memories_cache`).
5. **Expand Test Suites**:
   - Implement unit and integration tests covering the 4-tier resolution hierarchy, dynamic routing, memory classification, and fallback behaviors to satisfy R4 acceptance criteria.

---

## 5. Verification Method

### 5.1 Verifying Storefront Domain Utilities
Execute the existing Storefront unit test suite:
```powershell
node --test packages/react-appwrite/test/storefront.test.ts
```
**Expected Result**: All 13 unit tests pass with 0 failures.

### 5.2 Verifying Asar Domain Models & Seed Defaults
Execute the Domain unit test suite:
```powershell
node --test packages/react-appwrite/test/domain.test.ts
```
**Expected Result**: All 7 unit tests pass with 0 failures.

### 5.3 Files to Inspect for Implementation
- `packages/react-appwrite/src/Storefront/subdomain.ts` (Lines 6–224)
- `packages/react-appwrite/src/Storefront/useSubdomain.ts` (Lines 87–229)
- `packages/react-appwrite/src/Storefront/urlBuilder.ts` (Lines 6–58)
- `apps/Booth/src/pages/BoothMemoryPage.tsx` (Lines 34–156)
- `apps/Invitation/src/pages/CustomEventPage.tsx` (Lines 28–232)
- `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx` (Lines 230–270)
- `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` (Lines 280–350)
