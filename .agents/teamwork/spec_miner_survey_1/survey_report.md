# ASAR Platform — Comprehensive Specification Mining & Existing Codebase Survey Report
**Target Agents:** Agent 01 (Shared Domain & Utilities), Agent 02 (Booth Dynamic Plans & Booking), Agent 03 (Booth Memory Page)  
**Author:** `spec_miner_survey_1`  
**Date:** 2026-11-03  
**Status:** Complete & Authoritative  

---

## 1. Executive Summary & Survey Scope

This survey establishes the complete, authoritative technical specification and codebase audit for the first three agents of the ASAR (Athar / أثر) monorepo initiative:
1. **Agent 01 (`@repo/react-appwrite`):** Shared Domain Models, Appwrite Collections & Buckets, 7-Stage Order Pipeline State Machine, Web Audio API Waveform Peak Extractor, Smart Filename Parser, EmailJS Dispatcher, and Seed Defaults.
2. **Agent 02 (`apps/Booth`):** Dynamic Plans Integration, 4-Step Booking Engine, Manual Payment Receipt Screenshot Upload, and Admin-modifiable Quotas in `PackagesSection.tsx`, `AddonsSection.tsx`, and `BookingModal.tsx`.
3. **Agent 03 (`apps/Booth`):** Pixel-accurate implementation of the **Booth Memory Presentation Page (`/memory/:slug`)** matching Visual Reference #1 (*Mina & Maryam*), featuring interactive 48-bar waveform playback, 5 distinct content tabs, Private PIN Gate, and high-contrast Share/QR sheet.

---

## 2. Strict File Boundaries & Conflict Prevention Matrix

Because 10 AI agents are executing concurrently in this monorepo, strict file boundaries must be observed. The table below outlines permitted and forbidden touchpoints:

| Agent | Target Package / App | Permitted Files (Create / Modify ONLY) | Strictly Forbidden Files |
| :--- | :--- | :--- | :--- |
| **Agent 01** | `packages/react-appwrite` | **Create:**<br>• `src/AsarDomain/collections.ts`<br>• `src/AsarDomain/models.ts`<br>• `src/AsarDomain/orderPipeline.ts`<br>• `src/AsarDomain/audioAnalyzer.ts`<br>• `src/AsarDomain/emailJsService.ts`<br>• `src/AsarDomain/seedDefaults.ts`<br>• `src/AsarDomain/index.ts`<br>**Modify:**<br>• `src/index.ts` (Append ONLY `export * from "./AsarDomain";` at bottom) | • Any files inside `apps/*` or `packages/UI-components`<br>• Existing exports in `packages/react-appwrite/src/index.ts`<br>• Running `npm run build` without cause |
| **Agent 02** | `apps/Booth` | **Create:**<br>• `src/hooks/useBoothBooking.ts`<br>**Modify:**<br>• `src/components/sections/PackagesSection.tsx`<br>• `src/components/sections/AddonsSection.tsx`<br>• `src/components/sections/BookingModal.tsx` | • `src/App.tsx` (Owned by Agent 03)<br>• `src/components/memory/*` and `src/pages/*` (Owned by Agent 03)<br>• Any files in `apps/Admin`, `apps/Main`, `apps/Invitation`, or `packages/*`<br>• Props signatures of `PackagesSection` and `BookingModal` |
| **Agent 03** | `apps/Booth` | **Create:**<br>• `src/components/memory/MemoryTopBar.tsx`<br>• `src/components/memory/MemoryHero.tsx`<br>• `src/components/memory/MemoryTabsBar.tsx`<br>• `src/components/memory/AudioMessagesTab.tsx`<br>• `src/components/memory/VoiceRecordCard.tsx`<br>• `src/components/memory/PhotosTab.tsx`<br>• `src/components/memory/VideoHighlightTab.tsx`<br>• `src/components/memory/GuestBookTab.tsx`<br>• `src/components/memory/ThankYouTab.tsx`<br>• `src/components/memory/MemoryBottomActions.tsx`<br>• `src/components/memory/MemoryShareQrModal.tsx`<br>• `src/components/memory/MemoryPinLockGate.tsx`<br>• `src/pages/BoothMemoryPage.tsx`<br>**Modify:**<br>• `src/App.tsx` (Add `/memory/:slug` & `?memory=:slug` routing + floating preview badge) | • `src/components/sections/PackagesSection.tsx`<br>• `src/components/sections/AddonsSection.tsx`<br>• `src/components/sections/BookingModal.tsx`<br>• `src/hooks/useBoothBooking.ts` (Owned by Agent 02)<br>• Any files in other apps or packages |

