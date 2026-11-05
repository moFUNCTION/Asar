# Specification Mining Report: Admin Memory Template Management & Dynamic Renderer Alignment

**Author:** `survey_spec_miner_1` (Admin Spec Miner)  
**Date:** 2026-11-03T22:15:00Z  
**Task Working Directory:** `d:\asar\.agents\teamwork\survey_spec_miner_1\`  
**Target File:** `d:\asar\.agents\teamwork\survey_spec_miner_1\handoff.md`  

---

## 1. Observation

Direct examination of the ASAR repository (`d:\asar`) reveals the following components, routes, data structures, and behaviors:

### 1.1 Admin Routing & Shell Architecture
* **File:** `d:\asar\apps\Admin\src\App.tsx` (Lines 298–350)
  * Declarative React Router v6 `<Routes>` tree configured:
    * `/` -> `<Navigate to="/overview" replace />`
    * `/overview` -> `<AdminOverview orders={orders} plansCount={plans.length} ... />`
    * `/plans` -> `<PlanBuilderStudio onPlansUpdated={...} />`
    * `/orders` -> `<OrdersQueueManager orders={orders} payments={payments} ... />`
    * `/orders/:orderId` -> `<OrdersQueueManager>` (deep link with auto-expansion and search synchronization)
    * `/booth-studio/:orderId?` -> `<BoothStudioRouteWrapper>` -> `<BoothMemoryStudio>`
    * `/invitation-studio/:orderId?` -> `<InvitationStudioRouteWrapper>` -> `<InvitationStudio>`
    * `*` -> `<Navigate to="/overview" replace />`
* **File:** `d:\asar\apps\Admin\src\components\layout\AdminShell.tsx` (Lines 23–52, 140–200)
  * Active navigation tabs: `overview`, `plans`, `orders`, `booth-studio`, `invitation-studio`.
  * Top navigation bar displays quick ecosystem links to port 3000 (`Main Hub`), port 3002 (`Booth App`), and port 3003 (`Invitation App`).

### 1.2 Memory Plan & Template Management (`PlanBuilderStudio.tsx`)
* **File:** `d:\asar\apps\Admin\src\components\plans\PlanBuilderStudio.tsx` (Lines 5–46, 47–150)
  * Data Models:
    * `AsarPlan`: `$id`, `serviceType` (`"booth" | "invitation"`), `name`, `subtitle`, `badge`, `subBadge`, `price`, `currency`, `depositRequired`, `themeVariant` (`"ivory-royal" | "noir-obsidian"`), `featuresJson` (stringified string[]), `addonsJson` (stringified `AsarPlanAddon[]`), `limitsJson` (stringified `AsarPlanLimits`), `isActive` (boolean), `sortOrder` (number).
    * `AsarPlanLimits`: `coverageHours`, `maxVoiceRecords` (-1 for unlimited), `maxGalleryPhotos` (-1 for unlimited), `maxCustomCategories`, `hasVideoHighlight` (boolean), `hasGuestBookTab` (boolean), `allowBulkZipDownload` (boolean), `hostingDurationDays`, `maxRsvpCapacity`.
  * Seed Plans:
    * `plan-booth-classic`: 4500 EGP, 80 voices, 20 photos, 4 categories, no video highlight, 365 days hosting.
    * `plan-booth-royal-vip`: 8500 EGP, -1 (unlimited) voices, 100 photos, 8 categories, video highlight enabled, 730 days hosting.
    * `plan-invitation-prestige`: 3200 EGP, 350 max capacity, 180 days hosting.
  * Persistence: Syncs to `localStorage` key `"asar_synced_plans"` and Appwrite DB collection `"plans"`.

### 1.3 Booth Memory Studio & Management (`BoothMemoryStudio.tsx`)
* **File:** `d:\asar\apps\Admin\src\components\booth-studio\BoothMemoryStudio.tsx` (Lines 131–281, 510–627)
  * Top Action Bar: Active Order Selector, Plan Quota Meter (`maxVoices`, `maxPhotos`, `hasVideoHighlight`), and `"Override Quota"` VIP switch (`overrideQuota`).
  * Action Buttons:
    1. `"📥 Pull Client Submitted Assets"` -> auto-hydrates hero image, couple title, date, location, badge, quote, thank-you note, and categories from `activeOrder.submittedAssets`.
    2. `"📱 Generate & Download Landing QR"` -> switches to tab `thankyou_qr`.
    3. `"🚀 Save & Publish Memory Website"` -> validates slug via `validateSubdomainSlug`, validates quotas, writes to cache keys (`asar_booth_memories_cache`, `asar_booth_voices_cache`, `asar_booth_media_cache`), sets `isPublished: true`, and computes canonical/dev URLs via `buildMemoryUrls`.
  * 4 Workspace Tabs:
    1. `hero` (`HeroAndTextsEditor.tsx`): URL slug, couple title, overline tag, tagline, date, location, badge, personal quote, hero photograph upload (`heroImageUrl`), audio categories manager, 4-digit PIN lock (`isPrivateLocked`, `accessPinCode`).
    2. `voices` (`BulkVoiceUploader.tsx` + `VoiceBatchGridEditor.tsx`): Bulk audio dropzone, smart filename parser, 48-peak waveform extraction via Web Audio API, spreadsheet batch grid.
    3. `media` (`MediaAndTabsEditor.tsx`): Photo gallery uploader with captions (enforcing `maxPhotosQuota`), 30s video highlight embed URL / file upload, guestbook written notes manager.
    4. `thankyou_qr` (`MediaAndTabsEditor.tsx`): Couple's thank you message and print-ready reception table QR card generator (pointing to `memoryUrls.canonicalUrl` with PNG download).
  * Right Column: `LiveMemoryMobilePreview.tsx` displaying an interactive iPhone 15 Pro bezel with live mirroring of audio playback, category filters, photos, video highlight, guestbook, and PIN padlock.

### 1.4 Invitation Studio & Management (`InvitationStudio.tsx`)
* **File:** `d:\asar\apps\Admin\src\components\invitation-studio\InvitationStudio.tsx` (Lines 132–358, 498–653, 897–1045)
  * Controls: Demo order switcher (`ORD-915` wedding, `ORD-916` gala, `ORD-917` festival), occasion type switcher (`wedding`, `engagement`, `festival`, `gala`, `corporate`, `graduation`), `maxCapacity` numeric input, and `slug` text input.
  * Action Buttons:
    1. `"📥 Apply Client Requests"` -> applies client requested details and generates dynamic RSVP fields from request text.
    2. `"📱 Generate QR"` -> displays modal with high-res QR pointing to `invitationUrls.canonicalUrl` with copy link button.
    3. `"🚀 Save & Publish"` -> validates slug via `validateSubdomainSlug`, validates form schema via `validateFormSchema`, sets `isPublished: true`, updates `localStorage` (`asar_invitations_cache`, `asar_active_invitation`), and synchronizes to Appwrite DB collection `"invitations"`.
  * 3 Builder Tabs:
    1. `theme` (`ThemeAndEffectsPanel.tsx`): Presets (`royal-wedding`, `midnight-gala`, `mediterranean-garden`, `cultural-festival`), custom palette (primary, secondary, bg, text, accent), fonts (`Amiri`, `Playfair Display`, `Cairo`), text direction (`rtl`, `ltr`, `bilingual`), hero shaders (`GradientWaves`, `DitherVeil`, `MinimalEditorial`), cursor effects (`SplashCursor`, `GlowCursor`, `None`), particles toggle.
    2. `sections` (`SectionBlocksManager.tsx`): Reorderable and toggleable page blocks: `hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, and locked `rsvp_form`.
    3. `form` (`DynamicFormSchemaBuilder.tsx`): Dynamic RSVP Form schema builder.
       * Mandatory locked system fields: `guestName` (text, required: true, isSystemLocked: true) and `guestEmail` (email, required: true, isSystemLocked: true).
       * Custom dynamic field types: `text`, `email`, `tel`, `number`, `select`, `radio`, `checkbox`, `textarea`.
       * Enforced via `validateFormSchema()` and `enforceMandatoryEmailConstraint()`.
  * Right Column: `LiveInvitationPreview.tsx` with mobile/desktop viewport toggle, live countdown ticker, and interactive RSVP test submission.

