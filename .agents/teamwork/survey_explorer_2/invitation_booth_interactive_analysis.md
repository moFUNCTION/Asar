# ASAR Modern Interactive Invitation and Booth Features Analysis & Implementation Plan
**Document Version:** 1.0  
**Author:** `survey_explorer_2` (Teamwork Explorer)  
**Date:** 2026-11-04  
**Scope:** `apps/Invitation`, `apps/Booth`, `apps/Renderer`, `apps/Admin`, and `@repo/react-appwrite`  
**Reference Request:** `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (Requirements R1, R2, R3, R4)  

---

## Executive Summary

This document provides a comprehensive architectural exploration and concrete implementation roadmap for **Requirement R3 ("Modern Interactive Invitation and Booth Features")** of the ASAR platform. 

Based on deep comparative analysis of modern benchmark platforms—notably **ChungDoi** (`https://chungdoi.com/wedding-website`), **WithJoy**, and **Zola**—today's digital event websites are no longer static digital flyers. They are **modular, interactive, multi-sensory storefront experiences** that unify:
1. Cover / Hero showcase with calendar integration.
2. Dynamic multi-event schedule timelines with interactive maps.
3. Smart schema-driven RSVP with instant VIP pass generation.
4. Live interactive wishing wall / guestbook with real-time feedback and animations.
5. Persistent background soundtrack playback.
6. Digital gift registry & bank QR blessing box (VietQR / InstaPay / IBAN copy-to-clipboard).
7. Responsive photo memories gallery with category filtering and modal lightbox.
8. Shared data alignment between pre-event invitation galleries and post-event Booth audio/photo heirlooms.

Currently in ASAR, `apps/Invitation/src/pages/CustomEventPage.tsx` renders a hardcoded sequence of sections and does not dynamically iterate over the admin-configured `sectionsConfigJson`. Furthermore, critical interactive sections (Wishing Wall, Digital Gift QR Box, Background Audio Player) are either absent or confined to `apps/Booth`. This document details the exact target architecture, component contracts, props interfaces, state models, and integration pathways to fulfill R3 across `apps/Invitation` and `apps/Booth`.

---

## 1. Competitive Analysis & Feature Benchmark

### 1.1. Benchmark Platforms Breakdown

| Feature Dimension | **ChungDoi** (`chungdoi.com`) | **WithJoy** (`withjoy.com`) | **Zola** (`zola.com`) | **ASAR Current State** | **ASAR Target State (R3)** |
|---|---|---|---|---|---|
| **Site Architecture** | Single-link modular mobile-first website | Multi-page / single-page configurable site | Multi-page customizable builder | Hardcoded section stack in `CustomEventPage` | Dynamic modular section dispatcher driven by Admin schema |
| **Schedule / Timeline** | Multi-venue schedule with embedded Google Maps & directions | Multi-event schedule (rehearsal, ceremony, reception, brunch) + calendar sync | Schedule timeline with dress code & maps | Basic linear schedule (`EventScheduleSection`) | Multi-event schedule cards + .ics / Google Calendar export + map links |
| **RSVP Experience** | Inline/modal RSVP, party size, attendance status, instant dashboard sync | Smart RSVP questionnaire, dietary choices, plus-one controls | Form questions, meal selections, tracking | Dynamic schema form with locked email (`DynamicRsvpForm`) | Dynamic schema RSVP + dietary choices + companions count + instant VIP QR pass modal |
| **Guestbook / Wishing Wall** | Written prayers & blessings list, instant guest submission | Digital guestbook notes & advice | Guestbook note messages | Available in `apps/Booth` only (`GuestBookFeed`) | Interactive Wishing Wall in `apps/Invitation` with likes, animated confetti, and Booth sync |
| **Background Music** | Persistent background soundtrack player with track info & toggle | Song request questionnaire in RSVP; embedded playlist links | External Spotify embed | Voice card player in Booth (`AudioPlayerBar`); no persistent music in Invitation | Floating persistent audio player bar with auto-loop, track metadata, play/pause, volume/mute |
| **Gift Registry & QR** | "Hộp mừng cưới" (Gift Box) with bank QR (VietQR), account details, copy button | Multi-store retail registry + zero-fee cash fund | Retail registry + cash fund + honeymoon fund | None | Digital Gift Registry / Bank QR Blessing Box with VietQR / InstaPay / IBAN copy-to-clipboard |
| **Photo Gallery** | Photo album grid with lightbox modal | High-res photo album with story captions | Photo gallery with category sorting | Basic grid in Invitation; categorized masonry in Booth | Responsive masonry grid + category filter pills + modal lightbox + Booth photo sync |
| **Subdomain / Multi-tenancy** | Path-based or custom domain | Custom subdomain (`withjoy.com/couple`) | Custom slug or domain | 4-tier subdomain engine (`@repo/react-appwrite`) | 4-tier subdomain engine (*.localhost, *.asar.me, ?subdomain=) unified |

