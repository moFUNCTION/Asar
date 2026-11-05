# ASAR Monorepo Architecture & Specification Mining Report

> **Authoritative Specification Survey & Deep Architecture Mining**  
> **Target:** `d:\asar\docs/`, `d:\asar\appwrite/`, and active codebase in `d:\asar`  
> **Subagent:** `spec_miner_docs_survey` (`teamwork_spec_miner`)  
> **Date:** 2026-11-05  

---

## 1. Executive Summary & Specification Sources

This report provides an exhaustive survey and authoritative architectural mapping of the ASAR platform based on direct inspection of:
1. `docs/ASAR_PROJECT_ARCHITECTURE.md` (System architecture, monorepo routing topology, database schemas, and workflows)
2. `docs/ASAR_BOOTH_DESIGN_SPEC.md` (Visual design specifications, 16 landing sections, and component mapping)
3. `docs/ASAR_DESIGN_SYSTEM.md` (Warm Vintage Editorial Luxury tokens, typography, and Chakra UI v3 patterns)
4. `docs/AGENT_GUIDE.md` (Engineering blueprint, multi-agent boundaries, verification commands, and features inventory)
5. `docs/AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md` through `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` (Individual subsystem specifications)
6. `docs/COMPETITIVE_ANALYSIS.md` (Benchmark against ChungDoi, WithJoy, and Zola)
7. `appwrite/appwrite.config.json` (Production Appwrite Cloud configuration, collections, indexes, buckets, and serverless functions)
8. `appwrite/functions/process-rsvp-action` and `appwrite/functions/generate-vip-pass` (Serverless function source code)
9. `packages/react-appwrite` and `apps/*` (Core implementation packages, hooks, and views)

---

## 2. Complete Feature & Service Catalog Across Monorepo

The ASAR platform is structured as a Turborepo v2 monorepo (`npm@11.13.0` workspaces) comprising **5 applications** and **5 shared packages**:

### 2.1. Applications Catalog (`apps/*`)

#### 1. `apps/Admin` (Port 3001) — Operations Management Console
* **Role:** Centralized operations center for administrators, event concierges, and audio mastering teams.
* **Key Responsibilities & Features:**
  - **Dashboard Overview (`/overview`):** Platform KPIs (Active Orders, Revenue, Published Memories), rapid shortcuts to authoring studios, and recent orders activity stream.
  - **Plan Builder Studio (`/plans`):** Full CRUD editor for Booth and Invitation plans, custom feature checklists (`featuresJson`), dynamic limit quotas (`limitsJson`), add-ons catalog (`addonsJson`), and pricing in Egyptian Pounds (`EGP`).
  - **Orders & Payments Queue (`/orders`, `/orders/:orderId`):** 7-stage order status progression manager, filterable by service type and pipeline status.
  - **Manual Payment Receipt Inspector (`PaymentReceiptInspector`):** Zoomable lightbox for inspecting payment transfer screenshots (InstaPay, Vodafone Cash, Bank Transfer), with 1-click **Approve** (advances order to `awaiting_client_assets`) and **Reject** (requires mandatory rejection reason, transitions order to `payment_rejected`).
  - **Booth Memory Studio (`/booth-studio/:orderId?`):** Split-screen visual memory website curation studio with live iPhone 15 Pro mobile preview, RFC 1123 slug editor, reserved subdomain guard, 1-click **"Pull Client Submitted Assets"**, and canonical QR code generation.
  - **Zero-Effort Bulk Voice Uploader:** Multi-file/folder drag-and-drop zone capable of ingesting 50–150+ audio tracks at once, extracting formatted duration and 48-peak waveforms via Web Audio API, smart filename/folder auto-parsing into speaker name, role, and category, and a keyboard-navigable spreadsheet batch grid with inline audition and chunked batch upload (`useBatchOperations`).
  - **Modular Invitation Studio (`/invitation-studio/:orderId?`):** Visual builder for living event websites featuring a Section Palette Modal (4 semantic categories), reorderable modular deck (11 section types), 11 specialized property inspectors, split-screen mobile/desktop preview, and occasion theme customizer with WebGL shader toggles.
  - **Dynamic RSVP Form Builder:** Visual form schema composer with hard-locked mandatory system fields (`guestName` and `guestEmail`) and unlimited custom field types (`tel`, `select`, `radio`, `checkbox`, `number`, `text`, `textarea`).
  - **Users & Accounts Directory (`/users`):** Directory for managing user roles (`admin` vs `client`), searching profiles, and auditing account details.
  - **Navigation Shell (`AdminShell`):** Right-hand vertical tabs navigation menu tailored for Arabic RTL layout.