### 1.5 Shared Storefront Subdomain Engine
* **Files:** `packages/react-appwrite/src/Storefront/subdomain.ts`, `urlBuilder.ts`, `useSubdomain.ts`
  * `RESERVED_SUBDOMAINS`: 16 reserved system names (`admin`, `api`, `booth`, `main`, `invitation`, `app`, `cdn`, `mail`, `auth`, `dev`, `staging`, `test`, `www`, `storefront`, `status`, `account`).
  * `validateSubdomainSlug(slug)`: Enforces RFC 1123 rules (1–63 chars, lowercase alphanumeric and hyphens, no leading/trailing hyphens, no reserved names).
  * `buildMemoryUrls({ slug, type, port, isDev, rootDomain })`: Generates:
    * `canonicalUrl`: `https://${slug}.${rootDomain || "asar.me"}`
    * `devLocalhostUrl`: `http://${slug}.localhost:${port}`
    * `devQueryUrl`: `http://localhost:${port}?subdomain=${slug}`
  * `useSubdomain()`: 4-tier resolution hierarchy: Query Param -> Route Param -> Hostname -> Fallback.

---

## 2. Logic Chain

1. **Storefront Storefront Paradigm vs Admin Curation:**
   * ASAR operates as a multi-tenant experiential platform where each couple or event has a unique subdomain (`[subdomain].asar.me`).
   * The Admin console (`apps/Admin`) is the single authoring tool where memory websites and dynamic invitations are curated, themed, and published.