---

## 3. Agent 01: Core Architecture & Shared Domain Specifications

### 3.1. Appwrite IDs (`collections.ts`)
```ts
export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
} as const;

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "payment_receipts",
  CLIENT_RAW_ASSETS: "client_raw_assets",
  BOOTH_MASTERED_AUDIO: "booth_mastered_audio",
  BOOTH_GALLERY_MEDIA: "booth_gallery_media",
  INVITATION_ASSETS: "invitation_assets",
} as const;
```

### 3.2. Domain Models & Types (`models.ts`)
* **`AsarServiceType`**: `"booth" | "invitation"`
* **`AsarPlanLimits`**:
  ```ts
  export interface AsarPlanLimits {
    coverageHours?: number;
    maxVoiceRecords: number;        // e.g. 80, 150, or -1 for unlimited
    maxGalleryPhotos: number;       // e.g. 20, 100, or -1 for unlimited
    maxCustomCategories: number;    // e.g. 4, 10
    hasVideoHighlight: boolean;
    hasGuestBookTab: boolean;
    allowBulkZipDownload: boolean;
    hostingDurationDays: number;    // e.g. 365
    maxRsvpCapacity?: number;       // For Invitation service
    allowCustomSections?: boolean;  // For Invitation service
  }
  ```
* **`AsarPlanAddon`**: `{ id: string; name: string; price: number; description?: string; badge?: string; }`
* **`AsarPlan`**: Includes `$id`, `serviceType`, `name`, `subtitle`, `badge`, `subBadge`, `price`, `currency`, `themeVariant` (`"ivory-royal" | "noir-obsidian"`), `imageUrl`, `featuresJson` (JSON stringified string[]), `addonsJson`, `limitsJson`, `isActive`, `sortOrder`.
* **`OrderStatus`**:
  `"pending_payment" | "payment_rejected" | "awaiting_client_assets" | "event_scheduled" | "audio_mastering" | "studio_curation" | "published"`
* **`ClientSubmittedAssets`**: Form inputs sent in Stage 3 (`heroImageFileId`, `heroImagePreviewUrl`, `coupleTitle`, `eventHeaderTag`, `eventDateDisplay`, `eventLocationDisplay`, `highlightBadge`, `coupleQuote`, `thankYouMessage`, `customCategories`, `requestedRsvpFields`, `occasionType`, `maxVenueCapacity`).
* **`AsarOrder`**: Links client to plan, total amount, status, event date/venue, selected addons, submitted assets JSON, and quota overrides.
* **`AsarPayment`**: Links order to client, amount, `paymentMethod` (`"instapay" | "vodafone_cash" | "bank_transfer"`), `screenshotFileId`, `status` (`"pending" | "approved" | "rejected"`), `rejectionReason`.
* **`BoothMemory`**: Final presentation document containing `slug`, titles, metadata, quote, hero image ID, video highlight IDs, categories JSON, PIN lock flag/code, QR URL, and publication status.
* **`BoothVoiceRecord`**: Individual audio tracks containing `memoryId`, `audioFileId`, `speakerName`, `speakerRole`, `category`, `quoteSnippet`, `durationFormatted` (`"0:42"`), `durationSeconds`, `waveformPeaksJson` (48 normalized floats), `likesCount`, `isFeatured`, `sortOrder`.
* **`BoothMedia`**: Gallery items and guestbook written blessings (`mediaType: "photo" | "guestbook_note"`).
* **Safe JSON Helpers**: `parsePlanFeatures`, `parsePlanLimits`, `parsePlanAddons`, `parseClientAssets`, `parseWaveformPeaks`, `parseCategories` with zero-crash fallback guarantees.

