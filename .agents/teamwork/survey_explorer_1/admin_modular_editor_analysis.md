# Architectural Analysis & Technical Specification: Admin Modular Website Creation Editor (R2)

**Author:** `survey_explorer_1` (Teamwork Explorer)  
**Date:** 2026-11-04  
**Target Milestone:** R2 — Admin Modular Website Creation Editor  
**Audience:** Orchestrator, Frontend Implementation Engineers (Admin, Invitation, Booth, Shared Packages)  
**Status:** Complete & Authoritative  

---

## 1. Executive Summary & Problem Context

Modern wedding and event hospitality platforms—such as **Chungdoi** (`https://chungdoi.com/wedding-website`), **WithJoy**, and **Zola**—have redefined customer expectations for digital invitations and event memory websites. Rather than static single-purpose web flyers, contemporary couples and event organizers require **living, modular event websites** that can be assembled, reordered, personalized, and branded with distinct interactive experiences.

### Key Competitor Benchmarks (Chungdoi, WithJoy, Zola)
1. **Chungdoi (`chungdoi.com`)**: Focuses on rich, emotional Vietnamese and international wedding storytelling with:
   - **Cover / Hero Showcase**: High-impact editorial portraiture, bilingual headlines, event countdown, and save-the-date pill.
   - **Love Story ("Chuyện tình yêu")**: Chronological milestone cards featuring photos, meeting moments, and relationship highlights.
   - **Multi-Event Schedule ("Sự kiện cưới")**: Clear separation of traditional and contemporary ceremonies (e.g. Morning Family Ceremony, Church / Vow Exchange, Evening Cocktail & Dinner Reception) with respective dress codes, times, and map pins.
   - **Wishing Wall / Guestbook ("Sổ lưu bút" / "Lời chúc")**: Real-time guest blessing stream where guests post warm congratulations, personal memories, and emojis.
   - **Digital Gift Registry / Blessing Box ("Hộp mừng cưới" / "Mừng cưới")**: Direct digital banking QR integration (InstaPay in Egypt / VietQR / Bank Transfer), displaying account numbers, bank names, account holders, and gifting instructions.
   - **Ambient Soundtrack / Music Player ("Nhạc nền")**: Floating vinyl / disc player widget allowing guests to experience curated celebratory background music while browsing.
   - **Photo Gallery ("Album hình cưới")**: Fullscreen responsive photo grid, masonry, and lightbox carousels.
   - **Dynamic RSVP**: Multi-person attendance confirmation, dietary notes, and WhatsApp / email collection.