2. **Introduction of Dedicated Dynamic Renderer App under `apps/`:**
   * Per `ORIGINAL_REQUEST.md` (§R2 & §R3), a new dedicated application is introduced under `apps/` to act as the runtime storefront renderer for both Booth and Invitation memories.
   * To maintain seamless alignment:
     * **Data Model Unity:** The renderer app will consume the exact same Appwrite collections (`booth_memories`, `invitations`) and localStorage fallback caches (`asar_booth_memories_cache`, `asar_invitations_cache`) created by `apps/Admin`.
     * **URL Generation Contract:** When Admin generates canonical URLs and QR codes via `buildMemoryUrls`, the canonical production URL is `https://${slug}.asar.me`, which is routed by DNS/proxy directly to the dedicated renderer app.
     * **Local Development Port Alignment:** In local development, the dedicated renderer app will run on its designated Vite port (e.g., `http://localhost:<RENDERER_PORT>`). `buildMemoryUrls` must support generating preview URLs pointing to this renderer port for both Booth and Invitation memories.
     * **Publish & Privacy Gate:** The dynamic renderer app must respect the Admin publish toggle (`isPublished === true`) and the 4-digit PIN security lock (`isPrivateLocked` & `accessPinCode`).
3. **Admin Studio Integrity Preservation:**
   * The existing split-screen live previews in Admin (`LiveMemoryMobilePreview.tsx` and `LiveInvitationPreview.tsx`) use component state passed directly via React props. These previews operate independently of external HTTP ports, ensuring zero regression while editing.
   * External preview buttons ("Open Live Storefront ↗", "Dev Test Link ↗") and QR cards in Admin rely on `buildMemoryUrls`, which must link to the canonical subdomain and the dynamic renderer app.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Admin Routing | Declarative Route Hierarchy | React Router v6 tree with parameterized routes for deep-linking into specific orders and studios | URL path (`/overview`, `/plans`, `/orders`, `/orders/:orderId`, `/booth-studio/:orderId?`, `/invitation-studio/:orderId?`) | Rendered views within `AdminShell` | Unmatched paths redirect to `/overview` | `apps/Admin/src/App.tsx:298-350` |