### 3.3. 7-Stage Concierge Order Tracker (`orderPipeline.ts`)
* Stage 1: `pending_payment` — "Payment Verification" (Admin verifies manual screenshot).
* Stage 2: `payment_rejected` (Conditional) — "Action Required: Payment Receipt" (Client re-uploads screenshot).
* Stage 3: `awaiting_client_assets` — "Personalize Your Memory Page" (Client submits photos, quote, categories).
* Stage 4: `event_scheduled` — "Ready for Your Celebration" (On-site station confirmed; table QR codes ready).
* Stage 5: `audio_mastering` — "Studio Audio Mastering" (Sound engineers filter noise and master tracks).
* Stage 6: `studio_curation` — "Building Your Memory Website" (Admin places tracks and media in Studio).
* Stage 7: `published` — "Your Memory Vault is Live! 🎉" (Client listens, shares QR pass, accesses PIN gate).
* Progress calculation helper: `getOrderStageProgress(status: OrderStatus)` returning `{ currentStepIndex, progressPercent, stageInfo }`.

### 3.4. Web Audio API Waveform Extractor & Smart Filename Parser (`audioAnalyzer.ts`)
* **`extractAudioMetadata(file: File, barCount = 48)`**:
  * Uses `AudioContext` / `webkitAudioContext` `decodeAudioData`.
  * Computes duration and 48 normalized amplitude peaks `[0.15 .. 1.0]`.
  * Resilient fallback: If format cannot be decoded in the browser or worker, generates a deterministic natural-looking 48-bar waveform from the filename hash and duration from file size, ensuring zero upload crashes.
* **`parseVoiceFilename(filename: string, folderName?: string)`**:
  * Strips extension (`.mp3`, `.wav`, `.m4a`, `.ogg`).
  * Pattern A: `Category_Speaker Name_Role.mp3` (e.g. `Friends_Nour Hassan_Best Friend.mp3`).
  * Pattern B: `Category - Speaker Name - Role.mp3` (e.g. `Family - Ahmed El Sayed - Brother.mp3`).
  * Pattern C: `Speaker Name - Role.mp3` (defaults category to `folderName || "Family"`).
  * Fallback: Cleans raw IDs (`REC_001.mp3`), sets `speakerRole = "Guest"`, category to `folderName || "Friends"`.

### 3.5. EmailJS Service & QR Code Builder (`emailJsService.ts`)
* **`buildQrCodeImageUrl(targetUrl: string, size = 500)`**:
  * Primary: Appwrite Avatars QR endpoint.
  * Fallback: High-contrast public QR API (`https://api.qrserver.com/v1/create-qr-code/?size=...&color=6B1D28&bgcolor=FBF7F2&data=...`).