---

## 2. Current ASAR Architecture & Gap Analysis

### 2.1. Routing & Subdomain Resolution Pipeline

Both `apps/Invitation` and `apps/Booth` leverage the shared `@repo/react-appwrite` package for 4-tier subdomain resolution:
```
Tier 1: Query param (?subdomain=, ?memory=, ?event=)
   ↓
Tier 2: Route param (/e/:slug, /memory/:slug, /s/:slug)
   ↓
Tier 3: Hostname subdomain (*.localhost, *.asar.me)
   ↓
Tier 4: Fallback slug ("omar-and-layla" or "mina-and-maryam")
```

- **`apps/Invitation/src/App.tsx`**:
  - `/` -> `DynamicInvitationStorefrontIndex` (subdomain resolves to `CustomEventPage`, else `InvitationLandingPage`).
  - `/e/:slug` -> `CustomEventPage`.
  - `/pass/:rsvpId` -> `QrPassPage` (`GuestPassPage`).
  - `/scanner` & `/scanner/:invitationId` -> `VenueQrScanner`.
  - `/book` -> `InvitationBookingRouteView`.

- **`apps/Booth/src/App.tsx`**:
  - `/` -> `DynamicBoothStorefrontIndex` (subdomain resolves to `BoothMemoryPage`, else `BoothLandingView`).
  - `/memory/:slug` & `/m/:slug` -> `BoothMemoryPage`.
  - `/book` -> `BoothLandingView autoOpenBooking={true}`.

- **`apps/Renderer/src/App.tsx`**:
  - Port 3004 dedicated universal storefront dispatcher routing to `BoothMemoryRenderer` or `InvitationMemoryRenderer`.

### 2.2. Critical Current Gaps in `apps/Invitation`

1. **Static Section Rendering:**
   `apps/Invitation/src/pages/CustomEventPage.tsx` currently ignores `invitation.sectionsConfigJson`. Lines 431–469 render a hardcoded sequence of:
   ```tsx
   <main>
     <EventHeroSection ... />
     <EventCountdownSection ... />
     <EventScheduleSection ... />
     <EventMediaGallery ... />
     <EventLocationMap ... />
     <DynamicRsvpForm ... />
   </main>
   ```
   If an administrator reorders blocks, disables the countdown, or adds new sections in `apps/Admin`, `CustomEventPage` does not reflect those changes.

2. **Missing Modern Interactive Sections in Invitation:**
   - **No Background Audio Player:** Invitation has no persistent audio playback for celebration soundtracks.
   - **No Wishing Wall / Guestbook Section:** While `apps/Booth` has `GuestBookFeed.tsx` and `LeaveLoveModal.tsx`, `apps/Invitation` has no guestbook or wishing wall.
   - **No Digital Gift Registry / Bank QR Blessing Box:** Neither app currently has a dedicated bank QR / VietQR / cash blessing component.
   - **Schedule Lacks Calendar Export:** `EventScheduleSection` lacks multi-event .ics / Google Calendar downloads and per-milestone sub-venue mapping.
   - **Gallery Lacks Categories & Masonry:** Invitation's `EventMediaGallery` is a simple 4-photo grid, unlike Booth's category-filtered gallery.

3. **Decoupled Photo Memories between Booth and Invitation:**
   - In `apps/Booth`, photos are typed as `MediaPhoto` and categorized ("Around The Phone", "Couple", "Celebration").
   - In `apps/Invitation`, photos are typed as `GalleryItem`.
   - There is no shared model or data bridge allowing an event website to showcase both pre-event invitation gallery photos and post-event Booth memories.

---

## 3. Target Modular Section Architecture for `apps/Invitation`

### 3.1. Unified Section Block Schema