2. **ASAR Current State vs. Target Requirements**:
   - In `apps/Admin`, ASAR currently provides `InvitationStudio.tsx` and `BoothMemoryStudio.tsx`.
   - `InvitationStudio.tsx` includes an early prototype of `SectionBlocksManager.tsx`, but it is restricted to a rigid, hardcoded list of 6 sections (`hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, `rsvp_form`).
   - Administrators cannot add modern interactive sections such as **Wishing Wall**, **Background Music / Audio Soundtrack**, **Digital Gift Registry / Bank QR**, or **Multi-Event Schedule Items**.
   - Section configuration is currently flattened into a single loosely-typed interface (`InvitationSectionBlock`), missing type-safe per-section schemas, validation, and specialized inspector forms.
   - On the customer-facing side (`apps/Invitation/src/pages/CustomEventPage.tsx`), sections are rendered in a hardcoded vertical sequence rather than honoring the administrator's custom order and visibility settings stored in `sectionsConfigJson`.

This specification provides the comprehensive blueprint for **Requirement R2: Admin Modular Website Creation Editor**, detailing the UI/UX layout, modular section palette, discriminated union TypeScript schema, Appwrite data persistence, and backward-compatible implementation plan.

---

## 2. Audit of Existing Admin Architecture & Codebase

### 2.1. File Structure in `apps/Admin/src/components/`
The Admin application is structured into domain studios:
```
apps/Admin/src/
├── App.tsx                                 # React Router v6 tree (/overview, /plans, /orders, /booth-studio, /invitation-studio)
├── components/
│   ├── layout/
│   │   └── AdminShell.tsx                  # Global navigation shell with header pill tabs and ecosystem links
│   ├── dashboard/
│   │   └── AdminOverview.tsx               # Analytics, pipeline counts, order lists
│   ├── orders/
│   │   ├── OrdersQueueManager.tsx          # 7-stage order status tracker, studio launch triggers
│   │   └── PaymentReceiptInspector.tsx     # InstaPay/Vodafone Cash manual screenshot zoom lightbox
│   ├── plans/
│   │   └── PlanBuilderStudio.tsx           # Dynamic quota definitions (maxVoices, maxPhotos, maxRsvpCapacity)
│   ├── booth-studio/
│   │   ├── BoothMemoryStudio.tsx           # Audio guestbook curation studio
│   │   ├── BulkVoiceUploader.tsx           # Drag & drop 100+ audio file uploader
│   │   ├── VoiceBatchGridEditor.tsx        # Spreadsheet inline grid for tracks
│   │   ├── MediaAndTabsEditor.tsx          # Photos & QR generation
│   │   └── LiveMemoryMobilePreview.tsx     # Split-screen iPhone audio memory preview
│   └── invitation-studio/
│       ├── InvitationStudio.tsx            # Active studio root (3 tabs: Theme, Sections, Form)
│       ├── SectionBlocksManager.tsx        # Prototype section list
│       ├── DynamicFormSchemaBuilder.tsx    # Dynamic RSVP form schema builder with locked email
│       ├── ThemeAndEffectsPanel.tsx        # Color palettes, typography, WebGL shaders
│       └── LiveInvitationPreview.tsx       # Live preview iframe/mockup
```

### 2.2. Critical Observations & Bottlenecks

1. **Section Palette Limitation in `SectionBlocksManager.tsx`**:
   - The current `SectionBlocksManager.tsx` (Lines 59–140) initializes a static array `DEFAULT_SECTION_BLOCKS`.
   - The only action button is `handleAddCustomHighlight()` (Line 208), which adds a duplicate `custom_highlight` block.
   - Administrators cannot browse an extensible catalog of section types to add new interactive modules (e.g., Wishing Wall, Music Soundtrack, Bank QR Registry).

2. **Schema Untypedness & Data Blurring**:
   - In `SectionBlocksManager.tsx` (Lines 24–57), all possible attributes for all block types are placed on a single interface:
     ```ts
     export interface InvitationSectionBlock {
       id: string;
       type: SectionBlockType;
       title: string;
       isVisible: boolean;
       isLocked?: boolean;
       overline?: string;
       mainTitle?: string;
       subtitle?: string;
       coverImageUrl?: string;
       timelineItems?: TimelineItem[];
       galleryImages?: string[];
       venueName?: string;
       // ... mixed optional properties for all section types
     }
     ```
   - This causes attribute collision and makes it impossible to validate specific section constraints (e.g. verifying bank accounts have an account holder and IBAN, or ensuring audio soundtrack has a valid audio stream URL).

3. **Storage & Serialization Flow**:
   - In `InvitationStudio.tsx` (Lines 300–358), the document is persisted as:
     ```ts
     const invitationPayload: AsarInvitationDocument = {
       id: `INV-${selectedOrderId}`,
       orderId: selectedOrderId,
       clientId: "client-demo-user",
       slug,
       eventTitle,
       occasionType,
       eventDate,
       eventTime,
       venueName,
       venueAddress,
       venueMapUrl,
       maxCapacity,
       themeConfigJson: JSON.stringify(themeConfig),
       sectionsConfigJson: JSON.stringify(blocks), // Stores blocks
       formSchemaJson: JSON.stringify(formFields),
       qrCodeUrl: invitationUrls.canonicalUrl,
       isPublished: true,
     };
     ```
   - Persistence occurs first to `localStorage` (`asar_invitations_cache`, `asar_active_invitation`), and conditionally to Appwrite collection `invitations` (`ASAR_COLLECTIONS.INVITATIONS`) in `asar-db`.
   - The data persistence pathway is completely sound and verified, but requires an upgraded, type-safe schema stored in `sectionsConfigJson`.

---

## 3. R2 Architectural Blueprint: Admin Modular Website Creation Editor

The Admin Modular Website Creation Editor will replace the prototype section list with an enterprise-grade visual studio modeled after leading website builders (Shopify Theme Editor, WithJoy, Webflow).

```
+-------------------------------------------------------------------------------------------------------------------------+
|  ASAR MODULAR WEBSITE EDITOR  •  Order: ORD-8819 (Omar & Layla)  •  Occasion: Royal Wedding  •  Status: Published ✓    |
|  [ ← Back to Orders ]   [ Slug: omar-and-layla (Valid RFC 1123 ✓) ]   [ 🌐 omar-and-layla.asar.me ↗ ]   [ Save & Publish ]|
+-----------------------------------------------------------------------------+-------------------------------------------+
|  LEFT COLUMN: CONTROL DECK (58% Width)                                      |  RIGHT COLUMN: LIVE PREVIEW (42% Width)   |
|                                                                             |                                           |
|  STUDIO TABS: [ 🧱 Modular Sections (8) ]  [ 🎨 Theme & FX ]  [ 📝 RSVP Form ]|  DEVICE: [ 📱 Mobile ] [ 💻 Desktop ]    |
|  -------------------------------------------------------------------------  |  +-------------------------------------+  |
|  [ + Add New Section (Palette) ]   [ 👁️ Expand All ]   [ ⟳ Reset Defaults ]  |  | 🏛️ OMAR & LAYLA                    |  |
|                                                                             |  |-------------------------------------|  |
|  SECTION REORDER STACK:                                                     |  | 🎵 Background Music: Playing "A Thousand|
|  +-----------------------------------------------------------------------+  |  |    Years" (Floating Vinyl Disc 💽)  |  |
|  | ⠿ [👁️] 1. COVER / HERO SHOWCASE                       [⚙ Edit] [🗑️]  |  |-------------------------------------|  |
|  |    Headline: "Omar & Layla" • Style: Vintage Alabaster • Shader: Waves|  |  |           THE WEDDING OF            |  |
|  +-----------------------------------------------------------------------+  |  |            Omar & Layla             |  |
|  | ⠿ [👁️] 2. BACKGROUND SOUNDTRACK                        [⚙ Edit] [🗑️]  |  |          20 November 2026           |  |
|  |    Song: "Clair de Lune" • Autoplay: On • Floating Widget: Bottom Right|  |  |-------------------------------------|  |
|  +-----------------------------------------------------------------------+  |  | ⏳ COUNTDOWN: 14d : 08h : 22m : 15s |  |
|  | ⠿ [👁️] 3. EVENT TIMELINE & SCHEDULE                    [⚙ Edit] [🗑️]  |  |-------------------------------------|  |
|  |    3 Events (Reception, Vows, Royal Dinner) • Multi-Venue & Maps      |  |  | 📅 EVENT SCHEDULE                   |  |
|  +-----------------------------------------------------------------------+  |  |  • 07:00 PM: Welcome Elixirs        |  |
|  | ⠿ [👁️] 4. PHOTO & MEMORY GALLERY                     [⚙ Edit] [🗑️]  |  |  • 08:30 PM: Vows Under the Stars   |  |
|  |    12 Photos • Mode: Circular 3D Carousel / Bento Grid                 |  |-------------------------------------|  |
|  +-----------------------------------------------------------------------+  |  | 💌 WISHING WALL (Live Blessings)    |  |
|  | ⠿ [👁️] 5. WISHING WALL & GUESTBOOK                    [⚙ Edit] [🗑️]  |  |  "Alf Mabrook! - Uncle Tarek" ❤️    |  |
|  |    Allow Audio Wishes: Yes • Moderation: Auto-Approved • Pin Top: 2    |  |  [ + Leave a Blessing Message ]     |  |
|  +-----------------------------------------------------------------------+  |  |-------------------------------------|  |
|  | ⠿ [👁️] 6. DIGITAL GIFT REGISTRY & BANK QR             [⚙ Edit] [🗑️]  |  | 🎁 BLESSING BOX & GIFT REGISTRY     |  |
|  |    InstaPay: omar@instapay • Bank: CIB Egypt • QR Code Attached       |  |  [ InstaPay QR ] [ Bank CIB: 1000..]|  |
|  +-----------------------------------------------------------------------+  |  |-------------------------------------|  |
|  | ⠿ [🔒] 7. DYNAMIC RSVP FORM BLOCK                      [⚙ Edit] [🔒]  |  | ✉️ CONFIRM ATTENDANCE (RSVP)       |  |
|  |    Fields: Name, Email (Locked), Phone, Companions, Meal Choice       |  |  [ Name Input... ]                  |  |
|  +-----------------------------------------------------------------------+  |  |  [ Email Input (Required 🔒)... ]   |  |
|                                                                             |  |  [ Confirm Attendance Button -> ]   |  |
|  ACTIVE SECTION CONFIG INSPECTOR (Drill-down for Section #5: Wishing Wall): |  +-------------------------------------+  |
|  +-----------------------------------------------------------------------+  |  (Real-time split-screen sync)            |
|  | Section Title: [ Guestbook & Wishing Wall                             ]  |                                           |
|  | Subtitle:      [ Leave your heartfelt blessings for the couple        ]  |                                           |
|  | Accent Icon:   [ 💌 Heart / Letter ▾ ]                                |                                           |
|  | Options:       [☑ Allow Text Messages]   [☑ Allow Voice Recordings]   |                                           |
|  |                [☑ Enable Heart Likes]    [☐ Require Host Moderation]  |                                           |
|  | Empty State Text: [ "Be the first to leave a lasting blessing..."     ]  |                                           |
|  +-----------------------------------------------------------------------+  |                                           |
+-----------------------------------------------------------------------------+-------------------------------------------+
```

---

## 4. UI/UX Component Layout Breakdown

The Editor interface comprises four tightly coordinated subsystems:

### 4.1. Section Palette / Catalog Modal (`SectionPaletteModal.tsx`)
Administrators can click **"+ Add New Section"** at any time to open a luxury catalog modal organized into 4 semantic categories:

| Category | Available Section Types | Icons & Visual Badges | Purpose & Capabilities |
| :--- | :--- | :--- | :--- |
| **Essentials** | `cover_hero`<br>`countdown_timer`<br>`venue_location`<br>`dress_code` | 🏛️ Hero<br>⏳ Timer<br>📍 Map<br>👔 Dress Code | Foundation blocks: titles, dates, countdown timers, venue directions, and guest attire color swatches. |
| **Story & Media** | `story_timeline`<br>`photo_gallery`<br>`video_reel` | 📖 Story<br>🖼️ Gallery<br>🎥 Reel | Chronological relationship milestones, photo albums (3D Circular, Masonry Bento, Polaroid Decay), video reels. |
| **Interactive Engagement** | `wishing_wall`<br>`background_audio`<br>`digital_guestbook` | 💌 Wishing Wall<br>🎵 Soundtrack<br>🎙️ Voice Wishes | High-engagement guest interactions: live blessings, floating music disc player, audio guestbook playback. |
| **Gifting & Logistics** | `gift_registry`<br>`event_schedule`<br>`rsvp_form` | 🎁 Gift QR<br>📅 Multi-Schedule<br>✉️ Dynamic RSVP | Digital gift box with bank QR codes, multi-session event timeline (reception, vows, dinner), dynamic RSVP forms. |

When a section is selected from the palette:
1. It is instantiated with rich default content matching the event's occasion preset.
2. It is appended to the section array before the locked RSVP form.
3. The newly added section is automatically highlighted and opened in the Config Inspector.

### 4.2. Section Reorder Deck (`SectionReorderDeck.tsx`)
A tactile list enabling rapid reorganization:
- **Drag Handle (`⠿`)**: Seamless reordering via drag-and-drop.
- **Up / Down Steppers (`↑` / `↓`)**: Keyboard and click accessible move controls.
- **Visibility Toggle (`👁️` / `🚫`)**: Instantly shows or hides the section on the live website without deleting its configured data.
- **Duplicate Button (`⎘`)**: Clones the section configuration (e.g. creating multiple schedule days or distinct story chapters).
- **Delete Button (`🗑️`)**: Safely removes the section (with confirmation guard for sections with entered content).
- **Locked System Blocks**: The `rsvp_form` and `cover_hero` can have locked constraints so essential conversion and header elements remain intact.

### 4.3. Section Config Inspector (`SectionConfigInspector.tsx`)
A polymorphic inspector panel that dynamically mounts a dedicated configuration form based on `section.type`:
- **Cover / Hero Form**: Headline, couple names, date pill, venue pill, high-res portrait image upload, layout alignment (centered, split-portrait, minimal), WebGL shader toggle (`GradientWaves`, `DitherVeil`, `None`).
- **Event Schedule Form**: Multi-item schedule builder with time, event name, description, venue room/location, dress code badge, and "Add to Calendar" link toggle.
- **Story Timeline Form**: Milestone entries with date/year, photo, chapter title, and personal story text.
- **Photo Gallery Form**: Image URL list, layout mode selector (`3d-circular`, `bento-masonry`, `polaroid-decay`, `film-strip`), lightbox captions toggle.
- **Wishing Wall Form**: Header, prompt, allow audio recordings toggle, allow guest photo attachments toggle, enable likes counter, pre-moderation toggle, and empty state placeholder.
- **Digital Gift Registry Form**: Intro note ("Your presence is our greatest gift, but if you wish to honor us..."), multiple banking / e-wallet accounts (Bank Name, Account Holder, Account Number / IBAN, Swift code, InstaPay handle / address), and QR code image uploader.
- **Background Audio Form**: Soundtrack audio URL (`.mp3` stream or Appwrite storage file ID), song title, artist name, autoplay preference (with browser policy compliance fallback), loop toggle, volume slider, and floating player style (rotating vinyl record, minimal pill, or discreet bottom bar).
- **Venue & Dress Code Form**: Venue name, address, Google Maps link, parking note, valet service badge, and dress code swatches (hex color picker + label).

### 4.4. Live Split-Screen Interactive Preview (`LiveEditorCanvas.tsx`)
- **Device Viewport Switcher**:
  - **Mobile Phone (375px / 390px)**: The primary view used by 92% of wedding guests.
  - **Tablet (768px)**: Portrait tablet representation.
  - **Desktop (Fluid 100%)**: Full-width viewport.
- **Bidirectional Interaction Synchronization**:
  - Clicking a section inside the preview automatically selects and scrolls to that section's configuration inspector on the left.
  - Changes made in the inspector reflect instantly in the preview canvas with zero full-page reload lag.
  - Audio player preview allows testing soundtrack playback directly inside the studio.

---

## 5. Comprehensive TypeScript Data Schema

To guarantee strict type safety, modular composability, and frictionless integration across `apps/Admin`, `apps/Invitation`, `apps/Booth`, and `packages/react-appwrite`, we define the following discriminated union architecture:

### 5.1. Core Section Types and Enumerations
```ts
// packages/react-appwrite/src/AsarDomain/modularWebsite.ts (or packages/types)

export type SectionType =
  | "cover_hero"
  | "countdown_timer"
  | "story_timeline"
  | "event_schedule"
  | "photo_gallery"
  | "wishing_wall"
  | "gift_registry"
  | "background_audio"
  | "venue_location"
  | "dress_code"
  | "rsvp_form"
  | "custom_highlight";

export interface SectionBase {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  isLocked?: boolean;
  badge?: string;
}
```

### 5.2. Specialized Per-Section Configuration Schemas
```ts
// 1. Cover / Hero Section
export interface CoverHeroSectionConfig {
  overline?: string;              // e.g. "CORDIALLY INVITE YOU TO CELEBRATE"
  coupleTitle: string;            // e.g. "Omar & Layla"
  subtitle?: string;              // e.g. "Two souls, one timeless journey."
  coverImageUrl: string;
  datePill: string;               // e.g. "20 November 2026"
  timePill?: string;              // e.g. "07:30 PM"
  venuePill: string;              // e.g. "Four Seasons Hotel, Alexandria"
  ctaText?: string;               // e.g. "Confirm Attendance"
  layoutStyle: "centered-editorial" | "split-portrait" | "minimalist-luxury";
  webGlShaderEffect?: "waves" | "veil" | "none";
}

// 2. Countdown Timer Section
export interface CountdownSectionConfig {
  targetIsoDate: string;          // e.g. "2026-11-20T19:30:00"
  heading: string;                // e.g. "Counting Down to Forever"
  subheading?: string;
  displayUnits: {
    days: boolean;
    hours: boolean;
    minutes: boolean;
    seconds: boolean;
  };
}

// 3. Story & Milestones Section
export interface StoryMilestoneItem {
  id: string;
  dateOrYear: string;             // e.g. "Summer 2022"
  title: string;                  // e.g. "The First Spark"
  description: string;
  imageUrl?: string;
}

export interface StoryTimelineSectionConfig {
  headline: string;
  subheadline?: string;
  milestones: StoryMilestoneItem[];
  layout: "vertical-timeline" | "carousel-cards" | "alternating-editorial";
}

// 4. Multi-Event Schedule Section
export interface EventScheduleItem {
  id: string;
  timeDisplay: string;            // e.g. "07:00 PM"
  title: string;                  // e.g. "Sunset Ceremony & Vows"
  description: string;
  locationName?: string;          // e.g. "Seaside Courtyard"
  badge?: string;                 // e.g. "Ceremony"
  dressCodeNote?: string;         // e.g. "Formal Black Tie"
  mapUrl?: string;
}

export interface EventScheduleSectionConfig {
  headline: string;
  subheadline?: string;
  events: EventScheduleItem[];
  showAddToCalendarButton: boolean;
}

// 5. Photo Gallery Section
export interface GalleryPhotoItem {
  id: string;
  imageUrl: string;
  caption?: string;
  aspectRatio?: "portrait" | "landscape" | "square";
}

export interface PhotoGallerySectionConfig {
  headline: string;
  subheadline?: string;
  photos: GalleryPhotoItem[];
  displayMode: "circular-3d" | "bento-masonry" | "polaroid-decay" | "standard-grid";
  enableLightbox: boolean;
}

// 6. Wishing Wall & Guestbook Section
export interface WishingWallSectionConfig {
  headline: string;
  subheadline?: string;
  promptPlaceholder: string;      // e.g. "Write your warm congratulations and blessings..."
  allowGuestName: boolean;
  allowGuestRelationship: boolean;// e.g. "Friend of Groom", "Cousin"
  allowAudioRecordings: boolean;  // Voice notes directly in wishing wall!
  enableHeartReactions: boolean;
  requireHostApproval: boolean;   // Moderation toggle
  emptyStateMessage: string;
}

// 7. Digital Gift Registry / Bank QR Section
export interface BankQrAccount {
  id: string;
  providerType: "instapay" | "bank_transfer" | "vodafone_cash" | "custom_qr";
  title: string;                  // e.g. "InstaPay (Egypt)" or "CIB Bank Transfer"
  accountHolderName: string;      // e.g. "Omar Tarek Al-Sayed"
  accountNumberOrIban: string;    // e.g. "EG12000000000000000000" or "omar@instapay"
  bankOrBranchName?: string;      // e.g. "Commercial International Bank (CIB)"
  qrCodeImageUrl?: string;        // Scannable banking QR
  instructions?: string;          // e.g. "Please add your name in payment reference"
}

export interface GiftRegistrySectionConfig {
  headline: string;
  subheadline?: string;
  introductoryNote: string;       // e.g. "Your love and presence is the greatest gift..."
  accounts: BankQrAccount[];
  enableBlessingBox: boolean;
}

// 8. Background Audio Soundtrack Section
export interface BackgroundAudioSectionConfig {
  audioStreamUrl: string;         // Cloud URL or MP3 file ID
  songTitle: string;              // e.g. "Can't Help Falling in Love"
  artistName: string;             // e.g. "Kina Grannis"
  autoplay: boolean;              // Browser compliant (with mute/interact trigger)
  loop: boolean;
  initialVolume: number;          // 0.0 to 1.0
  floatingWidgetPosition: "bottom-right" | "bottom-left" | "top-right" | "hidden";
  floatingWidgetStyle: "rotating-vinyl" | "minimal-pill" | "subtle-badge";
}

// 9. Venue Location & Map Section
export interface VenueLocationSectionConfig {
  venueName: string;
  venueAddress: string;
  mapEmbedUrl?: string;
  googleMapsUrl: string;
  parkingAndValetNotes?: string;
  directionsSummary?: string;
}

// 10. Dress Code & Etiquette Section
export interface DressCodeColorSwatch {
  hex: string;
  label: string;
}

export interface DressCodeSectionConfig {
  title: string;                  // e.g. "Black Tie & Champagne Elegance"
  description: string;            // e.g. "We invite you to celebrate in formal evening attire..."
  paletteSwatches: DressCodeColorSwatch[];
  attireGuidelines?: string[];    // e.g. ["Full length evening gowns", "Black or midnight tuxedos"]
}

// 11. RSVP Form Section
export interface RsvpSectionConfig {
  headline: string;
  subheadline?: string;
  maxCompanionsAllowed: number;
  deadlineDateIso?: string;
  confirmationMessage: string;
  // Dynamic fields are linked via DynamicFormField[] in document
}

// 12. Custom Rich Editorial Highlight
export interface CustomHighlightSectionConfig {
  badge?: string;                 // e.g. "✦ A SPECIAL NOTE"
  headline: string;
  bodyText: string;
  imageUrl?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
}
```

### 5.3. Discriminated Union: `EventSection`
```ts
export type EventSection =
  | ({ type: "cover_hero"; config: CoverHeroSectionConfig } & SectionBase)
  | ({ type: "countdown_timer"; config: CountdownSectionConfig } & SectionBase)
  | ({ type: "story_timeline"; config: StoryTimelineSectionConfig } & SectionBase)
  | ({ type: "event_schedule"; config: EventScheduleSectionConfig } & SectionBase)
  | ({ type: "photo_gallery"; config: PhotoGallerySectionConfig } & SectionBase)
  | ({ type: "wishing_wall"; config: WishingWallSectionConfig } & SectionBase)
  | ({ type: "gift_registry"; config: GiftRegistrySectionConfig } & SectionBase)
  | ({ type: "background_audio"; config: BackgroundAudioSectionConfig } & SectionBase)
  | ({ type: "venue_location"; config: VenueLocationSectionConfig } & SectionBase)
  | ({ type: "dress_code"; config: DressCodeSectionConfig } & SectionBase)
  | ({ type: "rsvp_form"; config: RsvpSectionConfig } & SectionBase)
  | ({ type: "custom_highlight"; config: CustomHighlightSectionConfig } & SectionBase);
```

### 5.4. Root Modular Website Document Container
```ts
export interface ModularWebsiteConfig {
  version: "2.0";
  sections: EventSection[];
  theme: {
    presetId: "royal-wedding" | "midnight-gala" | "cultural-festival" | "custom";
    primaryColor: string;
    secondaryColor: string;
    accentGoldColor: string;
    backgroundColor: string;
    surfaceColor: string;
    fontFamilyDisplay: "Amiri" | "Playfair Display" | "Cinzel" | string;
    fontFamilyBody: "Cairo" | "Inter" | "Outfit" | string;
    direction: "rtl" | "ltr" | "auto";
  };
}
```

---

## 6. Data Persistence & Migration Strategy

### 6.1. Storage Model in Appwrite
The modular configuration is stored directly in the `invitations` collection (`ASAR_COLLECTIONS.INVITATIONS`):
1. **`sectionsConfigJson` Attribute**: Stores the JSON-stringified `EventSection[]` array (or `ModularWebsiteConfig`).
2. **Top-Level Synchronized Attributes**: For performant Appwrite database querying, searching, and indexing, the following root attributes remain synchronized with the modular sections:
   - `eventTitle`: Matches `cover_hero.config.coupleTitle`
   - `eventDate`: Matches `cover_hero.config.datePill`
   - `venueName`: Matches `venue_location.config.venueName`
   - `slug`: Subdomain slug
   - `isPublished`: Publication flag
   - `themeConfigJson`: Serialized theme config
   - `formSchemaJson`: Serialized dynamic RSVP fields

### 6.2. Backward Compatibility & Zero-Crash Parser Helper
Existing documents created under the v1 format (`InvitationSectionBlock[]` with flat keys like `datePill`, `timelineItems`, `mapUrl`) must load without runtime errors. We define a safe normalizer:

```ts
// packages/react-appwrite/src/AsarDomain/modularWebsite.ts

export function parseModularSections(
  rawJson: string | null | undefined,
  fallbackDefaults: EventSection[]
): EventSection[] {
  if (!rawJson || typeof rawJson !== "string" || !rawJson.trim()) {
    return fallbackDefaults;
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackDefaults;
    }

    // Check if it's already v2 format (has .config object)
    if (parsed[0] && typeof parsed[0] === "object" && "config" in parsed[0]) {
      return parsed as EventSection[];
    }

    // Otherwise migrate v1 legacy blocks to v2 EventSection[]
    return migrateLegacyBlocksToV2(parsed);
  } catch (err) {
    console.warn("Could not parse modular sections JSON, using defaults", err);
    return fallbackDefaults;
  }
}

export function migrateLegacyBlocksToV2(legacyBlocks: any[]): EventSection[] {
  return legacyBlocks.map((b, index) => {
    const base: SectionBase = {
      id: b.id || `section-${b.type || "block"}-${index}`,
      type: mapLegacyType(b.type),
      title: b.title || "Section",
      subtitle: b.subtitle,
      enabled: b.isVisible ?? true,
      order: index + 1,
      isLocked: b.isLocked ?? false,
    };

    switch (b.type) {
      case "hero":
        return {
          ...base,
          type: "cover_hero",
          config: {
            overline: b.overline,
            coupleTitle: b.mainTitle || "Event Celebration",
            subtitle: b.subtitle,
            coverImageUrl: b.coverImageUrl || "",
            datePill: b.datePill || "",
            timePill: b.timePill,
            venuePill: b.venuePill || "",
            ctaText: b.ctaText,
            layoutStyle: "centered-editorial",
          },
        };
      case "countdown":
        return {
          ...base,
          type: "countdown_timer",
          config: {
            targetIsoDate: b.targetDate || new Date().toISOString(),
            heading: b.countdownHeading || "Counting Down",
            displayUnits: { days: true, hours: true, minutes: true, seconds: true },
          },
        };
      case "story_timeline":
        return {
          ...base,
          type: "event_schedule",
          config: {
            headline: b.title || "Schedule of Events",
            events: (b.timelineItems || []).map((t: any) => ({
              id: t.id,
              timeDisplay: t.time,
              title: t.title,
              description: t.description,
            })),
            showAddToCalendarButton: true,
          },
        };
      case "gallery":
        return {
          ...base,
          type: "photo_gallery",
          config: {
            headline: b.title || "Moments & Memories",
            photos: (b.galleryImages || []).map((img: string, i: number) => ({
              id: `photo-${i}`,
              imageUrl: img,
            })),
            displayMode: b.galleryMode || "circular-3d",
            enableLightbox: true,
          },
        };
      case "venue_map":
        return {
          ...base,
          type: "venue_location",
          config: {
            venueName: b.venueName || "Venue",
            venueAddress: b.venueAddress || "",
            googleMapsUrl: b.mapUrl || "",
            parkingAndValetNotes: b.parkingNote,
          },
        };
      case "rsvp_form":
        return {
          ...base,
          type: "rsvp_form",
          config: {
            headline: "Confirm Attendance",
            maxCompanionsAllowed: 3,
            confirmationMessage: "Thank you for your response.",
          },
        };
      default:
        return {
          ...base,
          type: "custom_highlight",
          config: {
            badge: b.highlightBadge,
            headline: b.mainTitle || b.title,
            bodyText: b.highlightText || "",
            imageUrl: b.highlightImageUrl,
          },
        };
    }
  });
}

function mapLegacyType(legacyType: string): SectionType {
  switch (legacyType) {
    case "hero": return "cover_hero";
    case "countdown": return "countdown_timer";
    case "story_timeline": return "event_schedule";
    case "gallery": return "photo_gallery";
    case "venue_map": return "venue_location";
    case "rsvp_form": return "rsvp_form";
    default: return "custom_highlight";
  }
}
```

### 6.3. Local State Management & Auto-Draft Persistence
Inside the Admin Modular Editor component:
- **`draftKey`**: `asar_modular_draft_${orderId || slug}` in `localStorage`
- **Dirty State Tracking**: If the administrator modifies sections without saving, a gentle notification appears ("Unsaved draft changes").
- **Revert to Published**: Single-click button restoring sections from the last published version.
- **Save Draft vs. Publish Live**:
  - **Save Draft**: Persists locally and updates Appwrite document with `isPublished: false`.
  - **Publish Live**: Validates RFC 1123 subdomain slug, validates mandatory RSVP form fields, updates `isPublished: true`, and surfaces the canonical public URL.

---

## 7. Recommended Component Decomposition for Implementation

To implement R2 cleanly without introducing regressions in other parts of `apps/Admin`, we propose organizing the modular editor inside `apps/Admin/src/components/modular-editor/`:

```
apps/Admin/src/components/modular-editor/
├── ModularWebsiteEditor.tsx          # Main Studio Workspace (Split-screen Orchestrator)
├── components/
│   ├── EditorHeaderBar.tsx           # Order badge, slug editor, RFC 1123 pill, Save/Publish
│   ├── SectionPaletteModal.tsx       # Categorized section library with previews & add triggers
│   ├── SectionReorderList.tsx        # Drag/drop, reorder steppers, eye toggle, duplicate, delete
│   ├── SectionItemCard.tsx           # Individual section card in the reorder deck
│   ├── LivePreviewFrame.tsx          # Split-screen responsive device preview (iPhone/Desktop)
│   └── inspectors/
│       ├── SectionInspectorRouter.tsx# Switches between specific inspectors based on section.type
│       ├── CoverHeroInspector.tsx
│       ├── CountdownInspector.tsx
│       ├── StoryTimelineInspector.tsx
│       ├── EventScheduleInspector.tsx
│       ├── PhotoGalleryInspector.tsx
│       ├── WishingWallInspector.tsx
│       ├── GiftRegistryInspector.tsx
│       ├── BackgroundAudioInspector.tsx
│       ├── VenueLocationInspector.tsx
│       ├── DressCodeInspector.tsx
│       └── CustomHighlightInspector.tsx
├── defaultSections.ts                # Rich, occasion-specific initial section seed sets
├── types.ts                          # Re-exported from @repo/react-appwrite
└── index.ts
```

### Integration with `apps/Admin/src/App.tsx`
In `apps/Admin/src/App.tsx`:
- The route `/invitation-studio/:orderId?` can directly mount `ModularWebsiteEditor` (or retain backward compatibility by nesting it within `InvitationStudio.tsx` under the "Sections" tab).
- In `AdminShell.tsx`, the tab label can be updated from `"Invitation Builder"` to `"Modular Website Studio"` or `"Website & Invitation Studio"`.

---

## 8. Cross-App Consistency (Invitation & Booth Alignments)

1. **`apps/Invitation` (Downstream R3 Consumer)**:
   - `apps/Invitation/src/pages/CustomEventPage.tsx` will be updated to map through `event.sectionsConfigJson`:
     ```tsx
     {sections.map((section) => {
       if (!section.enabled) return null;
       switch (section.type) {
         case "cover_hero":
           return <ModularHeroSection key={section.id} config={section.config} />;
         case "background_audio":
           return <FloatingAudioPlayer key={section.id} config={section.config} />;
         case "event_schedule":
           return <ModularScheduleSection key={section.id} config={section.config} />;
         case "wishing_wall":
           return <ModularWishingWall key={section.id} config={section.config} eventId={invitation.id} />;
         case "gift_registry":
           return <ModularGiftRegistry key={section.id} config={section.config} />;
         case "photo_gallery":
           return <ModularGallery key={section.id} config={section.config} />;
         case "rsvp_form":
           return <DynamicRsvpForm key={section.id} config={section.config} schema={formSchema} />;
         // ...
       }
     })}
     ```
   - This dynamically honors the exact order, titles, and visibility toggled by the admin in R2.

2. **`apps/Booth` (Photo Memories Alignment)**:
   - Booth memories already utilize a 5-tab structure (`Audio Messages`, `Photos`, `Video Highlights`, `Guest Book`, `Thank You`).
   - The photo gallery and written guestbook blessing components can share the underlying schema definitions (`GalleryPhotoItem`, `WishingMessage`), creating cross-app synergy.

---

## 9. Verification & Quality Checklist

Before completing R2 implementation, the following automated checks and UX criteria must be satisfied:

1. **Automated Schema & TypeScript Check**:
   - `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json` exits with code 0.
   - `npx tsc --noEmit -p apps/Admin/tsconfig.json` exits with code 0.
   - `npm run test` or `node --test` confirms `parseModularSections` passes unit tests for:
     - Empty/null input returns default sections.
     - Legacy v1 format correctly migrates into valid v2 `EventSection[]`.
     - Reordering updates `order` indices correctly.
     - Missing mandatory fields in section config triggers validation errors.

2. **Studio UX Verification**:
   - Section additions from palette insert immediately into the stack.
   - Moving a section Up or Down immediately reorders the live split-screen preview.
   - Toggling the eye visibility icon immediately shows or hides that section on the preview canvas.
   - Modifying fields in the Inspector (e.g. Bank IBAN, Audio track title, Wishing Wall prompt) reflects immediately in the preview.
   - Subdomain slug validation strictly enforces RFC 1123 constraints.
   - LocalStorage draft persists across browser reloads.
