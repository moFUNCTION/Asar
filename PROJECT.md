# Project: ASAR Modular Section Website Creation Editor & Modern Interactive Event Features

## Architecture

ASAR is a luxury event audio and digital invitation platform engineered as a high-performance Turborepo monorepo:
- `packages/react-appwrite`: Shared domain models, Appwrite collection/bucket constants, Storefront Subdomain Engine, and the **Modular Section Domain Engine** (`sections.ts`, `ModularWebsiteConfig`, `EventSection`, section validators, legacy migration parsers).
- `apps/Admin`: Luxury management console with React Router v6 declarative routes, dynamic plans builder, order queue pipeline, and the **Modular Section-Based Website Creation Editor** (`SectionPaletteModal`, `ModularSectionList`, per-section Config Inspectors, and `LiveModularPreview`).
- `apps/Invitation`: Digital invitation showcase and dynamic storefront with the **Dynamic Modular Section Dispatcher** and modern interactive features: Live Wishing Wall, Multi-Event Schedule, Persistent Floating Audio Soundtrack, Digital Gift Registry with Bank QR / VietQR, Dynamic RSVP with Instant VIP Pass, and Responsive Photo Gallery with Lightbox.
- `apps/Booth`: Audio guestbook experience, dynamic plans selection, and **Photo Memories Gallery** aligned with the shared modular event schema.
- `apps/Main`: Client platform gateway and customer account portal with VIP RSVP Mailbox and QR pass hub.
- `packages/UI-components`: 21 Awwwards-grade luxury UI components (`GradientWaves`, `BlurText`, `SplitText`, `TiltedCard`, etc.).

---

## Feature Inventory

Every feature from the Survey phase is mapped to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Competitive Analysis Documentation | Publish `docs/COMPETITIVE_ANALYSIS.md` analyzing Chungdoi, WithJoy, Zola, Biihappy | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Architecture Documentation Update | Update `docs/ASAR_PROJECT_ARCHITECTURE.md` with modular section architecture, schema, data flow, app boundaries | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Shared Modular Section Data Schema | `packages/react-appwrite/src/AsarDomain/sections.ts` with discriminated union `EventSection` (11 types), `ModularWebsiteConfig`, validators | M1 | ORIGINAL_REQUEST §R1, §R2 |
| 4 | Legacy Block Migration & Parser | Backward-compatible parser transforming legacy flat blocks into modern `EventSection` models with zero crash | M1 | Survey Explorer 1 |
| 5 | Domain Automated Unit Tests | Unit tests in `packages/react-appwrite/test/sections.test.ts` verifying parsing, validation, serialization, migration | M1 | ORIGINAL_REQUEST §Acceptance |
| 6 | Admin Section Palette Modal | `apps/Admin` visual picker dialog allowing admins to drop in any available modular section type with icons & categories | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Admin Reorderable Modular Section Deck | `apps/Admin` section list with move up/down order controls, enable/disable toggle, duplicate, and delete actions | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Admin RSVP Section Inspector | Config form for RSVP capacity, attendance options, companions limit, dietary options, locked email verification | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Admin Wishing Wall Section Inspector | Config form for guestbook title, subtitle, moderation policy, greeting prompt, allowed reactions | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Admin Event Schedule Inspector | Config form for multi-event items (Ceremony, Reception, Afterparty) with times, locations, dress codes, Google Map links | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Admin Background Audio Inspector | Config form for audio track URL, song title, artist, auto-play hint, loop toggle | M2 | ORIGINAL_REQUEST §R2 |
| 12 | Admin Digital Gift Registry Inspector | Config form for Bank QR (VietQR / InstaPay / IBAN), account number, bank name, beneficiary name, transfer memo, cash details | M2 | ORIGINAL_REQUEST §R2 |
| 13 | Admin Photo Gallery Inspector | Config form for gallery photos, layout mode (masonry, grid, carousel), category tags | M2 | ORIGINAL_REQUEST §R2 |
| 14 | Admin Hero, Story, Venue & Highlight Inspectors | Config forms for Cover/Hero, Couple Story milestones, Venue/Map with parking, and Editorial Highlights | M2 | ORIGINAL_REQUEST §R2 |
| 15 | Admin Live Split-Screen Modular Preview | Real-time preview canvas in `apps/Admin` displaying the configured website with mobile and desktop viewport frames | M2 | ORIGINAL_REQUEST §R2 |
| 16 | Admin Data Persistence & Appwrite Sync | Save and retrieve `ModularWebsiteConfig` to `sectionsConfigJson` on `invitations` collection and `localStorage` | M2 | ORIGINAL_REQUEST §R2 |
| 17 | Invitation Dynamic Modular Dispatcher | `apps/Invitation` dynamic section renderer mapping section types to components in configured order | M3 | ORIGINAL_REQUEST §R3 |
| 18 | Interactive Wishing Wall in Invitation | Real-time guest message submission, optimistic update, live wall card feed, likes, and local/Appwrite sync | M3 | ORIGINAL_REQUEST §R3 |
| 19 | Multi-Event Schedule Timeline in Invitation | Interactive schedule cards, location addresses, Google Maps directions, and Add to Calendar (.ics) export | M3 | ORIGINAL_REQUEST §R3 |
| 20 | Persistent Floating Background Audio Player | Floating audio player bar with vinyl/sound visualizer, play/pause, volume/mute toggle, and song title | M3 | ORIGINAL_REQUEST §R3 |
| 21 | Digital Gift Registry Box with Bank QR | Blessing box displaying Bank QR, account details, 1-tap copy to clipboard, and transfer memo | M3 | ORIGINAL_REQUEST §R3 |
| 22 | Dynamic Guest RSVP Submission | Form submission with attendance status, companions count, dietary choices, real-time feedback, instant VIP QR pass modal | M3 | ORIGINAL_REQUEST §R3 |
| 23 | Responsive Photo Memories Gallery | Responsive masonry photo grid with category filter pills and fullscreen modal lightbox | M3 | ORIGINAL_REQUEST §R3 |
| 24 | Invitation Page Integration | Update `apps/Invitation/src/pages/CustomEventPage.tsx` to dynamically render modular sections with zero regressions | M3 | ORIGINAL_REQUEST §R3 |
| 25 | Booth Photo Memories Alignment | Align `apps/Booth` photo gallery components and models with the shared event section schema and category filters | M4 | ORIGINAL_REQUEST §R3 |
| 26 | Workspace TypeScript & Quality Verification | `tsc --noEmit` across all 5 tsconfigs, zero lint errors, automated test suites execution | M5 | ORIGINAL_REQUEST §Acceptance |
| 27 | Adversarial Stress Testing | Empirical challenger stress testing of section ordering, schema validation, wishing wall and RSVP edge cases | M5 | ORIGINAL_REQUEST §Acceptance |
| 28 | Forensic Integrity Audit | Systematic integrity validation verifying authentic, genuine implementation without shortcuts or dummy facades | M5 | ORIGINAL_REQUEST §Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architecture & Shared Modular Domain Engine | `docs/COMPETITIVE_ANALYSIS.md`, `docs/ASAR_PROJECT_ARCHITECTURE.md`, `packages/react-appwrite/src/AsarDomain/sections.ts`, tests | none | DONE |
| M2 | Admin Modular Website Creation Editor | `apps/Admin/src/components/invitation-studio/*` (palette, reorder list, inspectors, live preview, persistence) | M1 | DONE |
| M3 | Invitation Dynamic Storefront & Interactive Features | `apps/Invitation/src/components/modular-renderer/*`, `CustomEventPage.tsx` | M1 | DONE |
| M4 | Booth Photo Memories Alignment | `apps/Booth/src/components/memory/PhotoGalleryGrid.tsx`, shared category alignment | M1, M3 | DONE |
| M5 | Verification, Adversarial Testing & Forensic Audit | Workspace typecheck, test suites, Challenger stress tests, Forensic Auditor | M1–M4 | DONE |