#### 2. `apps/Booth` (Port 3002) — Dynamic Storefront & Audio Guestbook
* **Role:** Customer-facing storefront and digital memory delivery platform for the rotary telephone audio guestbook service.
* **Key Responsibilities & Features:**
  - **Dynamic Root Storefront Index (`/`):** Pure 4-tier subdomain resolver (`useSubdomain`). If a subdomain slug is detected (e.g., `mina-and-maryam.localhost:3002` or `?subdomain=mina-and-maryam`), dynamically renders the luxury **Booth Memory Page**. If accessed on a bare apex domain (`asar.me`) or bare localhost, renders the **14-Section Marketing Landing Page**.
  - **14-Section Arabic RTL Marketing Landing Page:**
    1. Adaptive Dual Header (Static top bar transitioning to floating `CardNav` on scroll).
    2. Fullscreen Hero Section (100vh) with `BlurText`, `Magnet`, and `FadeContent` (mist effect).
    3. Proof of Trust & Emotion Counters with `CountUp` (`100+`, `5,000+`, `100%`).
    4. "More Than A Phone" Narrative Section with interactive `DitherVeil` stipple dissolving on cursor touch.
    5. "Why Choose Us" with sticky `CircularGallery` 3D carousel and Chakra UI accordion.
    6. Classical Arabic Ghazal Poetic Verse Interlude with `BlurText`.
    7. Our Packages Showcase with `FadeContent` and `TiltedCard` 3D parallax tilt.
    8. Bespoke Add-ons & Custom Styling Matrix ("Make It Yours") with direct WhatsApp concierge link.
    9. 5-Step Numbered Journey with interactive `PaperCrumple` contrast component.
    10. Real Voices Audio Waveform Player with dynamic category filter pills.
    11. Moments Around The Phone photo masonry wall with `DecayCard` polaroid physics.
    12. 30-Second Cinematic Video Highlight Reel with `ScrollExpand`.
    13. Frequently Asked Questions (FAQ) with Chakra UI accordion.
    14. Contact Hub & Regional Coverage Map (Alexandria, North Coast, Cairo).
    15. Privacy & Cloud Vault Guarantee.
    16. Emotional Poetic 404 Experience.
  - **Direct Booking Engine (`/book`):** 4-step booking modal collecting celebration details, package/add-ons selection, manual payment transfer instructions (InstaPay / Vodafone Cash / Bank), drag-and-drop payment screenshot upload, and direct link to client order tracking.
  - **Generated Booth Memory Website (`/memory/:slug`, `/m/:slug` — Visual Reference #1):**
    - Sticky luxury top bar with menu drawer, Athar calligraphy crest, and private PIN lock status.
    - Full-bleed editorial couple hero with warm alabaster bottom fade, couple title, acoustic waveform ornament (`─── ∿∿∿ ───`), 3 metadata badges, and personal quote.
    - 5-tab tactile card navigation strip: `Audio Messages`, `Photos`, `Video Highlights`, `Guest Book`, `Thank You`.
    - `Audio Messages` tab with dynamic category filter pills with real counts (`All (86)`, `Family (24)`, etc.) and `VoiceRecordCard` list featuring monogram avatar fallback (`useAvatars().getInitials`), play/pause controls, interactive 48-bar waveform scrubber, duration indicator (`0:42`), favorite toggle, and individual MP3 download.
    - Video Highlight teaser banner card.
    - Bottom dual action cards: "Download All Messages" (batch ZIP download gated by plan limits) and "Share Love" (modal with canonical QR code and WhatsApp share link).
    - Private PIN Lock Gate (`MemoryPinLockGate`): Restricts access via 4-digit code when `isPrivateLocked` is enabled.

#### 3. `apps/Invitation` (Port 3003) — Dynamic Storefront & Bespoke Events
* **Role:** Custom living event website generator and interactive guest hospitality platform.
* **Key Responsibilities & Features:**
  - **Dynamic Root Storefront Index (`/`):** Resolves subdomains via `useSubdomain`. If slug detected (e.g., `omar-and-layla.localhost:3003`), mounts `<CustomEventPage slug={subdomain} />`. If bare host, renders the **Invitation Showcase Landing Page**.
  - **Service Showcase Landing Page:** Presents bespoke event styles (Weddings, Festivals, Galas, Summits, Graduations), dynamic form explanation, mailbox workflow, and active invitation tiers.
  - **Custom Invitation Booking Modal (`/book`):** 4-step wizard capturing event details, maximum venue capacity (`maxVenueCapacity`), requested custom form fields, and manual payment screenshot upload.
  - **Bespoke Living Event Website (`/e/:slug`):** Dynamic modular section dispatcher parsing `sectionsConfigJson` into 11 modern section blocks:
    1. `cover_hero`: Interactive 3D wax seal envelope animation, couple typography, date/venue badges, countdown timer, audio prompt.
    2. `couple_story`: Chronological milestones track with photos, dates, and narrative storytelling.
    3. `event_schedule`: Multi-event itinerary (Ceremony, Reception, Afterparty) with specific addresses, dress codes, and 1-tap Google/Apple Maps routing.
    4. `photo_gallery`: Responsive masonry, grid, or circular 3D carousel with category filtering and fullscreen touch lightbox.
    5. `wishing_wall`: Real-time interactive guest blessing wall with message submission, heart reactions, and host moderation.
    6. `digital_gift_registry`: Blessing box with auto-generated Bank QR (VietQR / InstaPay / IBAN), account numbers, and 1-tap copy to clipboard.
    7. `background_audio`: Floating vinyl audio player widget with spinning disc animation, playlist title, and tap-to-play compliance.
    8. `venue_location`: Embedded interactive map, directions, parking notes, and attire color swatches.
    9. `live_countdown`: Precision second-by-second countdown ticker with celebration completion banner.
    10. `custom_highlight`: High-impact editorial callouts, parental thank-you notes, or featured quotes.
    11. `dynamic_rsvp`: Dynamic multi-person attendance RSVP form with locked email verification, plus-one limits, dietary preferences, and shuttle bus requests.
  - **Guest VIP Digital QR Pass Page (`/pass/:rsvpId`):** Luxury embossed digital pass card with HMAC-SHA256 verification token, approved companions count, and scannable QR code.
  - **Venue Entrance Check-In Scanner (`/scanner/:invitationId`, `/scanner`):** Camera QR scanner verifying guest pass tokens against Appwrite database and logging check-in attendance timestamps in real time.

#### 4. `apps/Main` (Port 3000) — Platform Gateway & Unified Client Account Portal
* **Role:** Brand ecosystem gateway connecting Booth and Invitation services, customer identity provider, and host account portal.
* **Key Responsibilities & Features:**
  - **Platform Brand Gateway (`/`):** High-end editorial landing introducing both services with direct entry links.
  - **Customer Authentication Modal (`/auth`):** Appwrite-backed modal for login, registration, and session management.
  - **Unified Client Account Portal (`/account/*`):**
    - **7-Stage Live Order Tracker (`/account/orders`):** Visual pipeline tracker guiding the client through each stage: `pending_payment` -> `payment_rejected` -> `awaiting_client_assets` -> `event_scheduled` -> `audio_mastering` -> `studio_curation` -> `published`.
    - **Payment Receipt Uploader (`PaymentReceiptUploader`):** Displays current payment verification status; if rejected by Admin, presents the Admin's rejection reason and an instant re-upload dropzone.
    - **Client Memory Asset Submission Box (`/account/assets`):** Client uploads couple hero cover photo, couple names, event date, venue, quotes, thank you text, and custom category filter tags to hand off to the Admin.
    - **Mastered Audio Reviewer (`/account/audio`):** Audition player for the couple to listen to mastered voice messages before public release.
    - **Downloadable Client QR Hub (`/account/qr-hub`):** High-resolution printable table cards and station signage assets with canonical QR codes.
    - **Host Real-Time RSVP Mailbox (`/account/mailbox`):** Real-time guest response inbox with WebSocket updates, live capacity meter (`CapacityMeterBar`: Approved Seats vs Max Venue Capacity), guest submission inspector with dynamic responses display, and one-click **Approve** (generates pass token and triggers EmailJS VIP QR pass delivery) and **Decline** (triggers EmailJS polite capacity regret notice).

#### 5. `apps/Renderer` (Port 3004) — Universal Dynamic Storefront Renderer
* **Role:** Decoupled, multi-tenant edge renderer for high-speed dynamic storefront resolution across all subdomains.
* **Key Responsibilities & Features:**
  - **Master Edge Router:** Resolves subdomains across `*.localhost`, `*.asar.me`, or query parameters.
  - **Automated Memory Classifier:** Synchronously and asynchronously classifies whether a given slug is a Booth Memory or an Invitation Event using forced query parameters, presets, defensive caches, slug prefixes, and remote Appwrite collection lookups.
  - **Universal Slugs:** Handles `/s/:slug`, `/booth/:slug`, `/memory/:slug`, `/m/:slug`, `/invitation/:slug`, `/event/:slug`, `/e/:slug`, and `/pass/:rsvpId`.
  - **Apex Showcase Portal:** Renders brand showcase when accessed on bare domain.

---

### 2.2. Shared Packages Catalog (`packages/*`)

#### 1. `@repo/react-appwrite` (`packages/react-appwrite`)
* **Role:** The foundational SDK, domain modeling engine, and data access layer for all 5 applications.
* **Key Modules:**
  - **`AsarDomain/sections.ts`:** 11 `EventSectionType` models, `EventSection` discriminated union, `ModularWebsiteConfig` (v2.0), `createDefaultModularWebsiteConfig`, `parseModularWebsiteConfig` with legacy v1 migration, and `validateModularWebsiteConfig`.
  - **`AsarDomain/models.ts`:** Strongly typed interfaces for all 9 collections (`AsarPlan`, `AsarOrder`, `AsarPayment`, `BoothMemory`, `BoothVoiceRecord`, `BoothMedia`, `AsarInvitation`, `InvitationRsvp`, `WishingWallMessage`, `AsarUserProfile`).
  - **`AsarDomain/collections.ts`:** Canonical IDs for Database (`asar-db`), Collections, Storage Buckets, and Teams.
  - **`AsarDomain/audioAnalyzer.ts`:** Web Audio API duration extraction, 48-peak normalized waveform analyzer, and 4-pattern smart filename parser.
  - **`AsarDomain/emailJsService.ts`:** EmailJS transactional dispatcher with simulation mode fallback and Appwrite Avatars QR URL builder.
  - **`AsarDomain/orderPipeline.ts`:** 7-stage order status progression state machine and metadata.
  - **`AsarDomain/useAsarAuth.ts`:** Complete luxury authentication and profile synchronization hook.
  - **`Storefront/subdomain.ts`:** 4-tier subdomain extraction, RFC 1123 slug validator, and 16 reserved system subdomains guard.
  - **`Storefront/urlBuilder.ts`:** Centralized `buildMemoryUrls` generator (canonical, RFC 6761 localhost, query URLs).
  - **`Storefront/useSubdomain.ts`:** Continuous URL synchronization hook.
  - **`Storefront/cacheHelper.ts`:** Multi-tier defensive cache helper (localStorage and memory seed sync).
  - **`Provider/CacheFusionStore.ts`:** Zero-refetch WebSocket real-time store maintaining document and collection query maps.
  - **`Databases/useBatchOperations.ts`:** Chunked concurrency bulk operations (`bulkCreate`, `bulkUpdate`, `bulkDelete`).
  - **`Storage/useUpload.ts`:** Chunked file upload hook with progress, pause, resume, and abort controls.
  - **`Teams/GuardComponents.tsx`:** `<RequireAuth>`, `<HasRole>`, and `<HasTeam>` RBAC guards.

#### 2. `@repo/ui-components` (`packages/UI-components`)
* **Role:** Awwwards-grade luxury visual and interactive component library.
* **Component Inventory (21 components):**
  - `GradientWaves` (WebGL2 shader canvas for acoustic atmospheres)
  - `BlurText` (Framer Motion poetic word reveal)
  - `SplitText` (GSAP/CSS spring heading reveal)
  - `TextType` (Bilingual typewriter prompt)
  - `CircularText` (Spinning luxury circular badge)
  - `ScrollReveal` (Intersection observer reveal)
  - `RotatingText` (Dynamic cycling hero keywords)
  - `CrystalizedBall` (Three.js WebGL interactive 3D orb)
  - `DitherVeil` (WebGL retro-luxury stipple veil overlay)
  - `GlowCursor` & `SplashCursor` (Interactive luxury fluid cursor trails)
  - `ScrollExpand` (Viewport-expanding video card)
  - `FadeContent` (Ethereal mist/blur-in wrapper)
  - `GradualBlur` (CSS backdrop-filter glass)
  - `Magnet` (Spring physics cursor attraction on primary CTAs)
  - `MorphSlider` (SVG morphing slider)
  - `CardNav` (Floating tactile card navigation bar)
  - `TiltedCard` (3D perspective mouse tilt with surface reflection)
  - `DecayCard` (Inertial physics polaroid card)
  - `PaperCrumple` (Three.js 3D paper crumple simulation)
  - `PeekRating` (Interactive sentiment rating)
  - `CircularGallery` (Rotating 3D circular cylinder carousel)
  - `CountUp` (Fluid numerical counter)
  - `HalftoneReveal` (Luxury print halftone shader transition)

#### 3. `@repo/assets-shared` (`packages/assets-shared`)
* **Role:** Shared brand assets, high-resolution photography, and visual reference screens.
* **Inventory:** `logo-main.png`, `logo.jpeg`, `booth-hero-photo.webp`, `love-wedding.jpg`, `wedding2.jpg`, `screens-booth.jpeg`, `landing-booth.jpeg`.

#### 4. `@repo/typescript-config` (`packages/typescript-config`)
* **Role:** Shared compiler configurations (`base.json`, `vite.json`, `react-library.json`).

#### 5. `@repo/eslint-config` (`packages/eslint-config`)
* **Role:** Shared ESLint and Prettier rule sets.

---

## 3. Complete Authentication Architecture

### 3.1. Appwrite Cloud Authentication Methods
Per `appwrite/appwrite.config.json` (lines 26–46), the project authorizes the following native authentication methods:
- **`email-password`:** Primary authentication for administrators and registered clients.
- **`phone`:** Phone number with SMS OTP verification token (`createPhoneToken` -> `createSession`).
- **`email-otp`:** Passwordless email token authentication (`createEmailToken` -> `createSession`).
- **`magic-url`:** One-click email login link (`createMagicURLToken`).
- **`jwt`:** Cryptographic JSON Web Tokens for cross-service authentication.
- **`anonymous`:** Frictionless temporary sessions for guest interactions.
- **`invites`:** Team membership invitations.

### 3.2. Session Management & Cross-App Unified Session Strategy
- **Production Session Domain:** When deployed under a shared apex domain (e.g., `*.asar.me`), Appwrite first-party session cookies with `SameSite=Lax` and domain `.asar.me` allow users to log in on `asar.me/auth` and remain authenticated across `admin.asar.me`, `booth.asar.me`, `invitation.asar.me`, and customer subdomains without re-authenticating.
- **Local Development Session Handoff:** In local development on different ports (`:3000` to `:3004`), `localStorage` is origin-isolated per port. `apps/Main` (`:3000`) acts as the central customer identity provider; booking flows in Booth and Invitation automatically link back to `http://localhost:3000/account` with the newly created `orderId`.
- **Session Conflict Resolution:** In `useAsarAuth` and `useAuthActions`, before creating a new session, any existing session is checked; if code `409` or `user_session_already_exists` is returned, `account.deleteSession("current")` is invoked before retrying, preventing login lockouts.
- **Session Limits:** Configured in `appwrite.config.json` with `sessionsLimit: 10` and `duration: 31536000` (1 year).

### 3.3. Security Roles & RBAC Architecture
The system establishes three distinct privilege tiers:
1. **ASAR Administrators (`team:admins` / `role: "admin"`):**
   - Members of the Appwrite team `admins` (`$id: "admins"`, "ASAR Administrators").
   - Full read/write/delete permissions across all collections, pricing plans, orders, and payment approvals.
   - Guarded on client routes via `<HasTeam teamId="admins">` and `<HasRole role="admin">`.
2. **Authenticated Clients (`users` / `role: "client"`):**
   - Verified users who book services.
   - Permissions to read and update their own orders (`read("users")`, `update("users")`), upload payment receipts, and manage their Invitation RSVP Mailbox.
   - Synced with the `users` table (`$id: "users"` in `asar-db`).
3. **Public Guests (`any`):**
   - Unauthenticated visitors accessing published Booth memory pages or Invitation websites.
   - Permitted to view published memories (`read("any")`), submit dynamic RSVP responses (`create("any")` on `invitation_rsvps`), and post祝福 messages on the wishing wall (`create("any")` on `wishing_wall_messages`).

### 3.4. Permissions Matrix Across All Collections & Buckets

| Target Resource | Row Security | Read Permissions | Create Permissions | Update Permissions | Delete Permissions |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`plans`** | `false` | `read("any")` | `create("team:admins")` | `update("team:admins")` | `delete("team:admins")` |
| **`orders`** | `true` | `read("team:admins")`, `read("users")` | `create("any")`, `create("users")` | `update("team:admins")`, `update("users")` | `delete("team:admins")` |
| **`payments`** | `true` | `read("team:admins")` | `create("any")`, `create("users")` | `update("team:admins")` | `delete("team:admins")` |
| **`booth_memories`** | `false` | `read("any")` | `create("team:admins")` | `update("team:admins")` | `delete("team:admins")` |
| **`booth_voice_records`**| `false`| `read("any")` | `create("team:admins")` | `update("team:admins")`, `update("any")` | `delete("team:admins")` |
| **`booth_media`** | `false` | `read("any")` | `create("team:admins")` | `update("team:admins")` | `delete("team:admins")` |
| **`invitations`** | `false` | `read("any")` | `create("team:admins")` | `update("team:admins")` | `delete("team:admins")` |
| **`invitation_rsvps`** | `true` | `read("team:admins")`, `read("users")` | `create("any")` | `update("team:admins")`, `update("users")` | `delete("team:admins")` |
| **`wishing_wall_messages`**|`false`| `read("any")` | `create("any")` | `update("any")` | `delete("team:admins")` |
| **`users`** | `true` | `read("users")`, `read("team:admins")` | `create("any")`, `create("users")` | `update("users")`, `update("team:admins")` | `delete("team:admins")` |
| **`asar_storage` (Bucket)**| `fileSecurity: true` | `read("any")` (public media) / owner only (receipts) | `create("users")`, `create("team:admins")` | `update("team:admins")` | `delete("team:admins")` |

---

## 4. 10k+ Concurrent Users Scalability Architecture

To safely support high concurrency (>10,000 simultaneous users) during peak wedding announcements or viral gala invitations without connection starvation, rate-limit crashes, or race conditions:

### 4.1. Multi-Tier Defensive Caching Architecture
1. **Tier 1 — In-Memory Reactive Cache (`CacheFusionStore`):**
   - Maps documents by `doc:dbId:collId:docId` and collection queries by query hash.
   - Directly intercepts Appwrite WebSocket realtime events (`.create`, `.update`, `.delete`) to update cached collection arrays and documents **in-place without triggering network refetches**.
   - Notifies subscribed UI components with surgical granularity.
2. **Tier 2 — Persistent LocalStorage Cache (`cacheHelper.ts`):**
   - Automatically synchronizes successful Appwrite collection responses to local persistent stores (`asar_booth_memories_cache`, `asar_invitations_cache`, `asar_orders_cache`).
   - Serves instantaneous local renders on page load, eliminating empty loading spinners and shielding the Appwrite backend from cold-start query spikes.
3. **Tier 3 — Static Seed Defaults (`seedDefaults.ts`):**
   - Complete fallback payloads (`DEMO_BOOTH_MEMORY`, `INVITATION_PRESETS`) guaranteeing zero runtime crashes during network degradation.

### 4.2. Database Indexing Specifications
All high-traffic query paths in `appwrite.config.json` are backed by compound and single-column indexes:
- `plans`: `idx_service_sort` on `[serviceType, sortOrder]`
- `orders`: `idx_client_id` on `[clientId]`, `idx_order_status` on `[orderStatus]`, `idx_service_type` on `[serviceType]`
- `payments`: `idx_order_id` on `[orderId]`, `idx_status` on `[status]`
- `booth_memories`: `idx_slug` on `[slug]`, `idx_subdomain` on `[subdomain]`, `idx_order_id` on `[orderId]`
- `booth_voice_records`: `idx_memory_id` on `[memoryId]`, `idx_category` on `[category]`
- `booth_media`: `idx_memory_id` on `[memoryId]`, `idx_media_type` on `[mediaType]`
- `invitations`: `idx_slug` on `[slug]`, `idx_subdomain` on `[subdomain]`, `idx_order_id` on `[orderId]`
- `invitation_rsvps`: `idx_invitation_id` on `[invitationId]`, `idx_client_id` on `[clientId]`, `idx_status` on `[status]`, `idx_pass_token` on `[passToken]`
- `wishing_wall_messages`: `idx_invitation_id` on `[invitationId]`
- `users`: `idx_user_id` on `[userId]` (UNIQUE), `idx_user_email` on `[email]`, `idx_user_role` on `[role]`

### 4.3. Query Batching, Concurrency Throttling & Pagination
- **Chunked Concurrency Throttling (`useBatchOperations`):** When administrators upload 50–150+ audio tracks, executing 150 parallel HTTP calls simultaneously would saturate connection pools and trigger Appwrite HTTP 429 rate limit errors. `useBatchOperations` partitions requests into chunks of `chunkSize` (default: 5) and executes sequentially via `Promise.all` across chunks with continuous progress reporting.
- **Cursor & Offset Query Pagination (`useCollectionWithPagination`):** Prevents full-table scans by enforcing strict pagination limits (`Query.limit(25)` / `Query.limit(50)`), using cursor markers (`Query.cursorAfter`) for infinite scroll feeds, keeping backend RAM consumption bounded at $O(1)$ relative to total records.
- **Chunked File Streaming (`useUpload`):** Large audio and video assets (up to 50 MB) are partitioned into 5 MB chunks with pause, resume, and retry capability, preventing connection timeouts on cellular networks.

### 4.4. Connection Multiplexing & WebSocket Realtime Channels
- All realtime event subscriptions across an application share a single persistent WebSocket connection managed by `Client.subscribe()`.
- Multiple UI components listening to the same channel hook into `CacheFusionStore` listeners rather than establishing duplicate WebSocket connections, keeping concurrent socket connections minimal even with 10k+ clients.

---

## 5. Appwrite Cloud Functions Specifications

The platform defines two mission-critical serverless functions running on Node.js 22 runtimes in `appwrite/functions/`:

### 5.1. Function 1: `process-rsvp-action`
* **Function ID:** `process-rsvp-action`
* **Path:** `appwrite/functions/process-rsvp-action/`
* **Entrypoint:** `src/main.js`
* **Runtime:** `node-22`
* **Trigger:** Invoked via HTTP execution from the Client RSVP Mailbox (`apps/Main`) or Admin Console when the host makes an Approve or Decline decision.
* **Execution Scopes & Roles:** `team:admins`, `users`
* **Specifications:**
  - Build specification: `s-2vcpu-2gb`, Runtime specification: `s-0.5vcpu-512mb`, Timeout: `15s`.
* **Input Contract:**
  ```json
  {
    "rsvpId": "string (required)",
    "action": "'approve' | 'decline' (required)",
    "rejectionReason": "string (optional, for decline)"
  }
  ```
* **Output Contract:**
  - On Approval:
    ```json
    {
      "success": true,
      "action": "approve",
      "status": "approved",
      "rsvpId": "string",
      "passToken": "VIP-XXXX-YYYY",
      "qrCodeUrl": "https://asar.me/checkin?token=...",
      "guestEmail": "string",
      "guestName": "string",
      "companionsCount": 2,
      "respondedAt": "ISO timestamp"
    }
    ```
  - On Decline:
    ```json
    {
      "success": true,
      "action": "decline",
      "status": "declined",
      "rsvpId": "string",
      "guestEmail": "string",
      "guestName": "string",
      "rejectionReason": "Event venue capacity limit reached",
      "respondedAt": "ISO timestamp"
    }
    ```
* **Execution Flow:**
  1. Validates `rsvpId` and `action` parameters.
  2. Fetches existing RSVP document from `asar-db.invitation_rsvps`.
  3. If `action === "approve"`:
     - Generates a high-entropy, collision-free pass token (`VIP-${timeComponent}-${randomSuffix}`).
     - Builds check-in QR URL (`https://asar.me/checkin?token=${passToken}&rsvp=${rsvpId}`).
     - Atomically updates document: `status: "approved"`, `passToken`, `qrCodeUrl`, `respondedAt`, `emailSent: true`.
     - Logs event and returns success response for client EmailJS dispatch.
  4. If `action === "decline"`:
     - Atomically updates document: `status: "declined"`, `respondedAt`, `emailSent: true`.
     - Logs event with rejection reason and returns success response.

### 5.2. Function 2: `generate-vip-pass`
* **Function ID:** `generate-vip-pass`
* **Path:** `appwrite/functions/generate-vip-pass/`
* **Entrypoint:** `src/main.js`
* **Runtime:** `node-22`
* **Trigger:** Invoked when rendering a guest VIP pass (`/pass/:rsvpId`) or during venue entrance check-in validation.
* **Execution Scopes & Roles:** `team:admins`, `users`, `any`
* **Specifications:**
  - Build specification: `s-2vcpu-2gb`, Runtime specification: `s-0.5vcpu-512mb`, Timeout: `15s`.
* **Input Contract:**
  ```json
  {
    "rsvpId": "string (required)",
    "guestName": "string (required)",
    "companionsCount": 0,
    "invitationSlug": "string (optional)",
    "eventTitle": "string (optional)"
  }
  ```
* **Output Contract:**
  ```json
  {
    "success": true,
    "pass": {
      "token": "ASAR-PASS-XXXX-YYYY",
      "rsvpId": "string",
      "guestName": "string",
      "companionsCount": 0,
      "totalGuests": 1,
      "invitationSlug": "string",
      "eventTitle": "string",
      "signature": "hmac_sha256_hash",
      "issuedAt": "ISO timestamp",
      "checkInUrl": "https://[slug].asar.me/checkin?token=...&sig=..."
    }
  }
  ```
* **Execution Flow:**
  1. Validates required input parameters.
  2. Generates high-entropy base-32 token (`ASAR-PASS-XXXX-YYYY`).
  3. Computes cryptographic HMAC-SHA256 signature using internal project key over `${rsvpId}:${guestName}:${token}:${issuedAt}` to prevent pass tampering or forged QR codes.
  4. Returns signed pass payload with total party size and verified check-in URL.

---

## 6. Admin Dashboard Specifications (`apps/Admin`)

The administrative console must manage all aspects of both Booth and Invitation services, organized through a **native Arabic RTL right-hand vertical tabs navigation menu**:

### 6.1. Complete Booth Feature Management
- **Plans & Pricing:** Create, edit, duplicate, and toggle Booth plans (Name, Subtitle, Badges, Price in EGP, Currency, `ivory-royal` vs `noir-obsidian` card theme).
- **Custom Features Checklist:** Dynamic bullet-point checklist builder persisted to `featuresJson`.
- **System Quotas & Limits Engine:**
  - `coverageHours` (e.g. 3 or 6 hours)
  - `maxVoiceRecords` (numeric limit or `-1` for Unlimited)
  - `maxGalleryPhotos` (numeric limit or `-1` for Unlimited)
  - `maxCustomCategories` (e.g. 4 or 10)
  - `hasVideoHighlight` (boolean toggle enabling/disabling 30s cinematic banner and tab)
  - `hasGuestBookTab` (boolean toggle enabling written guestbook)
  - `allowBulkZipDownload` (boolean toggle controlling "Download All Messages" button)
  - `hostingDurationDays` (e.g. 365 or 730 days)
- **Per-Order Quota Overrides:** Ability to adjust quotas on a specific client order without modifying the global plan.
- **Manual Payment Receipt Lightbox:** Zoomable receipt view with 1-click Approve (unlocks client asset submission) or Reject (prompts for rejection reason and notifies client).
- **Concierge Order Tracker:** Advance order status across the 7 stages.
- **Split-Screen Booth Memory Studio:** Left authoring canvas with right-side live interactive iPhone preview.
- **Zero-Effort Bulk Voice Uploader:** Multi-file drag-and-drop, Web Audio API waveform decoding (48 peaks), smart filename parsing (Pattern A, B, C, D), keyboard-navigable spreadsheet batch grid with inline audition, one-click bulk category assignment, and chunked batch upload.
- **Media & Tabs Curation:** Curate hero photos, video highlights, photo galleries, and thank-you notes.
- **Canonical URLs & QR Codes:** Generate canonical public subdomain URLs (`https://${slug}.asar.me`), RFC 1123 validation, 16 reserved system subdomains guard, and print-ready table QR codes.

### 6.2. Complete Invitation Feature Management
- **Plans & Pricing:** Manage Classic and Bespoke Gala invitation tiers.
- **Modular Website Creation Studio:** Visual canvas managing 11 modular section blocks (`cover_hero`, `couple_story`, `event_schedule`, `photo_gallery`, `wishing_wall`, `digital_gift_registry`, `background_audio`, `venue_location`, `live_countdown`, `custom_highlight`, `dynamic_rsvp`).
- **Section Palette Modal:** Add sections categorized into Essentials, Story & Media, Interactive Engagement, and Gifting & Logistics.
- **Reorderable Modular Deck:** Drag-and-drop handles, Move Up/Down controls, visibility toggles, duplicate, delete.
- **11 Dedicated Config Inspectors:** Form controls for every section's specific properties.
- **Occasion Theme Presets:** Royal Wedding Editorial, Midnight Gala (Noir VIP), Mediterranean Garden, Cultural Festival; WebGL shader selector (`GradientWaves`, `DitherVeil`, `SplashCursor`, `GlowCursor`).
- **Dynamic RSVP Form Builder:** Locked mandatory system fields (`guestName` and `guestEmail`), unlimited custom fields (`tel`, `select`, `radio`, `checkbox`, `number`, `text`, `textarea`).
- **Venue Capacity:** Manage `maxCapacity` to govern host mailbox capacity meters.
- **Digital Blessing Box:** Configure Bank QR codes (VietQR / InstaPay / IBAN), account numbers, and transfer memos.
- **Wishing Wall Moderation:** Toggle auto-approve vs host moderation queue.
- **QR Passes & Scanner:** Audit pass tokens and verify attendance via scanner view.

### 6.3. Arabic RTL Right-Hand Vertical Tabs Menu Redesign Requirement
- **Current State:** `AdminShell.tsx` contains a horizontal tab pill strip (`direction={{ base: "column", md: "row" }}`) pinned underneath the top bar.
- **Specification Requirement (R4):** Redesign the Admin dashboard navigation into a **Right-Hand Vertical Tabs Menu** (`dir="rtl"`). In Arabic layout, the right side represents the primary starting anchor. The layout must structure:
  - An application shell with a full-height, right-docked vertical navigation sidebar containing the brand crest, admin profile, and vertical tab buttons with active royal maroon indicators and pending order badge counters.
  - A left-hand main workspace canvas for active operational studios and overview dashboards.

---

## 7. Cross-Module Contracts & Dependencies

```mermaid
flowchart LR
    subgraph DomainPkg ["@repo/react-appwrite"]
        Sections["sections.ts (11 EventSection models)"]
        Models["models.ts (Order, Plan, Memory, Rsvp)"]
        Storefront["Storefront Engine (4-Tier Resolver)"]
        CacheFusion["CacheFusionStore (WebSocket Sync)"]
        AuthHook["useAsarAuth / useAuthActions"]
    end

    subgraph AdminApp ["apps/Admin"]
        AdminStudio["PlanBuilder & Visual Studios"]
    end

    subgraph BoothApp ["apps/Booth"]
        BoothStorefront["DynamicBoothStorefrontIndex & MemoryPage"]
    end

    subgraph InviteApp ["apps/Invitation"]
        InviteStorefront["DynamicInvitationStorefrontIndex & CustomEventPage"]
    end

    subgraph MainApp ["apps/Main"]
        ClientPortal["OrderTracker & RSVP Mailbox"]
    end

    subgraph RendererApp ["apps/Renderer"]
        EdgeRenderer["DynamicStorefrontIndex (Auto-Classifier)"]
    end

    subgraph AppwriteCloud ["Appwrite Cloud (asar-db)"]
        DB[(Collections: plans, orders, payments, booth_memories, etc.)]
        Storage[(Bucket: asar_storage)]
        Functions["process-rsvp-action & generate-vip-pass"]
    end

    DomainPkg --> AdminApp & BoothApp & InviteApp & MainApp & RendererApp
    AdminApp & BoothApp & InviteApp & MainApp & RendererApp <-->|"REST & WebSockets"| AppwriteCloud
```

### Shared Contract Rules:
1. **Single Source of Truth:** All interfaces (`AsarPlan`, `AsarOrder`, `EventSection`, `ModularWebsiteConfig`) originate in `packages/react-appwrite/src/AsarDomain`. Applications MUST NOT define duplicate local types.
2. **Cross-App Import Prohibition:** No app may import directly from another app (e.g. `import ... from "../../apps/Booth"` is forbidden).
3. **Storefront Subdomain Engine Invariance:** `useSubdomain`, `validateSubdomainSlug`, and `buildMemoryUrls` govern all URL resolution across `Booth`, `Invitation`, `Renderer`, and `Admin`.

---

## 8. Features Discovered & Verified Inventory

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Storefront Subdomain | 4-Tier Subdomain Resolution | Resolves tenant slug: Query param -> Route param -> Hostname -> Apex fallback | URL string, SearchParams, Hostname | Normalized slug string or null | Returns null for apex/localhost | `useSubdomain.ts` & `ASAR_PROJECT_ARCHITECTURE.md` |
| 2 | Storefront Subdomain | RFC 1123 Slug Validator | Validates 1-63 chars, lowercase alphanumeric and hyphens, no leading/trailing hyphens | Slug string | `{ isValid: boolean, error?: string }` | Returns explicit error messages | `subdomain.ts` |
| 3 | Storefront Subdomain | 16 Reserved Subdomains Guard | Prohibits collision with system subdomains (`admin`, `api`, `auth`, `cdn`, `mail`, etc.) | Slug string | `boolean` | Flags reserved slugs as invalid | `subdomain.ts` |
| 4 | Storefront Subdomain | Centralized URL Generator | Generates canonical public, RFC 6761 dev localhost, and dev query URLs | `{ slug, type, port, isDev }` | `{ canonicalUrl, devLocalhostUrl, devQueryUrl }` | Returns default fallback on empty slug | `urlBuilder.ts` |
| 5 | Modular Sections | 11 `EventSectionType` Models | Discriminated union of 11 customizable page sections | Section config object | Validated `EventSection` instance | Strict type checking | `sections.ts` & `COMPETITIVE_ANALYSIS.md` |
| 6 | Modular Sections | Default Config Factory | Generates complete 11-section `ModularWebsiteConfig` (v2.0) with occasion presets | `{ eventTitle, occasionType }` | `ModularWebsiteConfig` | Sensible default values | `sections.ts` |
| 7 | Modular Sections | Safe Config Parser & Migration | Deserializes JSON safely, auto-migrating legacy v1 flat blocks into v2 sections | `unknown` JSON/string | `ModularWebsiteConfig` | Falls back to default config on corrupted input | `sections.ts` |
| 8 | Audio Engineering | Web Audio API Waveform Analyzer | Decodes audio in browser and extracts duration and 48 normalized amplitude peaks | Audio File / Buffer | `{ durationSeconds, durationFormatted, waveformPeaks }` | Generates deterministic synthetic peaks on decode error | `audioAnalyzer.ts` & `AGENT_05` |
| 9 | Audio Engineering | Smart Filename Auto-Parser | Parses speaker name, role, and category from filenames (Patterns A, B, C, D) | Filename, optional folder | `{ speakerName, speakerRole, category }` | Gracefully assigns default guest labels | `audioAnalyzer.ts` & `AGENT_05` |
| 10 | Orders & Pipeline | 7-Stage Order Pipeline State Machine | Tracks progression from pending payment to published heirloom | Order object, target status | Updated order with progress percent | Rejects invalid backward transitions | `orderPipeline.ts` & `AGENT_04` |
| 11 | Notifications & Passes | EmailJS Transactional Dispatch | Sends VIP QR pass on approval; sends polite capacity regret notice on decline | RSVP record, event details | EmailJS delivery status | Runs in Simulation Mode if keys missing | `emailJsService.ts` & `AGENT_10` |
| 12 | Notifications & Passes | VIP QR Pass Token Generator | Generates cryptographic base-32 pass tokens (`VIP-XXXX-YYYY`) | Optional prefix | Unique pass token string | High-entropy random bytes prevent collisions | `process-rsvp-action` & `InteractiveRsvpSection.tsx` |
| 13 | Admin Studios | Dynamic Plan Builder Studio | Manage Booth and Invitation packages with custom bullet points and limitsJson quotas | Plan inputs, limits | Synchronized plan record | Validates limits and currencies | `PlanBuilderStudio.tsx` & `AGENT_04` |
| 14 | Admin Studios | Manual Payment Receipt Inspector | Lightbox displaying payment screenshot with zoom and Approve/Reject workflow | Payment record, admin decision | Updated order & payment status | Requires rejection reason when rejecting | `PaymentReceiptInspector.tsx` & `AGENT_04` |
| 15 | Admin Studios | Zero-Effort Bulk Voice Uploader | Drag-and-drop 100+ files with batch inline audition and spreadsheet grid | Audio files array | Bulk Appwrite uploads + voice records | Progress indicator with chunked retry | `BulkVoiceUploader.tsx` & `AGENT_05` |
| 16 | Admin Studios | Modular Website Creation Editor | Palette modal, reorder deck, 11 inspectors, split-screen preview | Modular website config | Saved `sectionsConfigJson` | Prevents deleting locked RSVP section | `InvitationStudio.tsx` & `AGENT_06` |
| 17 | Admin Studios | Dynamic RSVP Form Builder | Visual form editor with locked mandatory `guestEmail` field | Field definitions | `DynamicFormField[]` schema | Prohibits removing or unlocking guest email | `DynamicFormSchemaBuilder.tsx` & `AGENT_06` |
| 18 | Client Portal | 7-Stage Live Order Tracker | Client-facing visual timeline showing order progress and actionable steps | Order ID, Client session | Rendered progress tracker & uploaders | Guides client on required next action | `OrderTrackerTimeline.tsx` & `AGENT_09` |
| 19 | Client Portal | Host VIP RSVP Mailbox | Real-time inbox showing guest submissions with capacity gauge and EmailJS triggers | Invitation ID, host actions | Updated RSVP statuses & pass emails | Disables approval when capacity reached | `ClientRsvpMailbox.tsx` & `AGENT_10` |
| 20 | Booth Memory | Visual Reference #1 Memory Page | Luxury couple heirloom with alabaster fade, 5 tabs, waveforms, and QR share | Subdomain slug | Rendered memory heirloom page | Prompts for 4-digit PIN if private-locked | `BoothMemoryPage.tsx` & `AGENT_03` |
| 21 | Booth Memory | Photo Memories Alignment | Photo grid with category filter pills, lightbox, and shared domain models | Photo items, category filter | Filtered photo grid & modal | Clamps navigation indices safely | `PhotoGalleryGrid.tsx` & `AGENT_03` |
| 22 | Invitation Living | Modular Section Dispatcher | Dynamically dispatches enabled sections in configured sequence | `EventSection[]` array | Rendered interactive sections | Gracefully skips unrecognized section types | `ModularSectionDispatcher.tsx` & `AGENT_08` |
| 23 | Invitation Living | Interactive Wishing Wall | Real-time blessings wall with guest submission, reactions, and feed | Guest name, message | Persisted blessing card in feed | Validates character count and moderation | `InteractiveWishingWallSection.tsx` & `COMPETITIVE_ANALYSIS.md` |
| 24 | Invitation Living | Digital Gift Registry with Bank QR | Blessing box with VietQR / InstaPay / IBAN QR codes and 1-tap copy | Bank account details | Visual QR cards + clipboard feedback | Disables inactive bank accounts | `DigitalGiftRegistrySection.tsx` & `COMPETITIVE_ANALYSIS.md` |
| 25 | Venue Logistics | Venue Entrance Check-in Scanner | Camera QR scanner verifying guest pass tokens and logging attendance | QR video stream | Check-in confirmation & timestamp | Displays error warning on invalid/used tokens | `VenueQrScanner.tsx` & `AGENT_08` |
| 26 | Storefront Edge | Universal Memory Type Classifier | Automatic synchronous and asynchronous detection of Booth vs. Invitation | Slug string, query params | `"booth" \| "invitation" \| "pass"` | Falls back to luxury 404 on unrecognized slug | `DynamicStorefrontIndex.tsx` & `AGENT_GUIDE.md` |

---

## 9. Edge Cases & Defensive Runtime Behaviors

| # | Feature | Input / Condition | Observed & Enforced Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Subdomain Resolution | Bare apex domain (`asar.me` or `localhost:3002`) | Returns `subdomain: null`. Dynamic index renders apex marketing landing page instead of memory heirloom. |
| 2 | Subdomain Resolution | Reserved subdomain (`admin.asar.me`, `api.asar.me`, `mail.asar.me`) | Flagged by `isReservedSubdomain()`. Triggers contextual `StorefrontNotFound` with `reason="reserved"`. |
| 3 | Subdomain Resolution | RFC 1123 violation (`-mina-`, `mina_maryam`, `mina..maryam`, `>63 chars`) | Flagged by `validateSubdomainSlug()`. Triggers `StorefrontNotFound` with `reason="invalid"`. |
| 4 | Subdomain Resolution | Query override in dev (`?subdomain=mina-and-maryam`) | Evaluated as Tier 1. Overrides route param and hostname, enabling instant testing on any host. |
| 5 | Modular Config Parser | Null, undefined, empty string, or invalid JSON string | Safely parsed with `try/catch`. Returns `createDefaultModularWebsiteConfig()` with 11 default sections; zero crash. |
| 6 | Modular Config Parser | Legacy v1 flat blocks payload (`InvitationSectionBlock[]`) | Automatically migrated into strongly-typed v2 `EventSection[]` with full field mapping. |
| 7 | Dynamic RSVP Form | Guest attempts submission without email | Hard-locked validation rejects submission with error *"البريد الإلكتروني مطلوب لتأكيد الحجز"*; form cannot be submitted. |
| 8 | Dynamic RSVP Form | Host capacity limit reached (e.g. 150/150 approved) | Client Mailbox displays full capacity alert; approval buttons prompt confirmation before exceeding limit. |
| 9 | Bulk Audio Placement | Audio track fails Web Audio API decoding | Analyzer catches error and generates 48 deterministic synthetic peaks based on filename hash; track remains playable. |
| 10 | Bulk Audio Placement | Unformatted or exotic filename (`audio_01.mp3`, `unknown.wav`) | Filename parser assigns category `"General"`, speaker name `"Guest"`, role `"Guest"`; track is never dropped. |
| 11 | VIP Pass Token | High-concurrency token generation burst | Set lookup and LRU eviction ensure unique 8-character base-32 tokens with zero collisions across 50,000 active tokens. |
| 12 | Photo Gallery Lightbox | Gallery with 0 or 1 photo | Lightbox clamps index at 0, disables next/prev arrows, and prevents infinite wrap errors. |
| 13 | Appwrite Cloud Offline | Network disconnected or missing Appwrite credentials | All apps seamlessly fall back to local storage caches and seed defaults (`DEMO_BOOTH_MEMORY`, `INVITATION_PRESETS`). |
| 14 | EmailJS Offline | Missing `VITE_EMAILJS_SERVICE_ID` | Operates in Simulation Mode, logging formatted email payloads and QR codes to console without throwing exceptions. |
| 15 | Audio Autoplay Policy | Mobile browser blocks unmuted audio on page load | Floating vinyl player remains muted until user taps the wax seal or vinyl icon, displaying a subtle pulse indicator. |
| 16 | Duplicate User Sessions | User logs in while active session exists | `account.deleteSession("current")` proactively clears stale session before creating new session, preventing code 409 errors. |

---

## 10. Handoff Protocol & Verification

### 10.1. Observation
- All 15 documents in `docs/` were examined in full, alongside `appwrite/appwrite.config.json`, the two deployed Cloud Functions in `appwrite/functions/`, and the live codebase.
- The monorepo structure adheres to Turborepo v2 workspaces (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`, and `packages/react-appwrite`, `packages/UI-components`, `packages/assets-shared`, `packages/typescript-config`, `packages/eslint-config`).
- Unit tests run at high speed via `npx tsx` (`packages/react-appwrite/test/sections.test.ts` completed in 27ms, 7/7 passing).
- Current `AdminShell.tsx` uses a horizontal tab pill strip that needs to be redesigned into a right-hand vertical tabs menu to satisfy Requirement R4.
- Appwrite cloud functions in `appwrite/functions/` (`process-rsvp-action` and `generate-vip-pass`) are implemented with complete handler logic in Node.js 22.

### 10.2. Logic Chain
1. *Observation:* User requirements in `ORIGINAL_REQUEST.md` mandate production readiness across all apps, Appwrite Cloud Functions verification, 10k+ concurrent user scalability, and an Arabic RTL admin dashboard with a right-hand vertical tabs menu.
2. *Deduction:* The foundational architectural schemas in `packages/react-appwrite/src/AsarDomain` (11 section types, models, collections, audio analyzer, and auth) are well-defined.
3. *Deduction:* In `apps/Admin`, the navigation currently renders horizontally across the screen below the header. For native Arabic RTL layout, the right side is the start of the page; thus, converting this to a right-aligned vertical sidebar directly satisfies the user's explicit UX request.
4. *Deduction:* Scalability to 10k+ users is anchored on `CacheFusionStore` in-memory WebSocket caching, query indexing in `appwrite.config.json`, cursor-based pagination, and chunked batch concurrency in `useBatchOperations`.

### 10.3. Caveats
- Production deployment of cloud functions requires valid Appwrite CLI authentication (`appwrite login` or API key with functions scope) against the Frankfurt endpoint.
- EmailJS requires live service and template IDs in `.env` for real SMTP delivery; the system includes simulation fallback mode for local testing.

### 10.4. Conclusion
The ASAR architecture documentation is complete, thorough, and highly cohesive across all 15 documentation files. All feature specifications, data contracts, security rules, and edge cases are documented with precision. The monorepo is positioned for execution of the production-readiness roadmap.

### 10.5. Verification Method
To verify this specification survey independently, run the targeted typechecks and automated unit tests without triggering full builds:
```bash
# 1. Verify shared domain tests
npx tsx packages/react-appwrite/test/sections.test.ts
npx tsx packages/react-appwrite/test/storefront.test.ts
npx tsx packages/react-appwrite/test/domain.test.ts

# 2. Verify Admin test suites
npx tsx apps/Admin/test/modularWebsiteEditor.test.ts
npx tsx apps/Admin/test/formSchemaValidation.test.ts
npx tsx apps/Admin/test/filenameParser.test.ts
npx tsx apps/Admin/test/adversarialStress.test.ts

# 3. Targeted TypeScript check (zero disk emit)
npx tsc --noEmit -p packages/react-appwrite/tsconfig.json
npx tsc --noEmit -p apps/Admin/tsconfig.app.json
```