In `@repo/react-appwrite/src/AsarDomain/models.ts` and `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx`, the section block type and configuration schema is standardized as follows:

```typescript
export type SectionBlockType =
  | "hero"               // Hero / Cover showcase
  | "countdown"          // Real-time live countdown ticker
  | "schedule"           // Multi-event Schedule / Itinerary
  | "rsvp_form"          // Schema-driven interactive RSVP form
  | "wishing_wall"       // Interactive wishing wall / guestbook
  | "background_audio"   // Persistent celebration music player
  | "gift_registry"      // Bank QR / Blessing box / Gift registry
  | "gallery"            // Responsive photo memories gallery
  | "venue_map"          // Venue location, directions, and dress code
  | "custom_highlight";  // Editorial highlight / verse / story

export interface BaseSectionBlockConfig {
  id: string;
  type: SectionBlockType;
  title: string;
  titleAr?: string;
  titleEn?: string;
  isVisible: boolean;
  order: number;
  isLocked?: boolean; // e.g. rsvp_form anchored
}

export interface HeroBlockConfig extends BaseSectionBlockConfig {
  type: "hero";
  overline?: string;
  mainTitle?: string;
  subtitle?: string;
  coverImageUrl?: string;
  datePill?: string;
  timePill?: string;
  venuePill?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  enableCalendarExport?: boolean;
}

export interface CountdownBlockConfig extends BaseSectionBlockConfig {
  type: "countdown";
  countdownHeading?: string;
  targetDate?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  badge?: string; // "Ceremony" | "Cocktails" | "Dinner" | "Party" | "Brunch"
  locationName?: string;
  mapUrl?: string;
}

export interface ScheduleBlockConfig extends BaseSectionBlockConfig {
  type: "schedule";
  subtitle?: string;
  timelineItems: ScheduleItem[];
  enableCalendarDownload?: boolean;
}

export interface WishingNote {
  id: string;
  authorName: string;
  authorRole: string; // "Family" | "Friend" | "Best Friend" | "Colleague" | "Guest"
  message: string;
  date: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface WishingWallBlockConfig extends BaseSectionBlockConfig {
  type: "wishing_wall";
  subtitle?: string;
  allowGuestSubmissions: boolean;
  initialNotes?: WishingNote[];
  moderationEnabled?: boolean;
}

export interface BankAccountDetails {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchOrSwift?: string;
  qrCodeUrl?: string; // VietQR, InstaPay, or image URL
  transferNote?: string;
  badge?: string;
}

export interface GiftRegistryBlockConfig extends BaseSectionBlockConfig {
  type: "gift_registry";
  subtitle?: string;
  accounts: BankAccountDetails[];
  registryLinks?: Array<{ title: string; url: string; logoUrl?: string }>;
}

export interface BackgroundAudioBlockConfig extends BaseSectionBlockConfig {
  type: "background_audio";
  audioUrl: string;
  trackTitle: string;
  artistName?: string;
  loop: boolean;
  initialVolume: number;
}

export interface GalleryPhotoItem {
  id: string;
  imageUrl: string;
  caption?: string;
  category?: string; // e.g. "Couple", "Pre-wedding", "Ceremony", "Around The Phone"
  alt?: string;
}

export interface GalleryBlockConfig extends BaseSectionBlockConfig {
  type: "gallery";
  subtitle?: string;
  galleryMode: "responsive-grid" | "masonry" | "circular-3d" | "polaroid-decay";
  photos: GalleryPhotoItem[];
  enableCategoryFilter: boolean;
}

export interface DressCodeColor {
  hex: string;
  label: string;
}

export interface VenueMapBlockConfig extends BaseSectionBlockConfig {
  type: "venue_map";
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  parkingNote?: string;
  dressCodeTitle?: string;
  dressCodeDescription?: string;
  dressCodeSwatches?: DressCodeColor[];
}

export interface CustomHighlightBlockConfig extends BaseSectionBlockConfig {
  type: "custom_highlight";
  highlightBadge?: string;
  mainTitle?: string;
  highlightText?: string;
  highlightImageUrl?: string;
}

export type InvitationSectionBlock =
  | HeroBlockConfig
  | CountdownBlockConfig
  | ScheduleBlockConfig
  | WishingWallBlockConfig
  | GiftRegistryBlockConfig
  | BackgroundAudioBlockConfig
  | GalleryBlockConfig
  | VenueMapBlockConfig
  | CustomHighlightBlockConfig
  | BaseSectionBlockConfig;
```