* **`sendRsvpDecisionEmail(params)`**:
  * Dispatches via EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`) with payload `{ service_id, template_id, user_id, template_params }`.
  * Approved path: sends QR pass link and confirmation.
  * Declined path: sends polite venue capacity apology.
  * Unconfigured env vars fallback: Logs email payload cleanly and returns `{ simulated: true, success: true }` without crashing UI.

### 3.6. Seed Defaults (`seedDefaults.ts`)
* Default Booth Plans:
  1. *"لحظة أثر — Athar Moment"* (`5,500 EGP`, 3 hours, 80 voice messages, 20 photos, 4 categories, 365 days hosting).
  2. *"حكاية أثر — Athar Story"* (`7,000 EGP`, 6 hours, 150 voice messages, 100 photos, 10 categories, video highlight, 365 days hosting).
* Demo Booth Memory:
  * Mina & Maryam (`mina-and-maryam`, `12 July 2026`, `Alexandria, Egypt`, `Together Always`).
  * 5 featured voice tracks with real 48-bar waveforms, durations, and quotes matching Image #1: `Nour Hassan` (0:42), `Ahmed El Sayed` (1:12), `Mona Khaled` (0:38), `Tarek Mostafa` (0:55), `Grandma` (1:08).

---

## 4. Agent 02: Booth Dynamic Plans & Booking Engine Specifications

### 4.1. `useBoothBooking.ts` Hook
* Queries Appwrite collection `"plans"` where `serviceType === "booth"` and `isActive === true` ordered by `sortOrder`.
* Fallback to `DEFAULT_BOOTH_PLANS` + `localStorage.getItem("asar_synced_plans")`.
* `submitBookingOrder(payload)`:
  * Uploads screenshot to Appwrite bucket `"payment_receipts"` via `storage.createFile` (or data URL fallback).
  * Creates `orders` document (`status: "pending_payment"`).
  * Creates `payments` document (`status: "pending"`).
  * Syncs to `localStorage.getItem("asar_orders_cache")`.
  * Returns `{ orderId, status: "pending_payment" }`.

### 4.2. `PackagesSection.tsx` Upgrade
* Displays dynamic plans from `useBoothBooking()`.
* Shows pricing, custom feature checklist, and **Plan Quotas Strip** (coverage hours, voice record limit, gallery photos limit, video highlight badge, cloud vault days).
* Supports both `ivory-royal` and `noir-obsidian` card designs.
* Includes **"Preview Sample Memory Page (Mina & Maryam) →"** button linking to `?memory=mina-and-maryam`.

### 4.3. `BookingModal.tsx` Upgrade (4-Step Concierge Engine)
* **Step 1 (Celebration Details):** Full Name, Partner's Name, Email (for client portal login/tracking), WhatsApp Phone, Event Date, Venue, Notes.
* **Step 2 (Plan & Add-ons Selection):** Dynamic plan cards, interactive add-on checklist, live calculated total price and deposit (e.g. 1,500 EGP).
* **Step 3 (Manual Payment & Screenshot Upload):**
  * InstaPay (`athar.audio@instapay` + Copy button).
  * Vodafone Cash (`0100 000 0000` + Copy button).
  * Bank Transfer (IBAN details + Copy button).
  * Deposit vs Full Payment toggle.
  * Drag-and-drop screenshot receipt dropzone with image preview, file size, replace action, and submission validation.
* **Step 4 (Order Confirmation & Live Tracker Deep-Link):**
  * Displays generated Order Reference ID (`#ORD-XXXX`) and pending approval badge.
  * Guidance on next steps.
  * Action button linking to Client Portal `http://localhost:3000?orderId=${orderId}` and Memory Page preview (`?memory=mina-and-maryam`).

---

## 5. Agent 03: Booth Memory Presentation Page Specifications (Matching Image #1)

### 5.1. Route & Navigation Architecture (`App.tsx` & `BoothMemoryPage.tsx`)
* Detects route `/memory/:slug` or query param `?memory=:slug`.
* If slug matches, switches from the marketing landing page to `<BoothMemoryPage slug={slug} />`.
* Floating pill button in bottom-left corner of marketing landing page: **`🎧 معاينة صفحة ذكريات العروسين (Mina & Maryam)`** -> `?memory=mina-and-maryam`.
* Loads data from `booth_memories`, `booth_voice_records`, and `booth_media` with fallback to `DEMO_BOOTH_MEMORY` and `DEMO_BOOTH_VOICE_RECORDS`.

### 5.2. Component Breakdown (Visual Reference #1 Anatomy)
1. **`MemoryTopBar.tsx`:**
   * Frosted alabaster sticky header (`bg="rgba(251, 247, 242, 0.94)"`, `backdropFilter="blur(16px)"`).
   * Left: `≡` Hamburger menu icon opening navigation drawer.
   * Center: Athar calligraphy logo (`/assets/logo-main.png`) + `ATHAR AUDIO MEMORIES`.
   * Right: `🔒` Padlock icon + `A Private Memory` / `For Mina & Maryam`.