---

## Interface Contracts

### Shared Modular Section Schema (`@repo/react-appwrite`)
```typescript
export type EventSectionType =
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
  type: EventSectionType;
  title: string;
  titleAr?: string;
  enabled: boolean;
  order: number;
}

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

export interface ModularWebsiteConfig {
  version: "2.0";
  sections: EventSection[];
  themeConfig?: Record<string, unknown>;
  metadata?: {
    lastEditedAt: string;
    publishedAt?: string;
  };
}
```

### Admin ↔ Invitation Contract
- Admin stores `ModularWebsiteConfig` as serialized JSON in `invitation.sectionsConfigJson`.
- Invitation reads `invitation.sectionsConfigJson`, parses it via `parseModularWebsiteConfig(json)` from `@repo/react-appwrite`, filters `section.enabled === true`, sorts by `section.order`, and dispatches to visual components via `ModularSectionDispatcher`.

### Guest ↔ Host Contract
- Guest submits Wishing Wall message: stored in Appwrite collection `booth_media` (or `invitations` cache) with guest name, message, timestamp, and optional avatar.
- Guest submits RSVP: validated against `formSchema`, stored in `invitation_rsvps` collection, immediately generating a VIP QR pass token and displaying confirmation modal.

---

## Code Layout

- `packages/react-appwrite/src/AsarDomain/sections.ts`: Schema, models, parsers, default sections, migration helpers.
- `packages/react-appwrite/test/sections.test.ts`: Automated unit test suite for modular section engine.
- `apps/Admin/src/components/invitation-studio/`:
  - `SectionPaletteModal.tsx`: Visual section picker dialog.
  - `ModularSectionList.tsx`: Reorderable section management deck.
  - `inspectors/`: Per-section config forms (`RsvpSectionInspector.tsx`, `WishingWallInspector.tsx`, etc.).
  - `LiveModularPreview.tsx`: Real-time preview canvas with device frame toggles.
  - `InvitationStudio.tsx`: Master studio coordinating state and Appwrite persistence.
- `apps/Invitation/src/components/modular-renderer/`:
  - `ModularSectionDispatcher.tsx`: Dispatcher mapping `EventSection` to visual components.
  - `sections/`:
    - `InteractiveWishingWallSection.tsx`
    - `MultiEventScheduleSection.tsx`
    - `FloatingAudioPlayerBar.tsx`
    - `DigitalGiftRegistrySection.tsx`
    - `InteractiveRsvpSection.tsx`
    - `ResponsivePhotoGallerySection.tsx`
- `apps/Invitation/src/pages/CustomEventPage.tsx`: Dynamic modular page entry point.
- `apps/Booth/src/components/memory/PhotoGalleryGrid.tsx`: Aligned photo memories component.