---

## 4. Deep Component Specifications for Modern Interactive Sections

### 4.1. Section 1: Hero / Cover Section (`EventHeroSection.tsx`)
- **Props Interface:**
  ```typescript
  export interface EventHeroSectionProps {
    config?: Partial<HeroBlockConfig>;
    invitation: InvitationDocument;
    onRsvpClick?: () => void;
    isNoir?: boolean;
  }
  ```
- **Key Capabilities:**
  - Displays high-resolution cover photo with luxury gold border and ambient gradient fade.
  - Formatted overline, celebration headline, and italicized poetic quote.
  - Triple metadata pills: Date, Time, Venue with gold iconography.
  - Dual CTAs: Primary "RSVP Now" (smooth scroll to `#rsvp-section`) and Secondary "Add to Calendar" dropdown.
  - Generates calendar export links:
    - Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...`
    - Apple/Outlook `.ics` download dynamically constructed via data URI Blob.

### 4.2. Section 2: Event Timeline / Multi-Event Schedule (`EventScheduleSection.tsx`)
- **Props Interface:**
  ```typescript
  export interface EventScheduleSectionProps {
    config?: Partial<ScheduleBlockConfig>;
    items?: ScheduleItem[];
    title?: string;
    subtitle?: string;
    isNoir?: boolean;
    eventDate?: string;
    eventTitle?: string;
  }
  ```
- **Key Capabilities:**
  - Vertical luxury timeline track with glowing golden circular nodes.
  - Milestone cards displaying Time, Title, Milestone Badge (e.g. "Ceremony", "Reception", "Dinner"), and Description.
  - Per-milestone location details with one-click Google Maps shortcut.
  - "Add Entire Schedule to Calendar" button generating an `.ics` calendar bundle.

### 4.3. Section 3: Interactive RSVP Section (`DynamicRsvpForm.tsx`)
- **Props Interface:**
  ```typescript
  export interface DynamicRsvpFormProps {
    config?: Partial<BaseSectionBlockConfig>;
    invitation: InvitationDocument;
    schema?: DynamicFormField[];
    onSuccess?: (rsvp: InvitationRsvpDocument) => void;
    onPreviewPass?: (rsvpId: string) => void;
    isNoir?: boolean;
  }
  ```
- **Key Capabilities:**
  - Dynamically renders fields based on `formSchemaJson`.
  - Strictly enforces required & locked `guestName` and `guestEmail` for ticket delivery.
  - Renders interactive attendance selector: "I will attend with joy" (✓) vs "Regretfully declined" (✕).
  - Renders companion count selector (+1, +2, +3).
  - Renders dietary preference chips ("No restrictions", "Vegetarian", "Vegan", "Halal", "Gluten-Free").
  - On submission:
    - Generates unique VIP pass token (`INV-PASS-XXXX-YYYY`) and dynamic QR code image URL.
    - Saves submission to `localStorage` cache `asar_invitation_rsvps_cache` and Appwrite DB.
    - Displays confirmation card with reference token and "Open VIP QR Pass" modal button.
    - Automatically forwards any blessing message into the Wishing Wall!

### 4.4. Section 4: Interactive Wishing Wall / Guestbook (`EventWishingWallSection.tsx`)
- **Props Interface:**
  ```typescript
  export interface EventWishingWallSectionProps {
    config?: Partial<WishingWallBlockConfig>;
    invitationId: string;
    title?: string;
    subtitle?: string;
    isNoir?: boolean;
    initialNotes?: WishingNote[];
  }
  ```
- **Key Capabilities:**
  - Real-time guestbook stream displaying guest blessing cards with author name, role avatar badge, date, and heart count.
  - "Leave a Blessing" modal dialog with inputs for:
    - `authorName`: Full Name (auto-filled if guest already RSVP'd)
    - `authorRole`: Relationship dropdown ("Best Friend", "Friend", "Family", "Sister", "Brother", "Colleague", "Special Guest")
    - `message`: Textarea for heartfelt wishes and prayers
  - Optimistic Like / Heart toggle with animated pulse.
  - Confetti / heart celebration trigger upon posting a new blessing.
  - Persists to `localStorage` (`asar_wishing_wall_cache`) and Appwrite `BoothMedia` collection with `mediaType="guestbook_note"`.

### 4.5. Section 5: Background Audio Player (`BackgroundAudioPlayer.tsx`)
- **Props Interface:**
  ```typescript
  export interface BackgroundAudioPlayerProps {
    config?: Partial<BackgroundAudioBlockConfig>;
    audioUrl?: string;
    trackTitle?: string;
    artistName?: string;
    isNoir?: boolean;
    initialVolume?: number;
  }
  ```
- **Key Capabilities:**
  - Persistent floating pill docked at bottom-right of viewport (z-index 9000).
  - Respects browser autoplay restrictions: attaches a one-time global user-gesture listener on `window` to initiate audio on first tap/scroll if configured.
  - Interactive controls: Play/Pause button, Mute toggle, Volume scrubber, Loop toggle.
  - Rotating vinyl record badge with spinning disc animation when playing.
  - Waveform audio bar indicator that animates dynamically during playback.
  - Graceful audio error handling and fallback chime using Web Audio API oscillator.

### 4.6. Section 6: Digital Gift Registry / Bank QR Blessing Box (`EventGiftRegistrySection.tsx`)
- **Props Interface:**
  ```typescript
  export interface EventGiftRegistrySectionProps {
    config?: Partial<GiftRegistryBlockConfig>;
    title?: string;
    subtitle?: string;
    accounts?: BankAccountDetails[];
    registryLinks?: Array<{ title: string; url: string; logoUrl?: string }>;
    isNoir?: boolean;
  }
  ```
- **Key Capabilities:**
  - Visual banking cards for payment methods: VietQR, InstaPay, Vodafone Cash, Commercial International Bank (CIB), or custom bank transfer.
  - Generates or displays bank QR code (compatible with VietQR standards: `https://api.vietqr.io/image/...`).
  - One-click "Copy Account Number" and "Copy Transfer Memo" with instant copy feedback badge ("✓ تم النسخ · Copied!").
  - QR Code Lightbox Modal allowing guests to zoom in on mobile to scan directly.
  - Optional external registry links (Amazon, Zola, Honeyfund).