2. **`MemoryHero.tsx`:**
   * Couple wedding portrait background (`/assets/love-wedding.jpg`) with soft alabaster bottom gradient fade.
   * Overline: `THE WEDDING OF`.
   * Couple Title: `Mina & Maryam` (`Playfair Display` italic/bold, `#5B1621`).
   * Acoustic Waveform Divider: `─── ∿∿∿ ───` with tagline:
     * `Same People. Different Voices.`
     * `A Lasting Athar.`
   * 3 Metadata Pills: `[📅 12 July 2026]` · `[📍 Alexandria, Egypt]` · `[🤍 Together Always]`.
   * Couple Quote: `"Every voice here is a piece of our forever ..."` – Mina & Maryam.
3. **`MemoryTabsBar.tsx` (5 Rounded Tab Cards):**
   * `Audio Messages` (Waveform icon — Active: solid Royal Maroon `#6B1D28`, white text).
   * `Photos` (Gallery icon — Linen `#F4EFEA`).
   * `Video Highlights` (Play icon — Linen).
   * `Guest Book` (Open book icon — Linen).
   * `Thank You` (Heart icon — Linen).
4. **`AudioMessagesTab.tsx` & `VoiceRecordCard.tsx`:**
   * Header: `AUDIO MESSAGES` + acoustic wave divider + subtitle.
   * Filter Pills: `All (86)` (Active maroon pill) · `Family (24)` · `Friends (38)` · `Colleagues (6)` · `Special Guests (8)`.
   * Voice Record Cards:
     * Guest Avatar (`48px` circle) + Royal Maroon Play/Pause button (`▶` / `⏸`).
     * Speaker Name & Role (`Nour Hassan` / `Best Friend`, `Ahmed El Sayed` / `Brother`, etc.).
     * Quote Snippet (`dir="auto"`, italic).
     * 48-Bar Waveform Scrubber: Clicking seeks playback; displays formatted duration (`0:42`, `1:12`, `0:38`, `0:55`, `1:08`).
     * Favorite Heart (`♡` / `♥`) and Three-Dots Menu (`⋮` Download Single MP3, Share Voice Link, Copy Quote).
   * Audio Engine: Real audio player for URL/Blob + Web Audio harmonic voice simulation for demo records with active ticking duration timer.
   * Video Highlight Banner Card: Left thumbnail (`booth-hero-photo.webp`) with play button + Right label `VIDEO HIGHLIGHT` / `30 Seconds of Your Day` + `>` chevron.
5. **Other Tabs:**
   * `PhotosTab`: Masonry photo gallery with lightbox modal.
   * `VideoHighlightTab`: 30s video highlight player with waveform overlay.
   * `GuestBookTab`: Written blessings + form to leave a new note.
   * `ThankYouTab`: Couple's thank you letter & downloadable keepsake card.
6. **Bottom Actions & Modals:**
   * `MemoryBottomActions.tsx`: Dual buttons `[ ↓ ] Download All Messages` (batch ZIP modal) and `[ < ] Share Love` (Share & QR modal).
   * `MemoryShareQrModal.tsx`: Displays branded Memory Landing Page QR Code, download PNG, copy link, WhatsApp share.
   * `MemoryPinLockGate.tsx`: Optional 4-digit PIN verification gate if memory is private.

---

## 6. Architecture & Design Rules (Chakra UI v3 & TypeScript 5)