| 2 | Plan Management | Dynamic Plan Limits & Quotas | Configures service quotas for Booth and Invitation plans | `AsarPlanLimits` (`maxVoiceRecords`, `maxGalleryPhotos`, `hasVideoHighlight`, `maxRsvpCapacity`, etc.) | Synced plan definitions in state and `localStorage` | Rejects non-array features/addons JSON | `apps/Admin/src/components/plans/PlanBuilderStudio.tsx:5-150` |
| 3 | Order Pipeline | 7-Stage Order Lifecycle | State machine governing order progression from payment receipt check to live publication | `orderStatus` transitions (`pending_payment` -> `awaiting_client_assets` -> ... -> `published`) | Updated order state, badges, and client action triggers | Invalid regressions rejected per state machine rules | `apps/Admin/src/components/orders/OrdersQueueManager.tsx:28-84` |
| 4 | Order Inspection | Receipt Zoom Lightbox & Verifier | Visual inspection tool for manual transfer screenshots (InstaPay, Vodafone Cash, Bank Transfer) with approve/reject workflow | Payment screenshot URL, zoom level, rotation angle, rejection reason | Transition order to `awaiting_client_assets` (approve) or `payment_rejected` (reject) | Alert if reject clicked without entering reason | `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx:20-95` |
| 5 | Booth Studio | Subdomain Slug Validation | Validates website URL slug against RFC 1123 DNS specification and 16 reserved system subdomains | `memory.slug` (string) | `{ isValid: boolean, error?: string }` | Red input border, warning banner, blocks publication | `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx:46, 128-147` |
| 6 | Booth Studio | One-Click Client Asset Hydration | Populates Hero image, couple names, date, venue, badge, quote, and categories from client portal submission | `activeOrder.submittedAssets` | Populated `BoothMemory` state, success toast notification | Silently ignores missing optional asset fields | `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx:206-228` |
| 7 | Booth Studio | Bulk Voice File & Folder Dropzone | Drag-and-drop ingestion of 50–150+ audio tracks with auto-folder category assignment | Audio files (`.mp3`, `.wav`, `.m4a`) or folder drops | Appended `BoothVoiceRecord[]` records | Fallback category "Friends" assigned if folder unknown | `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx:1-120` |
| 8 | Booth Studio | Smart Voice Filename Parser | Extracts category, speaker name, and relationship role from filename patterns | Filename string (e.g. `Friends_Nour Hassan_Best Friend.mp3`) | `{ speakerName, speakerRole, category }` | Generates numbered fallback metadata if unparseable | `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx:27-100` |
| 9 | Booth Studio | Web Audio Waveform Peak Extractor | Real-time browser audio decoding extracting duration and 48-point normalized float peaks | Audio `File` or `Blob` | `durationFormatted` ("0:42") and `waveformPeaks` (48 floats `[0.15..1.0]`) | Deterministic pseudo-random peaks generated if audio context fails | `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx:150-250` |
| 10 | Booth Studio | Spreadsheet Batch Grid Editor | Fast keyboard-navigable inline grid for editing speaker names, roles, quotes, categories, and auditioning audio | User keystrokes (Tab, Enter, arrows), category dropdown selection | Updated `BoothVoiceRecord[]` array | Prevents empty speaker names | `apps/Admin/src/components/booth-studio/VoiceBatchGridEditor.tsx:1-200` |
| 11 | Booth Studio | Plan Quota Enforcement & VIP Override | Tracks active track and photo counts against plan limits, with optional VIP override switch | `voiceRecords.length`, `mediaItems.length`, `overrideQuota` | Warning badge indicator; blocks publication if exceeded and override is off | Warning notification: "Plan quota exceeded! Toggle Override Quota" | `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx:195-247` |
| 12 | Booth Studio | Photo Gallery & Video Highlight Curation | Curates high-res photos and links 30s video highlight reel | Image files, video embed URL / video file | Updated `BoothMediaItem[]` and `videoHighlightUrl` | Image quota capped at `maxPhotos` | `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:56-78, 248-333` |
| 13 | Booth Studio | Private PIN Protection | Locks memory page behind a 4-digit security PIN | `isPrivateLocked` (boolean), `accessPinCode` (string) | Padlock emblem on mobile preview, PIN required on storefront | Non-digit characters stripped, capped at 4 digits | `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx:482-556` |
| 14 | Booth Studio | Reception Table QR Kit Generator | Generates print-ready QR code card pointing to canonical subdomain URL with PNG download | `memoryUrls.canonicalUrl` | Downloadable high-res PNG file (`Athar_Table_QR_[slug].png`) | Fallback opens raw QR image in new tab if download fails | `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:97-115, 450-555` |
| 15 | Booth Studio | Live iPhone 15 Pro Bezel Preview | Sticky mobile mirror running full interactive memory experience with category filtering and audio playback | `memory`, `voiceRecords`, `mediaItems` | Interactive mobile mockup updating in real time | Gracefully handles empty audio or photo lists | `apps/Admin/src/components/booth-studio/LiveMemoryMobilePreview.tsx:13-100` |
| 16 | Invitation Studio | Bespoke Theme & Palette Presets | Four luxury occasion theme presets (`royal-wedding`, `midnight-gala`, `mediterranean-garden`, `cultural-festival`) with custom shader/cursor effects | Selected preset or custom hex codes / fonts | `InvitationThemeConfig` state | Fallbacks to `royal-wedding` if unknown preset | `apps/Admin/src/components/invitation-studio/ThemeAndEffectsPanel.tsx:24-125` |
| 17 | Invitation Studio | Composable Page Sections Manager | Toggle visibility and reorder modular page blocks (`hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, `rsvp_form`) | `InvitationSectionBlock[]` | Configured blocks JSON for renderer hydration | `rsvp_form` block is locked (`isLocked: true`) and cannot be deleted | `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx:24-140` |
| 18 | Invitation Studio | Dynamic RSVP Form Schema Builder | Add/edit custom form fields for guest data collection | `DynamicFormField[]` (type, label, placeholder, required, options) | Validated `formSchemaJson` | Rejects schema if `guestEmail` or `guestName` is missing/unlocked | `apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx:29-146` |
| 19 | Invitation Studio | Mandatory Locked Email Enforcement | Guarantees that `guestEmail` is always present, typed as "email", and marked required | `DynamicFormField[]` | Enforced schema with locked email field | Auto-injects system email field if omitted | `apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx:119-146` |
| 20 | Invitation Studio | One-Click Client Request Generator | Translates natural language client requests (e.g., "WhatsApp, companions, dietary") into typed form fields | `requestedFields` array of strings | Appended typed dynamic form fields | Uses text type fallback for unrecognized requests | `apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx:151-220` |
| 21 | Invitation Studio | Live Guest Viewport Preview | Split-screen preview with mobile/desktop switcher, live countdown, and interactive RSVP submission | `themeConfig`, `blocks`, `formFields` | Real-time visual mirroring of custom event website | Validates required fields before simulated submission | `apps/Admin/src/components/invitation-studio/LiveInvitationPreview.tsx:13-140` |
| 22 | Invitation Studio | Canonical Invitation QR Modal | Displays modal with high-res QR pointing to `invitationUrls.canonicalUrl` with clipboard copy link | `invitationUrls.canonicalUrl` | Visual QR card with one-click clipboard copy | Toast notification confirms clipboard write | `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx:897-1045` |
| 23 | Shared Engine | Centralized Storefront URL Builder | Computes canonical production URL, RFC 6761 dev localhost URL, and query fallback URL | `{ slug, type: "booth" | "invitation", port, isDev, rootDomain }` | `MemoryUrls` (`canonicalUrl`, `devLocalhostUrl`, `devQueryUrl`, `isSubdomain`) | Returns bare apex/localhost URL if slug is empty | `packages/react-appwrite/src/Storefront/urlBuilder.ts:28-58` |
| 24 | Shared Engine | 4-Tier Subdomain Resolution Hook | Pure React hook resolving active subdomain across query, route param, hostname, and fallback | `UseSubdomainOptions` (`routeParam`, `searchParams`, `rootDomains`) | `{ subdomain, isSubdomain, source }` | Returns null if hostname matches reserved list or bare apex | `packages/react-appwrite/src/Storefront/useSubdomain.ts:87-160` |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Subdomain Validation | `slug = "admin"` or any reserved name (`api`, `booth`, `main`, `invitation`, `app`, `cdn`, `mail`, `auth`, `dev`, `staging`, `test`, `www`, `storefront`, `status`, `account`) | `validateSubdomainSlug` returns `isValid: false`, `error: "Subdomain 'admin' is reserved and cannot be used."` Admin publish button halts and displays warning. |
| 2 | Subdomain Validation | `slug = "-wedding-2026-"` (leading/trailing hyphens) | Returns `isValid: false`, `error: "Subdomain slug cannot start or end with a hyphen."` Input sanitization strips invalid characters. |
| 3 | Subdomain Validation | `slug = "Mina & Maryam!"` (uppercase, spaces, special chars) | Sanitizer automatically transforms input to `mina---maryam-`. If validation runs on raw string, fails RFC 1123 regex. |
| 4 | Subdomain Validation | Slug exceeding 63 characters | Returns `isValid: false`, `error: "Subdomain slug cannot exceed 63 characters (RFC 1123)."` |
| 5 | Quota Enforcement | Voice count = 85, Plan `maxVoiceRecords` = 80, `overrideQuota` = false | Quota badge displays `(Exceeded)` in red. `handleSaveAndPublish` aborts with warning toast: "⚠️ Plan quota exceeded! Please remove excess tracks or toggle 'Override Quota (VIP)'." |
| 6 | Quota Enforcement | Voice count = 85, Plan `maxVoiceRecords` = 80, `overrideQuota` = true | Quota warning is bypassed; publication completes successfully. |
| 7 | Dynamic Form Schema | Admin attempts to remove or make `guestEmail` optional (`required: false`) | `validateFormSchema` returns `isValid: false`, `errors: ["Mandatory system field 'guestEmail' must be marked as required."]`. `enforceMandatoryEmailConstraint` resets `required: true` and `isSystemLocked: true`. |
| 8 | Dynamic Form Schema | Empty option list for `select`, `radio`, or `checkbox` field | `validateFormSchema` returns `isValid: false`, `errors: ["Field '[Label]' ([Type]) must have at least one option."]`. Publish is aborted and tab switches to "form". |
| 9 | Audio Waveform Extraction | Corrupted or non-audio file dropped into bulk uploader | `AudioContext.decodeAudioData` throws error. Component catches failure and invokes `generateDeterministicWaveform` to generate a 48-peak synthetic wave so UI never crashes. |
| 10 | Security PIN Lock | Admin enables PIN lock but enters letters or >4 digits (e.g. `12345abc`) | Input handler sanitizes with `.replace(/\D/g, "").slice(0, 4)`, constraining input strictly to 4 numeric digits. |
| 11 | QR Code Download | Offline or CORS blocked fetch on `https://api.qrserver.com` | Catch block triggers fallback: `window.open(qrCodeApiUrl, "_blank")`, opening the image in a new tab for manual saving. |
| 12 | Appwrite Network Disconnect | Appwrite database service unreachable when publishing | Try/catch block catches error, commits payload to `localStorage` caches (`asar_booth_memories_cache`, `asar_invitations_cache`), and displays success toast: "Saved locally! Live synchronization complete." |
| 13 | Local Subdomain Resolution | Browser navigates to `http://mina-and-maryam.localhost:3002` | `extractSubdomain` parses `*.localhost` per RFC 6761, returning `"mina-and-maryam"`. Loopback resolves natively without `/etc/hosts` modifications. |
| 14 | Query Parameter Override | Browser navigates to `http://localhost:3002?subdomain=mina-and-maryam` | `useSubdomain` extracts `"mina-and-maryam"` from query string with priority 1 (overriding bare hostname). |

---

## 5. Alignment Requirements with the New Dedicated Dynamic Renderer App

When the new dedicated renderer application is established under `apps/` (e.g. `apps/renderer` or `apps/storefront`):

1. **Subdomain Storefront Contract:**
   * In production, all subdomains (`https://[subdomain].asar.me` or `https://[subdomain].asar.audio`) resolve directly to the dedicated renderer app.
   * In local development, the dedicated renderer app runs on its assigned Vite port (e.g., port 3004).
   * The dedicated renderer app will inspect the active subdomain using `useSubdomain()` and determine whether the requested slug belongs to:
     * A **Booth Memory** (`BoothMemory`): Renders `BoothMemoryPage` with audio waveform player, category pills, photo gallery, 30s video banner, guestbook, and PIN padlock.
     * An **Invitation Memory** (`AsarInvitation`): Renders `CustomEventPage` with dynamic theme config, WebGL shaders (`GradientWaves`, `DitherVeil`), composable section blocks, and dynamic RSVP form.
     * **Not Found / Unpublished**: Renders the luxury branded 404 screen.
2. **Admin URL Builder Alignment:**
   * `buildMemoryUrls` in `packages/react-appwrite/src/Storefront/urlBuilder.ts` currently targets port 3002 for booth and 3003 for invitation.
   * When linking to local dev previews from Admin, `buildMemoryUrls` can be configured or parameterized with the dedicated renderer app's port so that:
     * "Open Live Storefront ↗" -> `https://${slug}.asar.me` (canonical production)
     * "Dev Test Link ↗" -> `http://${slug}.localhost:${rendererPort}` (or `http://localhost:${rendererPort}?subdomain=${slug}`)
     * Reception QR codes and Invitation QR passes point to the canonical URL `https://${slug}.asar.me`.
3. **Data Model Compatibility:**
   * Both `apps/Admin` and the new renderer app must import domain models and helpers from `@repo/react-appwrite`:
     * `BoothMemory`, `BoothVoiceRecord`, `BoothMediaItem`
     * `AsarInvitation`, `InvitationThemeConfig`, `InvitationSectionBlock`, `DynamicFormField`
     * `extractSubdomain`, `useSubdomain`, `validateSubdomainSlug`, `buildMemoryUrls`
   * Persistence parity: The renderer app must read from Appwrite database `asar-db` (collections: `booth_memories`, `invitations`, `booth_voice_records`, `booth_media`) and respect fallback `localStorage` cache keys (`asar_booth_memories_cache`, `asar_invitations_cache`).
4. **Publish Status & Privacy Lock Enforcement:**
   * The renderer app MUST verify `isPublished === true`. Unpublished drafts must not be visible to guests.
   * If `isPrivateLocked === true`, the renderer app must gate the content behind a PIN entry modal verifying `accessPinCode`.

---

## 6. Caveats

* **Localhost Port Allocation:** The specific port number for the new dedicated renderer app (e.g., 3004) will be set when the app package is created under `apps/`. Currently `apps/Booth` runs on 3002 and `apps/Invitation` runs on 3003.
* **Appwrite Cloud Provisioning:** In offline or development modes without active Appwrite server credentials, both Admin and the renderer rely on localStorage cache synchronization (`asar_booth_memories_cache`, `asar_invitations_cache`), which operates transparently.

---

## 7. Conclusion

`apps/Admin` has a fully developed, highly resilient memory template and curation suite across both services:
* **Booth Memories:** Comprehensive 4-tab studio with client asset hydration, bulk audio upload with real-time waveform extraction, inline spreadsheet grid, photo/video curation, plan quota meters with VIP override, 4-digit PIN locking, and reception table QR card generation.
* **Invitation Memories:** 3-tab studio with 4 luxury occasion presets, composable block manager, dynamic RSVP form schema builder with locked mandatory email, and VIP invitation QR pass generation.
* **Storefront Engine Integration:** Subdomain validation strictly enforces RFC 1123 DNS rules and 16 reserved system subdomains. Centralized URL generation via `buildMemoryUrls` guarantees canonical production URLs (`https://${slug}.asar.me`) and RFC 6761 dev URLs (`http://${slug}.localhost`).
* **Alignment with New Renderer:** Admin is architecturally primed for seamless integration with the dedicated dynamic renderer app, needing only renderer port routing in development, while production canonical URLs, QR codes, and shared `@repo/react-appwrite` domain schemas remain 100% consistent.

---

## 8. Verification Method

To independently verify all findings and specifications:

1. **Inspect Admin Route Structure:**
   ```powershell
   # View Admin declarative route hierarchy in apps/Admin/src/App.tsx
   Get-Content -Path "d:\asar\apps\Admin\src\App.tsx" | Select-String -Pattern "Route path"
   ```
2. **Inspect Subdomain Validation & URL Builder Integration:**
   ```powershell
   # Check validateSubdomainSlug and buildMemoryUrls usage in Admin Booth Studio
   Get-Content -Path "d:\asar\apps\Admin\src\components\booth-studio\HeroAndTextsEditor.tsx" | Select-String -Pattern "validateSubdomainSlug|buildMemoryUrls"
   # Check validateSubdomainSlug and buildMemoryUrls usage in Admin Invitation Studio
   Get-Content -Path "d:\asar\apps\Admin\src\components\invitation-studio\InvitationStudio.tsx" | Select-String -Pattern "validateSubdomainSlug|buildMemoryUrls"
   ```
3. **Execute Automated Storefront & Dynamic Form Tests:**
   ```powershell
   # Run node test suite for Storefront Subdomain Engine
   node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts
   # Run node test suite for Admin Form Schema Validation & Email Lock
   node --experimental-strip-types --test apps/Admin/test/formSchemaValidation.test.ts
   # Run node test suite for Admin Adversarial Stress & Order Transitions
   node --experimental-strip-types --test apps/Admin/test/adversarialStress.test.ts
   ```
4. **Inspect Reserved Subdomains Guard:**
   View `packages/react-appwrite/src/Storefront/subdomain.ts` lines 6–23 to verify all 16 reserved names.