### 4.7. Section 7: Photo Memories Gallery (`EventMediaGallery.tsx`)
- **Props Interface:**
  ```typescript
  export interface EventMediaGalleryProps {
    config?: Partial<GalleryBlockConfig>;
    gallery?: GalleryPhotoItem[];
    title?: string;
    subtitle?: string;
    galleryMode?: "responsive-grid" | "masonry" | "circular-3d" | "polaroid-decay";
    isNoir?: boolean;
  }
  ```
- **Key Capabilities:**
  - Responsive masonry grid layout.
  - Category filter pills row ("All", "Couple", "Pre-wedding", "Ceremony", "Party", "Moments Around The Phone").
  - Fullscreen Lightbox Modal with Next / Previous navigation, photo counter ("3 of 12"), caption overlay, and "Save Photo" download button.
  - Smooth zoom-on-hover card physics.

---

## 5. Aligning `apps/Booth` Photo Memories with `apps/Invitation`

### 5.1. Dual-Lifecycle Wedding Experience

A key architectural strength of ASAR is its dual service model:
1. **Pre-Event Phase (`apps/Invitation`):**
   - Guests receive the digital invitation link (`[slug].asar.me` or `localhost:3003/e/[slug]`).
   - They explore the story, view engagement photos, check the multi-event schedule, submit RSVPs, send wishing wall blessings, and view the bank QR blessing box.
2. **Post-Event Phase (`apps/Booth`):**
   - During the wedding, guests record voice messages on the audio telephone booth and capture candid polaroid/digital photos.
   - The couple receives their lasting audio heirloom page (`[slug].asar.me` or `localhost:3002/memory/[slug]`).

### 5.2. Data Model & Component Federation

To align Booth photo memories and Invitation galleries without risky inter-app coupling:

1. **Shared Media Representation in `@repo/react-appwrite`:**
   ```typescript
   export interface AsarMediaItem {
     id: string;
     url: string;
     caption?: string;
     category?: string;
     sortOrder?: number;
     createdAt?: string;
   }
   ```