### 6.1. Chakra UI v3 Compatibility Constraints
* Monorepo uses `@chakra-ui/react: ^3.32.0`.
* **Prohibited Chakra v2 APIs:** Do NOT import `ModalOverlay`, `FormControl`, `FormLabel`, `useToast`, or `Divider` from `@chakra-ui/react`.
* **Polymorphic Typing Rule:** In Chakra v3, avoid `<Box as="img" src="..." />` or `<Box as="a" href="..." />` because they cause TypeScript TS2322 errors under strict checking. Use standard `<img src="..." />`, native `<a href="...">`, or Chakra `<Image src="..." />`.
* **Timer Type Rule:** Use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout` for browser client code.
* **Module Syntax:** With `verbatimModuleSyntax: true`, type imports must use `import type { ... } from "react"`.

### 6.2. Color Tokens
* Canvas: Warm Alabaster (`#FBF7F2`), Linen Cream (`#F4EFEA`)
* Brand Primary: Royal Maroon (`#6B1D28`), Deep Burgundy (`#5B1621`)
* Accent & Visualizers: Champagne Gold (`#D4AF37`), Light Gold (`#F1E5D1`)
* Noir VIP Surface: `linear-gradient(170deg, #231A1E 0%, #161214 100%)`
* Text: Deep Espresso (`#231F20`), Body (`#4A4240`), Muted (`#7A6F6D`)

---

## 7. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Domain / DB | Appwrite Canonical IDs | Unified database, collection, and storage bucket string constants | None | `ASAR_DATABASE_ID`, `ASAR_COLLECTIONS`, `ASAR_BUCKETS` | Immutable constants | `AGENT_01_*.md` §2.1 |
| 2 | Domain / Models | Complete Document Interfaces | Full TypeScript models for all 8 collections and child objects | Document attributes | Typed interfaces | TypeScript compilation | `ASAR_PROJECT_ARCHITECTURE.md` §6.1 |
| 3 | Domain / Helpers | Safe JSON Parsers | Resilient parsers for plan features, limits, addons, waveforms | Raw JSON strings or objects | Parsed typed arrays/objects | Graceful defaults, zero crash on null/invalid JSON | `AGENT_01_*.md` §2.2 |
| 4 | Domain / Pipeline | 7-Stage Concierge Tracker | Pipeline metadata and progress calculator for client order status | `OrderStatus` string | `{ currentStepIndex, progressPercent, stageInfo }` | Returns step 0 / pending for unrecognized status | `AGENT_01_*.md` §2.3 |
| 5 | Domain / Audio | Audio Metadata & Peak Extractor | Web Audio API decoder for duration and 48-bar waveform peaks | `File`, `barCount=48` | `durationSeconds`, `durationFormatted`, `waveformPeaks` | Deterministic hash waveform fallback on decode failure | `AGENT_01_*.md` §2.4 |
| 6 | Domain / Audio | Smart Filename Parser | Extracts speaker name, role, and category from audio filenames | `filename: string`, `folderName?: string` | `{ speakerName, speakerRole, category }` | Graceful fallback to `Voice Memory #N` / `Guest` | `AGENT_01_*.md` §2.4 |
| 7 | Domain / Email | EmailJS Dispatch Service | Dispatches RSVP approval QR pass or capacity constraint decline | Recipient details, decision, event info | REST API response or `{ simulated: true }` | Graceful simulated success if `.env` keys missing | `AGENT_01_*.md` §2.5 |
| 8 | Domain / QR | QR Code URL Builder | Constructs high-contrast QR code image URL with fallback API | `targetUrl: string`, `size=500` | Fully qualified QR image URL | Falls back to qrserver API if Appwrite offline | `AGENT_01_*.md` §2.5 |
| 9 | Domain / Seed | Default Seed Objects | Comprehensive demo data for plans, memory, and voice records | None | `DEFAULT_BOOTH_PLANS`, `DEMO_BOOTH_MEMORY`, etc. | Embedded in-memory constants | `AGENT_01_*.md` §2.6 |
| 10 | Booth / Booking | Dynamic Plans Hook | Custom hook fetching active plans from Appwrite with cache merge | None | `{ plans, loading, submitBookingOrder }` | Falls back to `DEFAULT_BOOTH_PLANS` + `localStorage` | `AGENT_02_*.md` §2.1 |
| 11 | Booth / Booking | Manual Payment Screenshot Upload | Uploads receipt screenshot to bucket and creates order + payment docs | Booking payload + receipt `File` | `{ orderId, status: "pending_payment" }` | High-res data URL fallback if bucket unprovisioned | `AGENT_02_*.md` §2.1 |
| 12 | Booth / UI | Packages Quota Showcase | Renders active plans, features, and quota strips dynamically | Active plans from hook | Dynamic cards + Sample preview link | Fallback default cards if DB empty | `AGENT_02_*.md` §2.2 |
| 13 | Booth / UI | 4-Step Booking Modal | Guided booking with partner details, addons, and manual payment | Props: `isOpen`, `onClose`, `initialPackage` | Order submission & deep link to client portal | Form validation stops invalid submissions | `AGENT_02_*.md` §2.3 |
| 14 | Booth / Memory | Memory Page Dual Routing | Routes `/memory/:slug` or `?memory=:slug` to presentation view | URL path or query parameter | Renders `<BoothMemoryPage />` or marketing page | Returns to landing page if slug empty or user clicks back | `AGENT_03_*.md` §2.1 |
| 15 | Booth / Memory | Frosted Sticky Top Bar | Alabaster top bar with hamburger menu, logo, and private badge | Couple title, PIN lock status | Sticky header UI + drawer | Adapts to mobile screen width | `AGENT_03_*.md` §2.2.1 |
| 16 | Booth / Memory | Editorial Couple Hero | Full-width couple cover photo with gradient fade, quotes, metadata | Hero photo, couple title, date, location, quote | Luxury hero section | Monogram fallback if photo missing | `AGENT_03_*.md` §2.2.2 |
| 17 | Booth / Memory | 5-Tab Navigation Strip | Rounded tactile tab pills for Audio, Photos, Video, Book, Thanks | Selected tab state | Renders active tab content | Hides Video tab if plan excludes video | `AGENT_03_*.md` §2.2.3 |
| 18 | Booth / Memory | Waveform Voice Cards | Category filter pills + voice cards with interactive 48-bar scrubbers | Voice records array, category filter | Playable interactive cards | Web Audio simulation for records without URL | `AGENT_03_*.md` §2.2.4 |
| 19 | Booth / Memory | Video Highlight Banner Card | 30s video highlight card below voice records linking to video tab | Video thumbnail, title | Banner card with play button | Switches to video tab on click | `AGENT_03_*.md` §2.2.5 |
| 20 | Booth / Memory | Kept Media Tabs | Photos masonry, video player, guestbook blessings, thank you card | Media records array | Tab panels | Empty state placeholders if media empty | `AGENT_03_*.md` §2.2.5 |
| 21 | Booth / Memory | Bottom Action Buttons | "Download All Messages" and "Share Love" action cards | Order limits, memory URL | ZIP feedback modal & Share QR sheet | Gated by plan `allowBulkZipDownload` quota | `AGENT_03_*.md` §2.2.6 |
| 22 | Booth / Memory | Memory Share QR Modal | Popup modal showing landing QR code, PNG download, WhatsApp share | Memory landing page URL | Branded QR modal | Native Web Share API with clipboard fallback | `AGENT_03_*.md` §2.2.6 |
| 23 | Booth / Memory | Private PIN Lock Gate | Blocks access to private memory until 4-digit PIN is entered | PIN code input | Unlocks memory or displays error | Shakes on invalid PIN entry | `AGENT_03_*.md` §2.2 |

