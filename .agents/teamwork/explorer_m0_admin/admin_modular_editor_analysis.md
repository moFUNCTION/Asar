# Architectural Analysis & Design Document: Admin Modular Website Creation Editor (R2)

> **Document ID:** `ASAR-ARCH-R2-ADMIN-MODULAR-EDITOR`  
> **Author:** Teamwork Explorer Agent (`explorer_m0_admin`)  
> **Status:** Final Architectural Specification  
> **Date:** 2026-11-04  
> **Target Workspaces:** `apps/Admin`, `packages/react-appwrite`, `packages/UI-components`, `apps/Invitation`, `apps/Booth`  

---

## 1. Executive Summary & Problem Formulation

### 1.1. Context & Objective
ASAR (Athar / أثر) is an Awwwards-caliber experiential digital memory and event hospitality platform offering two core luxury services:
1. **ASAR Booth (`apps/Booth`)**: Rotary telephone audio guestbook, mastered voice vault, and digital heirloom memories.
2. **ASAR Invitation (`apps/Invitation`)**: Bespoke interactive digital invitation websites, dynamic RSVP management, and host mailbox workflows.

To rival global category benchmarks—most notably **Chungdoi** ([chungdoi.com/wedding-website](https://chungdoi.com/wedding-website)), **WithJoy**, and **Zola**—ASAR requires a transition from rigid, semi-hardcoded page templates to a **Modular Section-Based Website Creation Editor** within `apps/Admin`.

This document delivers an exhaustive architectural investigation of the current ASAR codebase and presents the complete technical design for **Requirement R2 ("Admin Modular Website Creation Editor")**, defining:
* The exact TypeScript data schema for modular sections (`EventSection` discriminated union, `ModularWebsiteConfig`, `SectionConfigMap`).
* The UI/UX layout for the visual editor (Section Palette / Picker, Reorderable Section Tree, Specialized Config Inspectors, and Interactive Live Preview Canvas).
* The data persistence model leveraging Appwrite v17 collections (`asar-db`), local state caching, and cross-application hydration.
* The end-to-end integration contracts powering interactive features across `apps/Invitation` and `apps/Booth`.

---

## 2. Current State Codebase Audit

A comprehensive exploration of `apps/Admin`, `packages/react-appwrite`, `packages/UI-components`, and `apps/Invitation` was performed.

### 2.1. `apps/Admin` Existing Studios & Workflows
The Admin application is built with **React 18**, **TypeScript 5**, **Chakra UI v3**, and **React Router v6**. It currently exposes four primary modules via `apps/Admin/src/App.tsx`:
1. **Dashboard & Orders Queue (`AdminOverview.tsx`, `OrdersQueueManager.tsx`)**:
   - Manages client orders (`AsarOrder`), payment receipts (`AsarPayment`), manual approval/rejection workflows, and deep-link routing (`/orders/:orderId`).
2. **Plan Builder Studio (`PlanBuilderStudio.tsx`)**:
   - Dynamic tier builder with configurable quotas (`maxVoiceRecords`, `maxGalleryPhotos`, `maxRsvpCapacity`, `hasVideoHighlight`, `allowCustomSections`).
3. **Booth Memory Studio (`apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx`)**:
   - Split-screen studio for audio mastering, bulk voice uploading (`BulkVoiceUploader.tsx`), waveform peak visualization (`audioAnalyzer.ts`), and memory metadata.
4. **Invitation Studio (`apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`)**:
   - Implements a 3-tab layout:
     - **Tab 1: `ThemeAndEffectsPanel.tsx`**: Color swatches (primary, secondary, gold, background), Arabic/English typography (`Amiri`, `Cairo`, `Playfair Display`), and WebGL effect selection (`GradientWaves`, `DitherVeil`, `CrystalizedBall`).
     - **Tab 2: `SectionBlocksManager.tsx`**: Flat block manager allowing reordering and toggling of 7 hardcoded block types (`hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, `rsvp_form`).
     - **Tab 3: `DynamicFormSchemaBuilder.tsx`**: RSVP questionnaire builder with hard-locked mandatory `guestEmail`.
   - Coupled with **`LiveInvitationPreview.tsx`**, an interactive preview frame mimicking an iPhone 16 Pro (390px) or full desktop width.

### 2.2. Shared Package Audit (`packages/`)
* **`@repo/react-appwrite` (`packages/react-appwrite/src`)**:
  - `AsarDomain/models.ts`: Defines shared types including `AsarOrder`, `AsarPlan`, `BoothMemory`, `BoothVoiceRecord`, `InvitationSectionBlock`, and `InvitationThemeConfig`.
  - `AsarDomain/collections.ts`: Declares Appwrite collections:
    ```ts
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
    ```
  - `Storefront/`: Provides `useSubdomain`, RFC 1123 slug validation (`validateSubdomainSlug`), 16 reserved subdomain guards, and canonical URL builders (`buildMemoryUrls`).
* **`@repo/ui-components` (`packages/UI-components/src`)**:
  - 24 Awwwards-grade interactive components including `GradientWaves`, `BlurText`, `SplitText`, `CircularGallery`, `DecayCard`, `TiltedCard`, `CountUp`, `Magnet`, and `SplashCursor`.

### 2.3. Storefront Renderer Audit (`apps/Invitation`)
* In `apps/Invitation/src/pages/CustomEventPage.tsx` and `components/renderer/`:
  - The renderer parses `themeConfigJson`, `scheduleJson`, `galleryJson`, `dressCodeJson`, and `formSchemaJson`.
  - **Critical Finding**: In `CustomEventPage.tsx` (lines 430–470), page sections are currently rendered in a **static, hardcoded vertical sequence** (`EventHeroSection` -> `EventCountdownSection` -> `EventScheduleSection` -> `EventMediaGallery` -> `EventLocationMap` -> `DynamicRsvpForm`).
  - The page ignores the arbitrary order, duplicates, or omissions present in `sectionsConfigJson`.
  - Crucial modern sections required by Chungdoi/WithJoy (Wishing Wall, Digital Bank QR / Gift Registry, Floating Background Music Player) do not have dedicated admin configuration or renderer components.

### 2.4. Architectural Gap Analysis

| Feature / Capability | Current Implementation | Target Modular Architecture (R2) | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Section Data Schema** | Flat optional fields on `InvitationSectionBlock` with untyped JSON blobs | Strongly typed **discriminated union** (`EventSection`) with dedicated payload schemas | **High** |
| **Section Catalog** | 7 basic blocks; missing Wishing Wall, Bank QR/Gift, Music Player | 11+ modular section types with extensible registry pattern | **High** |
| **Section Palette / Picker** | Only a single hardcoded "+ Add Highlight" button | Visual Section Picker drawer/modal categorized with live thumbnails and feature tags | **Medium** |
| **Section Config Inspector** | Monolithic switch-case inside `SectionBlocksManager.tsx` | Specialized, dedicated inspector components per section type with validation & default presets | **High** |
| **Section Reordering** | Basic Up/Down array swapping with locked RSVP block | Drag-and-drop handles + accessible Up/Down, clone, toggle, and delete controls | **Medium** |
| **Live Dynamic Rendering** | Hardcoded component sequence in preview and page | Dynamic section dispatcher mapping over `sections.filter(s => s.enabled).sort((a,b) => a.order - b.order)` | **High** |
| **Wishing Wall / Guestbook** | Not implemented | Real-time interactive guestbook with likes, blessings, host moderation, and emoji reactions | **High** |
| **Digital Gift / Bank QR** | Not implemented | Configurable bank details, IBAN copy button, InstaPay username/QR, Vodafone Cash, honeymoon fund | **High** |
| **Background Music Player** | Theme boolean only; no player UI or audio asset management | Audio soundtrack bar with play/pause, volume, vinyl rotation animation, and loop settings | **High** |

---

## 3. Competitive Benchmark Analysis: Chungdoi, WithJoy & Zola

An architectural review of benchmark platforms reveals key design patterns essential for a modern event creation suite:

### 3.1. Chungdoi ([chungdoi.com/wedding-website](https://chungdoi.com/wedding-website))
* **Visual Modularity**: Pages are treated as vertical storytelling reels. Each section is a self-contained card or viewport canvas with bespoke typography and decorative dividers.
* **Core Vietnamese & Regional Nuance**:
  - **Digital Blessing Box (Mừng Cưới / Hộp Mừng Cưới)**: Prominent bank account details and instant QR scanning (VietQR / InstaPay equivalent) are vital for modern guests unable to bring cash envelopes.
  - **Wishing Wall (Sổ Lưu Bút Online)**: Guests leave personalized wishes and photos before and during the event.
  - **Background Music**: Autoplay or one-touch atmospheric audio player accompanying the invitation scrolling experience.
  - **Multi-Event Timeline**: Explicit breakdown of ceremonies (Traditional Engagement / Lễ Đính Hôn, Katb Ketab / Ceremony, Main Reception / Tiệc Cưới).

### 3.2. WithJoy & Zola
* **Zero-Friction Reordering**: Organizers can drag sections up or down, duplicate layout blocks for multi-day itineraries, and hide optional sections (e.g. registry) without losing entered data.
* **Live Side-by-Side Mobile Mirror**: Instant visual feedback as text, images, or colors are edited without page reloads.
* **Separation of Concerns**: Global aesthetic styling (fonts, palettes, animations) is managed separately from content blocks.

---

## 4. Proposed TypeScript Data Architecture

To ensure strict type safety, zero regressions, and effortless serializability, the section model is formalized as an extensible **discriminated union**.

### 4.1. Core Types & Discriminated Union (`EventSection`)

```typescript
// ============================================================================
// ASAR Modular Website Architecture — TypeScript Domain Schema (R2)
// File Location: packages/react-appwrite/src/AsarDomain/modularSections.ts
// ============================================================================

export type SectionType =
  | "cover_hero"
  | "couple_story"
  | "event_schedule"
  | "photo_gallery"
  | "wishing_wall"
  | "digital_gift_registry"
  | "background_audio"
  | "venue_location"
  | "live_countdown"
  | "custom_highlight"
  | "dynamic_rsvp";

export interface SectionBase {
  id: string;
  type: SectionType;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  enabled: boolean;
  isLocked?: boolean; // Locked blocks (e.g. dynamic_rsvp) cannot be deleted
  order: number;
  spacing?: "compact" | "normal" | "spacious";
  customCssClass?: string;
}

// ----------------------------------------------------------------------------
// 1. Cover / Hero Section
// ----------------------------------------------------------------------------
export interface CoverHeroSectionConfig {
  badgeTextEn?: string; // e.g. "CORDIALLY INVITE YOU TO CELEBRATE"
  badgeTextAr?: string; // e.g. "يتشرفان بدعوة سيادتكم لمشاركتهما فرحة العمر"
  mainTitleEn: string;  // e.g. "Omar & Layla"
  mainTitleAr: string;  // e.g. "عمر و ليلى"
  taglineEn?: string;
  taglineAr?: string;
  coverImageUrl: string;
  coverVideoUrl?: string; // Optional ambient looping mp4/webm
  datePillEn?: string;  // e.g. "Friday, 20 November 2026"
  datePillAr?: string;  // e.g. "الجمعة، ٢٠ نوفمبر ٢٠٢٦"
  timePillEn?: string;  // e.g. "07:30 PM AST"
  timePillAr?: string;  // e.g. "٠٧:٣٠ مساءً"
  venuePillEn?: string; // e.g. "Four Seasons San Stefano"
  venuePillAr?: string; // e.g. "فورسيزونز سان ستيفانو"
  ctaTextEn?: string;   // e.g. "RSVP Now"
  ctaTextAr?: string;   // e.g. "تأكيد الحضور"
  overlayOpacity?: number; // 0.0 to 1.0
  textAlignment?: "center" | "left" | "right";
}

export interface CoverHeroSection extends SectionBase {
  type: "cover_hero";
  config: CoverHeroSectionConfig;
}

// ----------------------------------------------------------------------------
// 2. Couple Story / Milestone Timeline Section
// ----------------------------------------------------------------------------
export interface StoryMilestoneItem {
  id: string;
  yearOrDate: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl?: string;
  quoteSnippet?: string;
}

export interface CoupleStorySectionConfig {
  layoutMode: "alternating-timeline" | "editorial-cards" | "carousel";
  quoteEn?: string;
  quoteAr?: string;
  items: StoryMilestoneItem[];
}

export interface CoupleStorySection extends SectionBase {
  type: "couple_story";
  config: CoupleStorySectionConfig;
}

// ----------------------------------------------------------------------------
// 3. Multi-Event Schedule / Itinerary Section
// ----------------------------------------------------------------------------
export interface ScheduleEventItem {
  id: string;
  timeDisplay: string; // e.g. "07:00 PM"
  titleEn: string;     // e.g. "Welcome Drinks & Red Carpet"
  titleAr: string;     // e.g. "استقبال الضيوف والمشروبات الترحيبية"
  descriptionEn?: string;
  descriptionAr?: string;
  locationNameEn?: string; // e.g. "Grand Ballroom Courtyard"
  locationNameAr?: string;
  dressCodeBadgeEn?: string; // e.g. "Black Tie / Tuxedo"
  dressCodeBadgeAr?: string;
  icon?: "cocktail" | "ring" | "dinner" | "music" | "camera" | "cake" | "party";
}

export interface EventScheduleSectionConfig {
  layoutMode: "vertical-timeline" | "grouped-days" | "minimal-cards";
  calendarAddToGoogleEnabled?: boolean;
  calendarAddToAppleEnabled?: boolean;
  events: ScheduleEventItem[];
}

export interface EventScheduleSection extends SectionBase {
  type: "event_schedule";
  config: EventScheduleSectionConfig;
}

// ----------------------------------------------------------------------------
// 4. Photo & Media Gallery Section
// ----------------------------------------------------------------------------
export interface GalleryMediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  captionEn?: string;
  captionAr?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

export interface PhotoGallerySectionConfig {
  displayMode:
    | "circular-3d"     // UI-components CircularGallery 3D cylinder
    | "polaroid-decay"  // UI-components DecayCard interactive physics
    | "bento-masonry"   // Responsive luxury grid
    | "lightbox-slider"; // Classic swipeable carousel
  enableFullscreenLightbox: boolean;
  images: GalleryMediaItem[];
}

export interface PhotoGallerySection extends SectionBase {
  type: "photo_gallery";
  config: PhotoGallerySectionConfig;
}

// ----------------------------------------------------------------------------
// 5. Wishing Wall / Digital Guestbook Section (Chungdoi Benchmark)
// ----------------------------------------------------------------------------
export interface WishingWallMessage {
  id: string;
  authorName: string;
  relationshipTag?: string; // "Family", "Friend", "Colleague"
  message: string;
  createdAt: string;
  likesCount: number;
  avatarUrl?: string;
  isPinned?: boolean;
  isApproved?: boolean; // Host moderation status
}

export interface WishingWallSectionConfig {
  allowAnonymousGuests: boolean;
  moderationRequired: boolean; // If true, wishes require client approval before appearing
  maxCharacterLimit: number;   // e.g. 500
  promptHeadingEn?: string;    // "Leave a Blessing for Omar & Layla"
  promptHeadingAr?: string;    // "اترك كلمة طيبة ودعوة من القلب للعروسين"
  allowPhotoAttachment: boolean;
  initialPinnedMessages?: WishingWallMessage[];
}

export interface WishingWallSection extends SectionBase {
  type: "wishing_wall";
  config: WishingWallSectionConfig;
}

// ----------------------------------------------------------------------------
// 6. Digital Gift Registry / Bank QR Blessing Box (Chungdoi Benchmark)
// ----------------------------------------------------------------------------
export interface BankAccountTarget {
  id: string;
  beneficiaryName: string; // e.g. "Omar Mohamed & Layla Mansoor"
  bankNameEn: string;      // e.g. "Commercial International Bank (CIB)"
  bankNameAr: string;      // e.g. "البنك التجاري الدولي (CIB)"
  accountNumber: string;   // e.g. "100029384812"
  iban: string;            // e.g. "EG38001000000000100029384812"
  swiftCode?: string;      // e.g. "CIBEEGCX"
  branchName?: string;     // e.g. "San Stefano Branch"
  qrCodeImageUrl?: string; // Pre-generated static bank/payment QR
}

export interface InstaPayWalletTarget {
  id: string;
  instaPayUsername: string; // e.g. "omar.layla@instapay"
  phoneNumber?: string;     // e.g. "+201001234567"
  qrCodeImageUrl?: string;  // InstaPay QR Code
  labelEn: string;          // e.g. "InstaPay Direct Transfer"
  labelAr: string;          // e.g. "تحويل فوري عبر إنستاباي"
}

export interface DigitalGiftRegistrySectionConfig {
  eyebrowEn?: string;       // "WEDDING BLOCKED / GIFT REGISTRY"
  eyebrowAr?: string;       // "صندوق البركة والتهنئة"
  introMessageEn?: string;  // "Your love and presence are the greatest gift. For those who wish to honor us with a gift..."
  introMessageAr?: string;  // "حضوركم ومشاركتكم فرحتنا هي أغلى هدية. ولمن أراد أن يبارك لنا بهدية تذكارية..."
  enableBankAccounts: boolean;
  enableInstaPay: boolean;
  enableExternalRegistryLinks: boolean;
  bankAccounts: BankAccountTarget[];
  instaPayWallets: InstaPayWalletTarget[];
  externalRegistryLinks?: Array<{
    id: string;
    storeName: string;
    url: string;
    logoUrl?: string;
  }>;
}

export interface DigitalGiftRegistrySection extends SectionBase {
  type: "digital_gift_registry";
  config: DigitalGiftRegistrySectionConfig;
}

// ----------------------------------------------------------------------------
// 7. Background Audio Soundtrack Player Section
// ----------------------------------------------------------------------------
export interface BackgroundAudioSectionConfig {
  audioUrl: string;         // Stream URL (MP3/AAC from Appwrite Storage or external CDN)
  songTitle: string;        // e.g. "A Thousand Years (Acoustic Piano & Cello)"
  artistName: string;       // e.g. "The Athar Chamber Quartet"
  autoplayOnFirstGesture: boolean; // Standard browser audio policy compliance
  loop: boolean;
  floatingPlayerVisible: boolean; // Persistent bottom-right/bottom-left floating pill
  vinylCoverArtUrl?: string;
}

export interface BackgroundAudioSection extends SectionBase {
  type: "background_audio";
  config: BackgroundAudioSectionConfig;
}

// ----------------------------------------------------------------------------
// 8. Venue Location, Interactive Map & Accommodation Section
// ----------------------------------------------------------------------------
export interface DressCodeSwatch {
  hex: string;
  labelEn: string;
  labelAr: string;
}

export interface VenueLocationSectionConfig {
  venueNameEn: string;
  venueNameAr: string;
  addressEn: string;
  addressAr: string;
  googleMapsUrl: string;
  coordinates?: { lat: number; lng: number };
  parkingAndValetNotesEn?: string;
  parkingAndValetNotesAr?: string;
  hotelAccommodationNotesEn?: string;
  hotelAccommodationNotesAr?: string;
  dressCodeTitleEn?: string; // "Black Tie & Evening Glamour"
  dressCodeTitleAr?: string; // "أزياء السهرة الرسمية الفاخرة"
  dressCodeNotesEn?: string;
  dressCodeNotesAr?: string;
  dressCodeSwatches?: DressCodeSwatch[];
}

export interface VenueLocationSection extends SectionBase {
  type: "venue_location";
  config: VenueLocationSectionConfig;
}

// ----------------------------------------------------------------------------
// 9. Live Countdown Timer Section
// ----------------------------------------------------------------------------
export interface LiveCountdownSectionConfig {
  targetTimestamp: string;  // ISO 8601 string, e.g. "2026-11-20T19:30:00Z"
  headingEn?: string;       // "Counting Down to Our Forever"
  headingAr?: string;       // "العد التنازلي لبداية حكايتنا"
  postCountdownMessageEn?: string; // "Today is the Day!"
  postCountdownMessageAr?: string; // "اليوم موعدنا!"
  visualStyle: "glass-pills" | "gold-borders" | "minimalist-digits";
}

export interface LiveCountdownSection extends SectionBase {
  type: "live_countdown";
  config: LiveCountdownSectionConfig;
}

// ----------------------------------------------------------------------------
// 10. Custom Editorial Highlight / Scripture / Verse Section
// ----------------------------------------------------------------------------
export interface CustomHighlightSectionConfig {
  badgeEn?: string;       // "✦ SCRIPTURE / QUOTE"
  badgeAr?: string;       // "✦ آية مباركة"
  mainHeadingEn?: string;
  mainHeadingAr?: string;
  bodyTextEn: string;     // Rich poetic verse or host thank-you note
  bodyTextAr: string;
  signatureEn?: string;   // e.g. "Omar & Layla"
  signatureAr?: string;   // e.g. "عمر و ليلى"
  accentImageUrl?: string;
}

export interface CustomHighlightSection extends SectionBase {
  type: "custom_highlight";
  config: CustomHighlightSectionConfig;
}

// ----------------------------------------------------------------------------
// 11. Dynamic RSVP Form Section (Permanently Anchored & Locked)
// ----------------------------------------------------------------------------
export interface DynamicRsvpSectionConfig {
  headingEn?: string;     // "RSVP & Guest Pass"
  headingAr?: string;     // "تأكيد الحضور وبطاقة الدخول الرقمية"
  subheadingEn?: string;  // "Kindly reply by 1 November 2026"
  subheadingAr?: string;  // "نرجو تأكيد الحضور قبل ١ نوفمبر ٢٠٢٦"
  capacityWarningNoteEn?: string;
  capacityWarningNoteAr?: string;
  // Dynamic form fields are defined in dynamicFormSchema
}

export interface DynamicRsvpSection extends SectionBase {
  type: "dynamic_rsvp";
  config: DynamicRsvpSectionConfig;
}

// ----------------------------------------------------------------------------
// Master Discriminated Union
// ----------------------------------------------------------------------------
export type EventSection =
  | CoverHeroSection
  | CoupleStorySection
  | EventScheduleSection
  | PhotoGallerySection
  | WishingWallSection
  | DigitalGiftRegistrySection
  | BackgroundAudioSection
  | VenueLocationSection
  | LiveCountdownSection
  | CustomHighlightSection
  | DynamicRsvpSection;
```

### 4.2. Complete Modular Website Root Configuration (`ModularWebsiteConfig`)

```typescript
export interface ModularWebsiteConfig {
  version: "2.0";
  id: string;               // Document ID, e.g. "INV-ORD-915"
  orderId: string;          // Foreign Key to asar-db.orders
  clientId: string;         // Appwrite Auth User ID
  slug: string;             // RFC 1123 DNS Subdomain Slug (e.g. "omar-and-layla")
  occasionType: "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
  eventTitle: string;
  eventDate: string;        // YYYY-MM-DD
  eventTime: string;        // HH:mm
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  maxCapacity: number;
  isPublished: boolean;
  qrCodeUrl: string;
  
  // Visual Theme Engine
  theme: {
    primaryColor: string;       // e.g. "#6B1D28"
    secondaryColor: string;     // e.g. "#D4AF37"
    accentGoldColor: string;    // e.g. "#F3E5AB"
    backgroundColor: string;    // e.g. "#FBF7F2"
    surfaceColor: string;       // e.g. "#FFFFFF"
    textColor: string;          // e.g. "#231F20"
    fontDisplay: string;        // e.g. "'Amiri', 'Playfair Display', serif"
    fontBody: string;           // e.g. "'Cairo', sans-serif"
    direction: "rtl" | "ltr";
    webGlEffect: "waves" | "veil" | "ball" | "none";
    enableParticles: boolean;
  };

  // Modular Composable Sections (Ordered Sequence)
  sections: EventSection[];

  // Dynamic RSVP Form Questionnaire
  formFields: DynamicFormField[];

  createdAt: string;
  updatedAt: string;
}
```

### 4.3. Backward-Compatibility Migration Strategy
To ensure that existing invitations stored in Appwrite or localStorage continue to function without data loss, a migration utility parses legacy payloads:
* Legacy `InvitationSectionBlock[]` (which used flat, optional fields like `coverImageUrl`, `timelineItems`, `galleryImages`) is automatically detected if `config` is missing.
* A mapper transforms legacy blocks into their corresponding `EventSection` counterparts:
  - `hero` -> `cover_hero`
  - `countdown` -> `live_countdown`
  - `story_timeline` -> `couple_story` or `event_schedule`
  - `gallery` -> `photo_gallery`
  - `venue_map` -> `venue_location`
  - `custom_highlight` -> `custom_highlight`
  - `rsvp_form` -> `dynamic_rsvp`
* New sections (`wishing_wall`, `digital_gift_registry`, `background_audio`) are appended with sensible defaults if not present.

---

## 5. UI/UX Layout Architecture for the Modular Editor

The Modular Editor in `apps/Admin` is structured into four cohesive visual systems:

```
+-----------------------------------------------------------------------------------------------------------------------+
|  ASAR MODULAR WEBSITE EDITOR  •  Order #ORD-8819  •  Omar & Layla  •  Subdomain: [ omar-and-layla.asar.me ]          |
|  [ 🌐 Canonical Storefront ]  [ 📱 QR Pass ]  [ 📥 Pull Client Assets ]  [ 💾 Save Draft ]  [ 🚀 Save & Publish ]     |
+-----------------------------------------------------------------------------------+-----------------------------------+
|  BUILDER CONTROLS & INSPECTORS (60% Width)                                        |  LIVE INTERACTIVE PREVIEW (40%)   |
|                                                                                   |                                   |
|  [ Tab 1: Theme & Shaders ]  [ Tab 2: Modular Sections (9) ]  [ Tab 3: RSVP Form ]|  [ 📱 Mobile ] [ 💻 Desktop ]      |
|  -------------------------------------------------------------------------------  |  +-----------------------------+  |
|  SECTION REORDER TREE (Drag/Up/Down, Toggle 👁️, Configure ✎, Clone ⎘, Delete 🗑️):  |  | [Audio: Playing "A Thousand"]|  |
|                                                                                   |  |                             |  |
|  ⠿ #1  [👁️] 🏛️ COVER HERO SHOWCASE                                          [▲][▼]  |  | [Cover Hero: Omar & Layla]  |  |
|  ⠿ #2  [👁️] ⏱️ LIVE COUNTDOWN TIMER                                          [▲][▼]  |  |                             |  |
|  ⠿ #3  [👁️] 📖 OUR STORY & MILESTONES                                        [▲][▼]  |  | [Countdown: 14d : 08h : 22m]|  |
|  ⠿ #4  [👁️] 📅 MULTI-EVENT SCHEDULE & PROGRAM                                [▲][▼]  |  |                             |  |
|  ⠿ #5  [👁️] 📸 PHOTO & MEMORY GALLERY (Mode: Circular 3D)                   [▲][▼]  |  | [Our Love Story Timeline]   |  |
|  ⠿ #6  [👁️] 💬 WISHING WALL & GUESTBOOK (12 Wishes)                          [▲][▼]  |  |                             |  |
|  ⠿ #7  [👁️] 🎁 DIGITAL GIFT REGISTRY & BANK QR                               [▲][▼]  |  | [Program Schedule: 4 Events]|  |
|  ⠿ #8  [👁️] 📍 VENUE LOCATION & DRESS CODE                                   [▲][▼]  |  |                             |  |
|  ⠿ #9  [🔒] ✉️ DYNAMIC RSVP REGISTRATION (Anchored)                                 |  | [Photo Gallery 3D Revolving]|  |
|                                                                                   |  |                             |  |
|  [ + ADD NEW SECTION (Open Palette) ]                                             |  | [Wishing Wall: Post a Wish] |  |
|  -------------------------------------------------------------------------------  |  |                             |  |
|  ACTIVE SECTION INSPECTOR: 💬 Wishing Wall & Guestbook Configuration              |  | [Digital Gift: Bank QR / IBAN]  |
|  • Moderation Policy:      [ (x) Auto-Approve  ( ) Require Host Review ]          |  |                             |  |
|  • Allow Photo Attachment: [ ☑ Enabled ]                                          |  | [Venue & Dress Code Swatches]|
|  • Prompt Heading (Arabic): [ شاركونا أمنياتكم ودعواتكم الطيبة ]                 |  |                             |  |
|  • Character Limit:        [ 500 characters ]                                     |  | [RSVP Dynamic Registration] |  |
|  • Pre-seeded Host Wishes: [ 2 Pinned Blessings ]  [ + Add Pinned ]               |  +-----------------------------+  |
+-----------------------------------------------------------------------------------+-----------------------------------+
```

### 5.1. Component 1: Section Palette / Picker (Modal & Drawer)
* Invoked by clicking **`+ Add New Section`**.
* Displays a curated catalog of available section cards, grouped into categories:
  - **Essence & First Impressions**: Cover Hero (`cover_hero`), Live Countdown (`live_countdown`).
  - **Narrative & Program**: Couple Story (`couple_story`), Event Schedule (`event_schedule`), Custom Highlight (`custom_highlight`).
  - **Media & Expression**: Photo Gallery (`photo_gallery`), Wishing Wall (`wishing_wall`), Background Audio (`background_audio`).
  - **Hospitality & Logistics**: Venue Location (`venue_location`), Digital Gift Registry (`digital_gift_registry`).
* Each card includes an icon, an Arabic/English label, a brief description, and an preview thumbnail.
* Clicking **`Insert Section`** appends the block into the stack immediately prior to the anchored `dynamic_rsvp` block and opens its Config Inspector.

### 5.2. Component 2: Section Reorder List
* Each block in the list displays:
  - Drag handle (`⠿`) and sequence badge (`#1`, `#2`, ...).
  - Section type icon and title.
  - Active status badges (e.g. `Mode: Circular 3D`, `12 Wishes`, `Locked`).
  - Quick action toolbar:
    - **Visibility Toggle (`👁️ Visible` / `✕ Hidden`)**: Allows disabling a section without deleting its configured contents.
    - **Order Buttons (`▲ Up` / `▼ Down`)**: Accessible manual reordering with bounds protection.
    - **Duplicate (`⎘`)**: Clones the section with a new unique ID and identical configuration.
    - **Delete (`🗑️`)**: Permanently removes optional sections (disabled on `dynamic_rsvp`).
    - **Expand/Collapse Chevron**: Toggles the inline Config Inspector.

### 5.3. Component 3: Specialized Section Config Inspectors
Each section type renders a tailored configuration form avoiding generic JSON editing:
1. **Wishing Wall Inspector**:
   - Moderation radio toggle (Auto-publish vs. Host approval queue).
   - Maximum character limit input.
   - Pinned host blessings manager (add/remove pre-seeded congratulatory messages).
2. **Digital Gift Registry Inspector**:
   - Tabbed bank account sub-form (Beneficiary Name, Bank Name Arabic/English, Account Number, IBAN format validator, SWIFT code).
   - InstaPay sub-form (Username `@instapay`, mobile wallet number, QR screenshot uploader).
   - Copyable payload preview verifying how the guest will interact with the clipboard.
3. **Background Audio Inspector**:
   - Audio file uploader / MP3 CDN URL input.
   - Track title and artist name inputs.
   - Floating music pill toggle and vinyl spinning cover artwork upload.
   - Autoplay policy compliance notes (informs admin that browsers require user gesture to initiate sound).
4. **Event Schedule Inspector**:
   - Add/Remove timeline milestones.
   - Time picker, event title, dress code pill, icon picker, and location badge.
5. **Photo Gallery Inspector**:
   - Mode switcher dropdown: `CircularGallery 3D`, `DecayCard Polaroids`, `Bento Masonry`, `Lightbox Slider`.
   - Multi-URL textarea with drag-and-drop batch file upload directly to Appwrite `invitation_assets` bucket.

### 5.4. Component 4: Live Interactive Preview Canvas
* Split-screen right column (40% width) featuring:
  - Viewport mode toggle: **Mobile (390px iPhone frame)** vs. **Full Width Desktop**.
  - Dynamic Section Renderer looping through `sections.filter(s => s.enabled)` and dispatching each to its respective preview component.
  - Fully functional client-side interactive widgets:
    - Guests can actually type a wish in the Wishing Wall and see it animate into the list.
    - Guests can click the IBAN copy button and receive immediate toast confirmation.
    - The audio player bar can be toggled on/off to preview soundtrack quality.
    - Live countdown digits tick every second in real-time.

---

## 6. Data Persistence & Architecture

### 6.1. Appwrite Storage Strategy (`asar-db`)
Configurations are stored in the existing Appwrite database collection `invitations` (`ASAR_COLLECTIONS.INVITATIONS`) within `asar-db`:
* **`sectionsConfigJson`**: Stores `JSON.stringify(config.sections)`. With modern Appwrite string/text attributes supporting up to 10–64 MB, full serialized section arrays comfortably reside here.
* **`themeConfigJson`**: Stores `JSON.stringify(config.theme)`.
* **`formSchemaJson`**: Stores `JSON.stringify(config.formFields)`.
* **Top-level indexed attributes**: `slug`, `orderId`, `clientId`, `eventTitle`, `occasionType`, `eventDate`, `eventTime`, `venueName`, `maxCapacity`, `isPublished`, `qrCodeUrl`.

### 6.2. Two-Tier Cache Fusion & Local Development Sync
To guarantee resilience when running across separate Turborepo dev ports (`:3001` Admin, `:3003` Invitation, `:3004` Dedicated Renderer):
1. **Primary Persistence**: Upon clicking **Save & Publish**, the editor writes directly to Appwrite via `databases.createDocument` or `databases.updateDocument`.
2. **Local Synchronous Cache**: Simultaneously updates `localStorage.setItem("asar_invitations_cache", ...)` and `localStorage.setItem("asar_active_invitation", ...)`.
3. **Cross-Tab Broadcast**: Emits a `window.dispatchEvent(new Event("storage"))` and custom broadcast channel event so the Live Preview and external renderer windows immediately hot-reload without refreshing.

### 6.3. File Assets & Appwrite Storage Buckets
* Audio files (`.mp3`, `.m4a`), gallery photos (`.webp`, `.jpg`), and InstaPay QR codes are uploaded using `useUpload` to the canonical bucket:
  - `ASAR_BUCKETS.INVITATION_ASSETS` (`invitation_assets`).
* Returned `fileId` values are resolved to public view URLs via `storage.getFileView(ASAR_BUCKETS.INVITATION_ASSETS, fileId)`.

---

## 7. Cross-App Integration Contracts

### 7.1. Contract between `apps/Admin` and `apps/Invitation`
* `apps/Admin` acts as the **Authoring and Configuration Authority**. It writes `ModularWebsiteConfig` to Appwrite.
* `apps/Invitation` acts as the **Storefront Presentation and Guest Interaction Engine**:
  - `CustomEventPage.tsx` resolves the invitation via subdomain or slug parameter (`useSubdomain`).
  - It reads `sectionsConfigJson`, deserializes it into `EventSection[]`, and dynamically maps each section:
    ```tsx
    {sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order)
      .map((section) => {
        switch (section.type) {
          case "cover_hero":
            return <EventHeroSection key={section.id} config={section.config} theme={theme} />;
          case "couple_story":
            return <EventStorySection key={section.id} config={section.config} theme={theme} />;
          case "event_schedule":
            return <EventScheduleSection key={section.id} config={section.config} theme={theme} />;
          case "photo_gallery":
            return <EventMediaGallery key={section.id} config={section.config} theme={theme} />;
          case "wishing_wall":
            return <EventWishingWallSection key={section.id} invitationId={invitation.id} config={section.config} theme={theme} />;
          case "digital_gift_registry":
            return <EventGiftRegistrySection key={section.id} config={section.config} theme={theme} />;
          case "background_audio":
            return <FloatingAudioPlayer key={section.id} config={section.config} />;
          case "venue_location":
            return <EventLocationMap key={section.id} config={section.config} theme={theme} />;
          case "live_countdown":
            return <EventCountdownSection key={section.id} config={section.config} theme={theme} />;
          case "custom_highlight":
            return <EventHighlightSection key={section.id} config={section.config} theme={theme} />;
          case "dynamic_rsvp":
            return <DynamicRsvpForm key={section.id} invitation={invitation} schema={formFields} theme={theme} onPreviewPass={onOpenPass} />;
          default:
            return null;
        }
      })}
    ```

### 7.2. Alignment with `apps/Booth`
* The photo gallery images and client-submitted couple assets (`coupleTitle`, `coupleQuote`, `heroImageUrl`, `customCategories`) are shared through the client order record (`clientSubmittedAssetsJson`).
* The Admin can click **`Apply Client Requests`** in both Booth Studio and Invitation Studio to auto-populate the couple's names, event date, venue, and shared photo assets from the common order pipeline.

---

## 8. Implementation Roadmap

The execution of Requirement R2 will be structured into five focused milestones:

### Milestone 1: Domain Schemas & Migration Utilities (`@repo/react-appwrite`)
- [ ] Create `packages/react-appwrite/src/AsarDomain/modularSections.ts` with discriminated union `EventSection`, all 11 section payload interfaces, and `ModularWebsiteConfig`.
- [ ] Create `migrateLegacyBlocksToModularConfig()` utility to ensure 100% backward compatibility with existing orders and demo records.
- [ ] Export schemas from `packages/react-appwrite/src/index.ts`.

### Milestone 2: Section Catalog & Palette Component (`apps/Admin`)
- [ ] Implement `SectionPaletteModal.tsx` in `apps/Admin/src/components/invitation-studio/`.
- [ ] Populate catalog with visual cards for Wishing Wall, Bank QR / Gift Registry, Background Audio, Couple Story, and Schedule.
- [ ] Wire insertion logic to append new blocks into active state before the anchored RSVP block.

### Milestone 3: Specialized Section Config Inspectors (`apps/Admin`)
- [ ] Refactor `SectionBlocksManager.tsx` to host dedicated inspector components:
  - `WishingWallInspector.tsx` (Moderation, character limit, pinned greetings).
  - `GiftRegistryInspector.tsx` (Bank IBAN formatting, InstaPay QR upload).
  - `BackgroundAudioInspector.tsx` (Track info, audio URL, autoplay).
  - `CoupleStoryInspector.tsx` (Milestones, dates, descriptions).
  - `ScheduleInspector.tsx` (Multi-event timelines).
  - `PhotoGalleryInspector.tsx` (3D vs. Polaroid vs. Bento mode switcher).
- [ ] Update block controls: Up/Down reordering, duplicate, delete, and visibility toggle.

### Milestone 4: Enhanced Live Preview & Storefront Renderer (`apps/Admin` & `apps/Invitation`)
- [ ] Update `LiveInvitationPreview.tsx` in `apps/Admin` to dynamically map all 11 section types using the active theme.
- [ ] Implement interactive Wishing Wall preview widget with local state message submission.
- [ ] Implement interactive Bank QR / IBAN copy widget with copy-to-clipboard feedback.
- [ ] Implement floating background audio player bar.
- [ ] Update `apps/Invitation/src/pages/CustomEventPage.tsx` to dynamically iterate over `sectionsConfigJson` in sorted order.

### Milestone 5: Verification, Tests & Quality Checks
- [ ] Validate typechecking across `packages/react-appwrite`, `apps/Admin`, and `apps/Invitation` (`tsc -b`).
- [ ] Test order switching and asset auto-population via "Apply Client Requests".
- [ ] Verify RFC 1123 DNS slug validation and canonical URL generation.
- [ ] Ensure strict adherence to user rules: no unneeded build commands or superfluous generator scripts.

---

## 9. Conclusion
The proposed architecture provides a clean, modern, and type-safe solution for the Admin Modular Website Creation Editor (R2). By combining a discriminated union data schema, dedicated section inspectors, a responsive live preview canvas, and seamless integration with ASAR's Subdomain Storefront Engine, the platform matches the flexibility of industry leaders like Chungdoi, WithJoy, and Zola while preserving the luxurious vintage aesthetic of ASAR.