2. **Bi-directional Cache & Appwrite Hydration:**
   - In `apps/Invitation`, the Gallery block checks if there are post-event Booth photos associated with the order or slug in `ASAR_COLLECTIONS.BOOTH_MEDIA`.
   - If Booth photos exist, the Invitation gallery displays a category pill **"Moments Around The Phone (Booth)"** that renders the candid audio booth snapshots alongside couple photos!
   - Guests visiting the invitation website after the wedding can seamlessly navigate to the audio heirloom via a banner: *"✦ استمع إلى الرسائل الصوتية للزفاف · Listen to Audio Memories on Athar Booth 🎧"*.

3. **Shared Wishing Wall & Guestbook Notes:**
   - Notes submitted via Invitation's Wishing Wall and notes submitted via Booth's `LeaveLoveModal` both persist with `mediaType="guestbook_note"`.
   - Both feeds render with identical author badges, role tags, timestamps, and heart like counters.

---

## 6. Implementation Architecture in `apps/Invitation`

### 6.1. Dynamic Modular Section Renderer Pipeline

In `apps/Invitation/src/pages/CustomEventPage.tsx`, the static hardcoded section stack will be replaced by the dynamic modular section loop:

```tsx
// 1. Resolve sections config from invitation or fallback canonical defaults
const sectionBlocks: InvitationSectionBlock[] = useMemo(() => {
  if (invitation.sectionsConfigJson) {
    const parsed = safeJsonParse<InvitationSectionBlock[]>(invitation.sectionsConfigJson, []);
    if (parsed.length > 0) return parsed;
  }
  return DEFAULT_CANONICAL_SECTION_BLOCKS;
}, [invitation.sectionsConfigJson]);

// 2. Sort and filter visible blocks
const visibleBlocks = useMemo(() => {
  return sectionBlocks
    .filter((b) => b.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}, [sectionBlocks]);

// 3. Render modular sections dynamically
<main>
  {visibleBlocks.map((block) => {
    switch (block.type) {
      case "hero":
        return <EventHeroSection key={block.id} config={block} invitation={invitation} isNoir={isNoir} />;
      case "countdown":
        return <EventCountdownSection key={block.id} config={block} isNoir={isNoir} />;
      case "schedule":
        return <EventScheduleSection key={block.id} config={block} isNoir={isNoir} />;
      case "gallery":
        return <EventMediaGallery key={block.id} config={block} isNoir={isNoir} />;
      case "venue_map":
        return <EventLocationMap key={block.id} config={block} isNoir={isNoir} />;
      case "wishing_wall":
        return <EventWishingWallSection key={block.id} config={block} invitationId={invitation.id || slug} isNoir={isNoir} />;
      case "gift_registry":
        return <EventGiftRegistrySection key={block.id} config={block} isNoir={isNoir} />;
      case "rsvp_form":
        return <DynamicRsvpForm key={block.id} config={block} invitation={invitation} schema={formSchema} isNoir={isNoir} onPreviewPass={onOpenPass} />;
      case "custom_highlight":
        return <EventHighlightSection key={block.id} config={block} isNoir={isNoir} />;
      default:
        return null;
    }
  })}
</main>

{/* 4. Floating Persistent Background Audio Player */}
{backgroundAudioConfig && (
  <BackgroundAudioPlayer config={backgroundAudioConfig} isNoir={isNoir} />
)}
```

### 6.2. File Modifications & New Components Map