---

## 8. Edge Cases & Resilience Behaviors

| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | `audioAnalyzer.extractAudioMetadata` | Non-decodable audio format or Node.js environment without Web Audio API | Falls back to deterministic 48-bar natural peak array computed from filename hash and estimates duration from file size. Zero crash. |
| 2 | `audioAnalyzer.parseVoiceFilename` | Raw camera/recorder filename like `REC_0001.mp3` or `track_42.wav` | Cleans filename into `Voice Memory #1` or `track 42`, sets `speakerRole = "Guest"`, and assigns `category = folderName || "Friends"`. |
| 3 | `models.parsePlanLimits` | Corrupted JSON string or `null` in `limitsJson` | Safely catches syntax error and returns complete default `AsarPlanLimits` object with reasonable quotas. |
| 4 | `orderPipeline.getOrderStageProgress` | Unknown or legacy order status string | Gracefully returns Step 1 (`pending_payment`), 14% progress, and stage details for pending payment. |
| 5 | `emailJsService.sendRsvpDecisionEmail` | Missing `VITE_EMAILJS_SERVICE_ID` or `.env` keys | Logs formatted email body to developer console and returns `{ simulated: true, success: true }`, allowing UI to succeed without throwing. |
| 6 | `emailJsService.buildQrCodeImageUrl` | Appwrite Cloud instance offline or unreachable | Generates identical QR code via public fallback API (`api.qrserver.com`) with matching `#6B1D28` brand colors. |
| 7 | `useBoothBooking` | Appwrite `plans` collection empty or local development offline | Returns `DEFAULT_BOOTH_PLANS` merged with any plans saved by Admin in `localStorage.getItem("asar_synced_plans")`. |
| 8 | `useBoothBooking.submitBookingOrder` | Appwrite `payment_receipts` storage bucket not yet provisioned | Reads receipt `File` as Base64 Data URL, stores preview URL, persists order to `localStorage.getItem("asar_orders_cache")`. |
| 9 | `BoothMemoryPage` | Non-existent slug or Appwrite collection offline | Renders complete `DEMO_BOOTH_MEMORY` (Mina & Maryam) with 5 playable voice cards and realistic waveforms. |
| 10 | `VoiceRecordCard` audio player | Record has no external audio URL (`audioFileUrl` undefined) | Web Audio API harmonic telephone synthesizer simulator plays with active ticking duration counter and synchronized waveform fill. |
| 11 | `VoiceRecordCard` guest avatar | Record has no `avatarFileId` or image | Renders luxury circular monogram badge using `speakerName` initials in champagne gold over royal maroon. |
| 12 | `MemoryPinLockGate` | Memory has `isPrivateLocked: true` | Content is hidden behind PIN lock gate until user inputs matching 4-digit `accessPinCode`. |