| Target Path | Action | Description |
|---|---|---|
| `packages/react-appwrite/src/AsarDomain/models.ts` | **Update** | Export unified `SectionBlockType`, `WishingNote`, `BankAccountDetails`, `ScheduleMilestone`, `GalleryPhotoItem`. |
| `apps/Invitation/src/components/renderer/types.ts` | **Update** | Align renderer types with updated domain models. |
| `apps/Invitation/src/components/renderer/EventWishingWallSection.tsx` | **Create** | New interactive Wishing Wall component with message submission modal, heart likes, and real-time updates. |
| `apps/Invitation/src/components/renderer/EventGiftRegistrySection.tsx` | **Create** | New Digital Gift Registry & Bank QR Blessing Box with VietQR / InstaPay copy buttons and modal zoom. |
| `apps/Invitation/src/components/renderer/BackgroundAudioPlayer.tsx` | **Create** | New floating persistent audio bar with track info, play/pause, volume/mute, and loop control. |
| `apps/Invitation/src/components/renderer/EventHighlightSection.tsx` | **Create** | New editorial verse / story highlight banner block. |
| `apps/Invitation/src/components/renderer/EventScheduleSection.tsx` | **Enhance** | Add multi-event milestones, map links, and .ics / Google Calendar export. |
| `apps/Invitation/src/components/renderer/EventMediaGallery.tsx` | **Enhance** | Add category filtering pills, masonry layout, and Lightbox modal. |
| `apps/Invitation/src/components/renderer/DynamicRsvpForm.tsx` | **Enhance** | Add dietary preference chips, companion counters, and instant Wishing Wall sync. |
| `apps/Invitation/src/components/renderer/index.ts` | **Update** | Export all new and updated components. |
| `apps/Invitation/src/pages/CustomEventPage.tsx` | **Update** | Replace hardcoded section stack with dynamic modular section dispatcher iterating over `visibleBlocks`. |
| `apps/Renderer/src/components/invitation/InvitationMemoryRenderer.tsx` | **Update** | Align dedicated renderer on Port 3004 with dynamic modular section rendering. |
| `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` | **Update** | Include Wishing Wall, Bank QR Blessing Box, and Audio blocks in the composable sections editor. |

---

## 7. State Management & Interaction Flows

### 7.1. Guest RSVP & Pass Generation Flow

```
1. Guest scrolls to RSVP section (or clicks "Confirm Attendance" in Hero)
2. Guest enters Full Name, Email, Companions count, and Dietary preferences
3. Real-time validation checks required fields and valid RFC email format
4. Guest clicks "Submit Attendance"
5. System generates:
   - Unique passToken: INV-PASS-XXXX-YYYY
   - Dynamic QR Code URL: encodes check-in URL with passToken
6. Record written to:
   - LocalStorage cache: asar_invitation_rsvps_cache
   - Appwrite Database: ASAR_COLLECTIONS.INVITATION_RSVPS
   - Main Client Mailbox (port 3000) reflects new response immediately
7. UI transitions to Confirmation State with Pass Token badge and "Open VIP QR Pass" modal
8. Any memory message written in the RSVP form is automatically posted to the Wishing Wall!
```

### 7.2. Wishing Wall Interaction Flow

```
1. Guest views live stream of blessing cards on the Wishing Wall
2. Guest clicks "Leave a Blessing" button
3. Modal appears with Name, Relationship pill, and Message textarea
4. Guest submits:
   - New card appears at the top of the feed immediately (optimistic UI)
   - Heart / Love animation triggers
   - Record persisted to local cache & Appwrite
5. Any guest can click the Heart button on any note:
   - Likes count increments optimistically (+1)
   - Liked state toggled in localStorage
```

### 7.3. Digital Gift Registry / Bank QR Copy Flow

```
1. Guest reaches "Blessing Box & Gift Registry" section
2. Guest views bank accounts (e.g., VietQR card, InstaPay, CIB Account)
3. Guest clicks "Copy Account Number" button:
   - Account number copied to clipboard via navigator.clipboard.writeText
   - Button text switches to "✓ Copied! · تم النسخ" for 2.5 seconds
4. Guest can click the QR Code to enlarge into a full-screen Lightbox for scanning
```

---

## 8. Verification & Acceptance Criteria

To ensure implementation conforms to R3 and workspace quality rules:

1. **Section Modularity Verification:**
   - In `apps/Admin`, toggling a section's visibility off hides it immediately on the rendered invitation site.
   - Reordering sections in Admin changes their order on `CustomEventPage`.
   - Adding a new Wishing Wall or Blessing Box section renders the corresponding interactive component.

2. **Interactive Feature Verification:**
   - **RSVP:** Submitting an RSVP creates a valid pass token and displays the QR pass modal.
   - **Wishing Wall:** Posting a blessing adds a card to the feed and persists across refreshes.
   - **Audio Player:** Clicking play starts the soundtrack; volume and mute controls function correctly.
   - **Gift Registry:** Clicking copy buttons copies text to clipboard and displays visual feedback.
   - **Gallery:** Clicking category pills filters photos; clicking a photo opens the Lightbox.

3. **Constraint Adherence:**
   - Zero excessive `npm run build` runs.
   - No unnecessary code generators or scratch scripts.
   - Clean TypeScript typechecking across all modified packages.