---

## 9. Unit Testing Strategy & Verification Commands

Per Acceptance Criteria:
> *"Unit tests for core domain logic (order pipeline transitions, filename parsing, dynamic form validation, and audio analyzer utilities) pass without requiring a live Appwrite instance."*

### 9.1. Execution Engine
Node.js v24.16.0 supports native TypeScript execution and the built-in test runner:
* Command: `node --experimental-strip-types --test <test-file-path>`
* Requires zero external test dependencies (`vitest` or `jest` not needed).

### 9.2. Test Target Matrix
1. **`test/orderPipeline.test.ts`**: Verifies all 7 order pipeline transitions, progress percentages, and client action requirements.
2. **`test/audioAnalyzer.test.ts`**: Verifies filename parsing across Pattern A, B, C, and raw fallbacks, as well as waveform peak normalization.
3. **`test/safeJsonParsers.test.ts`**: Verifies safe extraction of plan features, limits, addons, and client assets when handling malformed or missing JSON.
4. **`test/formValidation.test.ts`**: Verifies dynamic form validation rules, specifically ensuring `guestEmail` is mandatory and properly formatted.

---

## 10. Summary for Downstream Implementation Agents

* **Agent 01:** Ready to create all 7 files in `packages/react-appwrite/src/AsarDomain` and export them in `src/index.ts`. All types, models, constants, and fallback seeds are mapped directly to `ASAR_PROJECT_ARCHITECTURE.md`.
* **Agent 02:** Ready to implement `useBoothBooking.ts` and update `PackagesSection.tsx`, `AddonsSection.tsx`, and `BookingModal.tsx`. Must adhere strictly to Chakra UI v3 typing (no `<Box as="img">` or `<Box as="a">`).
* **Agent 03:** Ready to construct the 13 files for the Booth Memory website and integrate routing into `App.tsx`. All visual assets (`love-wedding.jpg`, `booth-hero-photo.webp`, `screens-booth.jpeg`, `landing-booth.jpeg`, Image #1) are present and verified in `packages/assets-shared/src` and `apps/Booth/public/assets`.

