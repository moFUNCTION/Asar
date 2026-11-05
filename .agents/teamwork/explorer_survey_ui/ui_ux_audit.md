# ASAR (Athar / أثر) — Monorepo UI & UX Comprehensive Audit Report
**Warm Vintage Editorial Luxury Design System Alignment**

**Document Version:** 1.0.0  
**Audit Author:** `explorer_survey_ui` (Read-Only Teamwork Exploration Agent)  
**Date:** 2026-11-04 / 2026-11-05 UTC  
**Target Scope:** `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`, and `packages/UI-components`  
**Mandatory Specification:** `docs/ASAR_DESIGN_SYSTEM.md` & `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md`

---

## 1. Executive Summary & Monorepo Audit Scorecard

The ASAR digital ecosystem is architected around a distinct, high-concept brand aesthetic: **Warm Vintage Editorial Luxury** (inspired by tactile wedding stationery, antique rotary audio guestbooks, champagne gold typography, and rich burgundy/maroon anchors).

Across the workspace, the five applications exhibit varying degrees of visual maturity and fidelity:
- **`apps/Booth`** serves as the original design beacon and closest reference implementation: it features custom `@repo/ui-components` animations (`SplashCursor`, `CardNav`, `BlurText`, `SplitText`), tactile cards, and responsive acoustic waveform dividers. However, it still lacks complete CSS token parity from `docs/ASAR_DESIGN_SYSTEM.md`, has mobile button stacking conflicts, and misses `dir="auto"` on bilingual guestbook entries.
- **`apps/Admin`** boasts a sophisticated console structure with a unified `AdminShell`, tabbed sub-studios, and SVG status badges. However, it suffers from severe palette contamination in `AdminOverview.tsx` (using generic Tailwind blues `#3B82F6`, purples `#8B5CF6`, and hot pinks `#EC4899`), calls browser-native `alert()` dialogs in `PaymentReceiptInspector.tsx`, has `lang="en"` without font preloading in `index.html`, and lacks empty state handling on recent orders.
- **`apps/Invitation`** delivers a complete 10-section modular event renderer and interactive RSVP generator, but is **completely isolated from `@repo/ui-components`** (not even declared in `package.json`). Its packages section is static compared to Booth's 3D tilted cards, its `index.html` lacks Arabic font declarations, and user-submitted wishes lack bilingual `dir="auto"` text direction.
- **`apps/Main`** provides a portal and customer account dashboard with timeline tracking and RSVP mailbox management. Like Invitation, it has zero integration with `@repo/ui-components`, uses divergent CSS class names (`.card-luxury` vs `.athar-card`), and has no font preloading in `index.html`.
- **`apps/Renderer`** provides a dynamic multi-tenant subdomain and path renderer (Port 3004), but relies heavily on raw inline HTML styles (`style={{ ... }}`), misses essential design tokens in `index.css`, and critically **flashes a 404 "Not Found" screen during asynchronous Appwrite resolution** before remote data loads.

### Monorepo Compliance Scorecard

| Application | Visual Identity & Palette | Typography & Bilingual | Responsive Layouts | Micro-interactions & Shaders | Loading States & Skeletons | Overall Grade |
|---|---|---|---|---|---|---|
| **`apps/Booth`** | 88% (Warm Alabaster) | 90% (Serif display) | 82% (Mobile bar tall) | 94% (CardNav, Splash) | 65% (No skeletons) | **84% (B+)** |
| **`apps/Admin`** | 76% (Tailwind blues/pinks) | 84% (Display headers) | 86% (Responsive grids) | 72% (Few UI components) | 60% (No skeletons, alerts) | **76% (C+)** |
| **`apps/Invitation`**| 84% (Ivory & Noir) | 82% (Missing head fonts) | 88% (Sticky nav pills) | 60% (No UI components!) | 62% (No skeletons) | **75% (C+)** |
| **`apps/Main`** | 82% (Ivory Alabaster) | 80% (Missing head fonts) | 85% (Tabs & grids) | 58% (No UI components!) | 60% (No skeletons) | **73% (C)** |
| **`apps/Renderer`** | 70% (Missing CSS tokens) | 72% (Inline styling) | 78% (Inline header wrap) | 62% (No UI components) | 45% (Flash of 404!) | **65% (D+)** |

---

## 2. Dimension 1: Visual Identity & Styling Compliance

### 2.1. Typography & Font Stacks
The ASAR design system mandates a classical editorial typographic hierarchy:
- Display Headers: Poetic Serifs (`Amiri`, `Aref Ruqaa`, and `Playfair Display`, with Latin luxury display accents `Cinzel` / `Cormorant Garamond`).
- UI Controls, Body & Tables: Geometric, high-legibility Sans-Serifs (`Cairo`, system fallback).
- Bilingual Alignment: `dir="auto"` applied to all user-generated content (guest blessings, audio quotes, couple notes).

#### Observed Deficits:
1. **HTML Header Preloading Discrepancy**:
   - `apps/Booth/index.html` (lines 9-11) and `apps/Renderer/index.html` (lines 9-11) correctly preload `Amiri`, `Aref Ruqaa`, `Cairo`, and `Playfair Display` with `lang="ar" dir="rtl"`.
   - In contrast, `apps/Admin/index.html` (lines 8-10), `apps/Invitation/index.html` (lines 8-10), and `apps/Main/index.html` (lines 8-10) only preload `Plus Jakarta Sans` or `Playfair Display`, omitting `Amiri`, `Aref Ruqaa`, and `Cairo` from `<head>`. Furthermore, they declare `<html lang="en">` without `dir="rtl"` or bilingual metadata, forcing layout engines to rely purely on CSS `@import`, which causes a noticeable Flash of Unstyled Text (FOUT).
2. **Missing `dir="auto"` on Bilingual UGC**:
   - In `apps/Booth/src/components/memory/GuestBookFeed.tsx` (line 137), `note.message` is rendered inside a plain `<Text>` element inside a global RTL page. When an international or bilingual guest leaves an English message (e.g., `"Mabrook ya gamila, wishing you endless love!"`), the text aligns to the right and trailing punctuation marks jump to the left margin.
   - In `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx` (line 520), `<p>{wish.message}</p>` lacks `dir="auto"`.
   - In `apps/Renderer/src/components/booth/BoothVoiceCard.tsx` (line 62) and `apps/Booth/src/components/memory/VoiceCard.tsx`, quote snippets lack `dir="auto"`.
3. **CSS Variable Discrepancies**:
   - `apps/Booth/src/index.css` and `apps/Renderer/src/index.css` define class utilities like `.font-arabic-display`, but omit the root CSS variables `--font-arabic-display`, `--font-latin-display`, and `--font-body` defined in `docs/ASAR_DESIGN_SYSTEM.md`.

### 2.2. Color Palette & Token Drift
The ASAR palette must evoke warm handmade cotton rag wedding stationery:
- **Canvas:** Warm Alabaster (`#FBF7F2`), Linen Cream (`#F4EFEA`), Warm Tertiary (`#EDE6DC`).
- **Brand Primary:** Royal Maroon (`#6B1D28`), Deep Burgundy (`#5B1621`), Maroon Deep (`#4A0E17`).
- **Brand Secondary:** Champagne Gold (`#D4AF37`), Bright Gold (`#E5C158`), Soft Gold (`#F1E5D1`), Gold Hairline Border (`rgba(212, 175, 55, 0.4)`).
- **Noir VIP Tier:** Obsidian Gradient `linear-gradient(170deg, #231A1E 0%, #161214 100%)` with `#D4AF37` borders.
- **Editorial Semantic Status:** Success (`#1E6F50`), Warning (`#B7791F`), Danger (`#9B2C2C`).

#### Observed Deficits:
1. **Generic SaaS Palette Contamination in `AdminOverview.tsx`**:
   - In `apps/Admin/src/components/dashboard/AdminOverview.tsx` (lines 77-90), the concierge pipeline stage chips use standard Tailwind/Bootstrap hex colors:
     ```tsx
     { key: "awaiting_client_assets", label: "Awaiting Client Assets", color: "#3B82F6" } // Generic SaaS Blue
     { key: "event_scheduled", label: "Event Scheduled", color: "#8B5CF6" }             // Generic Purple
     { key: "audio_mastering", label: "Audio Mastering", color: "#EC4899" }             // Generic Hot Pink
     ```
     These clash violently with the warm vintage editorial aesthetic. They should be refactored to luxury editorial tones:
     - `awaiting_client_assets` → Vintage Bronze (`#A26E38`) or Warm Sand (`#B38B59`)
     - `event_scheduled` → Deep Royal Burgundy (`#6B1D28`)
     - `audio_mastering` → Muted Rosewood / Antique Terracotta (`#944D59`)
2. **Missing Token Definitions in `apps/Renderer/src/index.css`**:
   - In `apps/Renderer/src/index.css` (lines 3-23), `:root` is missing:
     - `--athar-maroon-deep: #4A0E17;`
     - `--athar-maroon-subtle: rgba(107, 29, 40, 0.06);`
     - `--athar-gold-bright: #E5C158;`
     - `--athar-gold-border: rgba(212, 175, 55, 0.4);`
     - `--athar-bg-tertiary: #EDE6DC;`
     - `--athar-noir-bg` and `--athar-noir-surface`
     - Status colors (`--athar-status-success`, `--athar-status-warning`, `--athar-status-danger`)
     - Font stacks (`--font-arabic-display`, `--font-latin-display`, `--font-body`)
     - `--athar-shadow-gold`
3. **Missing Token Definitions in `apps/Booth/src/index.css`**:
   - Similar to Renderer, `apps/Booth/src/index.css` (lines 3-22) is missing `--athar-maroon-deep`, `--athar-gold-bright`, `--athar-gold-border`, `--athar-bg-tertiary`, Noir VIP tokens, and status tokens.
4. **CSS Class Fragmentation across Monorepo**:
   - Main uses `.card-luxury`, `.badge-gold`, `.badge-maroon`, `.badge-emerald`.
   - Admin uses `.athar-card`, `.athar-badge-gold`, `.athar-badge-maroon`, `.athar-badge-success`.
   - Invitation uses `.luxury-card`, `.shimmer-badge`, `.btn-athar-gold`.
   - Booth uses `.glass-panel`, `.btn-athar-primary`, `.btn-athar-secondary`.
   - Renderer uses `.glass-panel`.
   Every app maintains its own naming convention for luxury cards and badges, impeding component portability.

### 2.3. Surface Styling, Glassmorphism & Paper Textures
1. **Glassmorphism Saturation**:
   - `apps/Booth/src/index.css` (lines 71-78) applies `backdrop-filter: blur(20px) saturate(180%)`, providing an award-winning tactile frosted effect.
   - `apps/Renderer/src/components/booth/BoothMemoryRenderer.tsx` (lines 388) uses basic `backdropFilter: "blur(8px)"`, looking washed out rather than luxurious.
2. **Acoustic Waveform Dividers**:
   - `apps/Booth/src/pages/BoothMemoryPage.tsx` (lines 398-410) and `docs/ASAR_DESIGN_SYSTEM.md` Section 4.5 provide the canonical SVG waveform divider (`─── ∿∿∿ ───`).
   - In `apps/Admin/src/components/dashboard/AdminOverview.tsx` and `apps/Invitation/src/components/landing/OccasionsShowcaseSection.tsx`, sections separate with plain border lines rather than the acoustic waveform ornament.

---

## 3. Dimension 2: Layout & Navigation Cohesion

### 3.1. Responsive Layouts & Breakpoints
The monorepo targets four key viewport tiers:
- Mobile Small/Medium: 320px–390px (iPhone SE, iPhone 12/13/14 mini)
- Mobile Large: 390px–480px (iPhone Pro Max, Samsung Galaxy Ultra)
- Tablet / Portrait Laptop: 768px–1024px (iPad, Surface)
- Desktop & Ultra-wide: 1280px–1920px+

#### Observed Deficits:
1. **Mobile Bottom Bar Collision in `BoothMemoryPage.tsx`**:
   - `apps/Booth/src/components/memory/MemoryActionBar.tsx` (lines 42-46) sets `direction={{ base: "column", sm: "row" }}`. On mobile portrait viewports (<480px), the "Download All Messages" button and "Share Love" button stack vertically, creating a footer bar height of ~150px.
   - When an audio message is playing, `AudioPlayerBar.tsx` (line 59) docks at `bottom={{ base: "84px", md: "88px" }}`. Because the action bar expanded vertically to 150px on mobile, the player bar either overlaps the action bar or together they consume 230px+ of screen height (more than 35% of an iPhone SE viewport!).
   - **Recommendation:** Keep `MemoryActionBar` in a horizontal compact layout on mobile (`direction="row"` with icon-centric or condensed label pills) to maintain a fixed 64px height.
2. **Admin Console Header Mobile Wrap**:
   - In `apps/Admin/src/components/layout/AdminShell.tsx` (lines 69-76), the top header wraps with `wrap="wrap" gap={4}`. On screens between 320px and 375px, the brand title, console badge, and "Concierge Operations" badge wrap into 3 awkward lines, pushing the sticky navigation tabs below the fold.

### 3.2. Empty States
1. **Recent Orders in `AdminOverview.tsx`**:
   - In `apps/Admin/src/components/dashboard/AdminOverview.tsx` (lines 466-468), if `orders.length === 0`, `<VStack gap={3} align="stretch">` renders completely empty with no message or icon.
2. **Guest Book Notes in `BoothMemoryPage.tsx`**:
   - In `apps/Booth/src/components/memory/GuestBookFeed.tsx` (lines 69-80), an empty state is provided, but it uses plain dashed gray borders without the ASAR champagne gold touch or the feather pen illustration.
3. **Mailbox Filter Empty State in `ClientRsvpMailbox.tsx`**:
   - In `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` (lines 530-550), when filtering by "Declined" or searching for a non-existent name, the table displays a basic text notice rather than a branded empty stationery card.

### 3.3. Loading Skeletons — Monorepo-Wide Gap
Across all 5 applications in `d:\asar\apps\*\src\**\*.tsx`:
- **Grep Verification:** Executing a search for `Skeleton` across all apps yielded **zero matches**.
- **Impact:**
  - `apps/Admin`: During Appwrite database queries, metrics in `AdminOverview` display raw `0` before jumping to hydrated totals without shimmering skeleton placeholders.
  - `apps/Booth`: In `BoothMemoryPage.tsx`, before cached or remote voice records populate, the category counts flicker.
  - `apps/Invitation`: Modular sections pop into the DOM abruptly without progressive blurred skeleton cards.
  - `apps/Main`: In `ClientRsvpMailbox.tsx`, the RSVP list table pops in without row skeletons.

### 3.4. Error Toasts & Feedback States
1. **Native Browser `alert()` in Admin Payment Inspector**:
   - In `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx` (line 84):
     ```tsx
     alert("يرجى كتابة أو اختيار سبب الرفض لتوجيه العميل لإعادة الرفع بشكل صحيح.");
     ```
     This triggers a crude browser modal that pauses the JavaScript thread and destroys the luxury editorial experience.
   - **Recommendation:** Replace with an inline Chakra warning banner or custom animated toast (`toastNotification` state).
2. **Inconsistent Toast Patterns**:
   - `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` (lines 362-408) implements a bespoke inline toast banner with `#1E6F50` (success) and `#9B2C2C` (error) borders.
   - `apps/Booth` and `apps/Renderer` lack toast banners, relying instead on 3-second button label switches (`"Copied!"`, `"Done!"`).

### 3.5. Flash of 404 in `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`
This is one of the most critical interaction bugs discovered during the audit:
- In `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx` (lines 65-72, 130-175, 205-244):
  1. When navigating to `http://localhost:3004/s/:slug` where `:slug` is not a pre-seeded demo or in localStorage cache, `synchronousType` evaluates to `"unknown"`.
  2. `useEffect` initiates `queryRemoteCollections` to search Appwrite's `booth_memories` and `invitations` collections.
  3. However, on the initial render pass, `remoteClassification` is `null`, making `effectiveType = "unknown"`.
  4. The switch statement at line 212 hits `case "unknown": default: return <StorefrontNotFound requestedSlug={subdomain} reason="not-found" />`.
  5. The user is immediately presented with a full-page **"٤٠٤ — واجهة الذكريات غير متوفرة"** screen.
  6. 200–500ms later, when Appwrite returns the document, `setRemoteClassification("booth")` triggers a re-render, abruptly swapping the 404 screen for the memory renderer. If the connection is slow, the user assumes the link is broken.
- **Recommendation:** Introduce an `isResolving` loading state in `DynamicStorefrontIndex.tsx`. If `synchronousType === "unknown"` and `isResolving` is true, render a luxury editorial loading screen featuring a pulsing champagne gold monogram and linen paper texture.

---

## 4. Dimension 3: Micro-interactions, Shaders & Animations

### 4.1. `@repo/ui-components` Workspace Adoption Deficit
`packages/UI-components` contains 24 high-end UI components and WebGL/Canvas shaders:
`BlurText`, `CardNav`, `CircularGallery`, `CircularText`, `CountUp`, `CrystalizedBall`, `DecayCard`, `DitherVeil`, `FadeContent`, `GlowCursor`, `GradientWaves`, `GradualBlur`, `HalftoneReveal`, `Magnet`, `MorphSlider`, `PaperCrumple`, `PeekRating`, `RotatingText`, `ScrollExpand`, `ScrollReveal`, `SplashCursor`, `SplitText`, `TextType`, `TiltedCard`.

#### Actual App Adoption:
- **`apps/Booth`**: Superbly utilizes 8 components (`SplashCursor`, `BlurText`, `CardNav`, `FadeContent`, `SplitText`, `CountUp`, `DecayCard`, `TiltedCard`).
- **`apps/Invitation`**: **0 components used**. Package is NOT listed in `package.json`!
- **`apps/Main`**: **0 components used**. Package is NOT listed in `package.json`!
- **`apps/Renderer`**: **0 components used**, even though `@repo/ui-components: "*"` is in `package.json`!
- **`apps/Admin`**: **0 components used** in live views.

#### High-Impact Opportunities:
1. **`apps/Invitation`**:
   - Add `"@repo/ui-components": "*"` to `apps/Invitation/package.json`.
   - Wrap `InvitationPackagesSection.tsx` cards in `TiltedCard` and `FadeContent`.
   - Wrap `InvitationLandingHero.tsx` title in `SplitText` with luxury gold accent.
   - Use `CircularGallery` or `DecayCard` in `ResponsivePhotoGallerySection.tsx`.
   - Add `SplashCursor` to `InvitationLandingPage.tsx` with royal maroon and gold particle trail.
2. **`apps/Main`**:
   - Add `"@repo/ui-components": "*"` to `apps/Main/package.json`.
   - Enhance `EcosystemHome.tsx` hero headline with `BlurText` and `GradientWaves` ambient canvas background.
   - Wrap service cards (Booth, Invitation, Admin) with `TiltedCard`.
3. **`apps/Renderer`**:
   - Import `SplashCursor` or subtle `FadeContent` into `BoothMemoryRenderer.tsx` and `InvitationMemoryRenderer.tsx`.

### 4.2. Hover, Active, and Focus States
- **Button Micro-interactions:**
  - Primary button (`.btn-athar-primary`): `transform: translateY(-2px)`, shadow elevation from `0 4px 14px` to `0 8px 24px rgba(107, 29, 40, 0.35)`. Smooth cubic-bezier timing (`0.16, 1, 0.3, 1`) is well executed.
  - Secondary button (`.btn-athar-secondary`): border transition to `var(--athar-maroon)` with ivory background lift is consistent across Booth and Admin.
- **Form Inputs:**
  - `.athar-input` in Admin, Main, and Invitation applies `border-color: var(--athar-maroon)` and `box-shadow: 0 0 0 3px rgba(107, 29, 40, 0.12)` on `:focus`. Consistent and polished.
- **Card Hover Physics:**
  - Booth's `VoiceCard.tsx` elevates smoothly with `transform: translateY(-2px)` and gold border accentuation on hover.
  - Renderer's `BoothVoiceCard.tsx` lacks `_hover` elevation, feeling static by comparison.

### 4.3. Audio Visualizer & Player Micro-interactions
- **Waveform Scrubber:** Both `Booth/VoiceCard.tsx` and `Renderer/BoothVoiceCard.tsx` compute bar heights from `waveformPeaks` and update bar colors in real time during playback. Seeking by clicking directly on any bar is responsive and tactile.
- **Dancing Waveform Bars in Floating Audio Bar:** `FloatingAudioPlayerBar.tsx` (lines 228-240) in Invitation features a 5-bar dancing equalizer animation and spinning vinyl record disc when ambient music plays.

---

## 5. Dimension 4: File-by-File Deficit Enumeration & Recommendations

### 5.1. `apps/Admin`

#### File 1: `apps/Admin/index.html`
- **Location:** Lines 2, 8-10
- **Deficit:** `<html lang="en">` has no `dir="rtl"` attribute. `<head>` preloads only `Plus Jakarta Sans`, omitting `Amiri`, `Aref Ruqaa`, and `Cairo`.
- **Severity:** Medium
- **Recommendation:**
  Change line 2 to `<html lang="ar" dir="rtl">` or `<html lang="ar" dir="auto">`.
  Add font preconnects and Google Fonts stylesheet for Amiri, Aref Ruqaa, Cairo, and Playfair Display matching `apps/Booth/index.html`.

#### File 2: `apps/Admin/src/components/dashboard/AdminOverview.tsx`
- **Location:** Lines 77-89
- **Deficit:** Hardcoded Tailwind/Bootstrap colors (`#3B82F6` blue, `#8B5CF6` purple, `#EC4899` pink) used for concierge progression stages.
- **Severity:** High (Brand Contamination)
- **Recommendation:**
  Replace with ASAR Warm Vintage Editorial color tokens:
  ```tsx
  // Before:
  { key: "awaiting_client_assets", label: "Awaiting Client Assets", color: "#3B82F6", count: ... },
  { key: "event_scheduled", label: "Event Scheduled", color: "#8B5CF6", count: ... },
  { key: "audio_mastering", label: "Audio Mastering", color: "#EC4899", count: ... },
  
  // After:
  { key: "awaiting_client_assets", label: "Awaiting Client Assets", color: "var(--athar-gold)", count: ... },
  { key: "event_scheduled", label: "Event Scheduled", color: "var(--athar-maroon)", count: ... },
  { key: "audio_mastering", label: "Audio Mastering", color: "#944D59", count: ... }, // Muted Rosewood
  ```
- **Location:** Line 466
- **Deficit:** Missing empty state when `orders.length === 0` in Recent Orders section.
- **Severity:** Low
- **Recommendation:**
  Add branded empty state card with gold border and text: `"No event orders in the queue yet."`

#### File 3: `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`
- **Location:** Line 84
- **Deficit:** Native browser `alert()` called when rejection reason is missing:
  ```tsx
  alert("يرجى كتابة أو اختيار سبب الرفض لتوجيه العميل لإعادة الرفع بشكل صحيح.");
  ```
- **Severity:** High (UX Disruption)
- **Recommendation:**
  Replace `alert()` with state-driven error feedback banner (`setErrorBanner("يرجى كتابة أو اختيار سبب الرفض...")`) styled with `athar-badge-danger` and red glow.

---

### 5.2. `apps/Booth`

#### File 1: `apps/Booth/src/index.css`
- **Location:** Lines 3-22
- **Deficit:** Missing extended root tokens from `docs/ASAR_DESIGN_SYSTEM.md`: `--athar-maroon-deep`, `--athar-maroon-subtle`, `--athar-gold-bright`, `--athar-gold-border`, `--athar-bg-tertiary`, `--athar-noir-bg`, `--athar-noir-surface`, status tokens, and `--athar-shadow-gold`.
- **Severity:** Medium
- **Recommendation:**
  Synchronize root `:root` tokens in `apps/Booth/src/index.css` to match lines 28-80 of `docs/ASAR_DESIGN_SYSTEM.md`.

#### File 2: `apps/Booth/src/components/memory/MemoryActionBar.tsx`
- **Location:** Lines 42-46
- **Deficit:** Action bar stacks buttons vertically on mobile (`direction={{ base: "column", sm: "row" }}`), resulting in a 150px tall sticky bottom bar that collides with `AudioPlayerBar`.
- **Severity:** High (Mobile Ergonomics)
- **Recommendation:**
  Change `direction` to `direction="row"` across all breakpoints. On mobile, shorten button labels (`"Download ZIP"` and `"Share"`) and reduce padding so the bar stays under 60px height.

#### File 3: `apps/Booth/src/components/memory/GuestBookFeed.tsx`
- **Location:** Line 137
- **Deficit:** Note message `<Text>` lacks `dir="auto"`, causing bilingual/English guest notes to align right and misplace punctuation.
- **Severity:** Medium
- **Recommendation:**
  Add `dir="auto"` to `<Text fontSize="0.92rem" dir="auto" ...>{note.message}</Text>`.

---

### 5.3. `apps/Invitation`

#### File 1: `apps/Invitation/package.json`
- **Location:** Lines 15-22 (`dependencies`)
- **Deficit:** `@repo/ui-components` is missing from `dependencies`.
- **Severity:** High (Architectural Isolation)
- **Recommendation:**
  Add `"@repo/ui-components": "*"` to `dependencies` in `apps/Invitation/package.json`.

#### File 2: `apps/Invitation/index.html`
- **Location:** Lines 2, 8-10
- **Deficit:** `<html lang="en">` with no `dir="rtl"`. Missing preloads for `Amiri`, `Aref Ruqaa`, and `Cairo`.
- **Severity:** Medium
- **Recommendation:**
  Update to `<html lang="ar" dir="rtl">` and add Google Fonts link for Amiri, Aref Ruqaa, Cairo, and Playfair Display.

#### File 3: `apps/Invitation/src/components/landing/InvitationPackagesSection.tsx`
- **Location:** Lines 120-180
- **Deficit:** Static Chakra `Box` cards without `TiltedCard` or `FadeContent` animations, falling behind Booth's presentation.
- **Severity:** Medium
- **Recommendation:**
  Import `TiltedCard` and `FadeContent` from `@repo/ui-components` to wrap pricing tier cards with 3D perspective and gold reflection.

#### File 4: `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx`
- **Location:** Line 520
- **Deficit:** `<p>{wish.message}</p>` lacks `dir="auto"` attribute.
- **Severity:** Medium
- **Recommendation:**
  Add `dir="auto"` attribute to paragraph: `<p dir="auto" style={{ ... }}>{wish.message}</p>`.

---

### 5.4. `apps/Main`

#### File 1: `apps/Main/package.json`
- **Location:** Lines 15-22 (`dependencies`)
- **Deficit:** `@repo/ui-components` is missing from `dependencies`.
- **Severity:** High (Architectural Isolation)
- **Recommendation:**
  Add `"@repo/ui-components": "*"` to `dependencies` in `apps/Main/package.json`.

#### File 2: `apps/Main/index.html`
- **Location:** Lines 2, 8-10
- **Deficit:** `<html lang="en">` with no `dir="rtl"`. Missing preloads for `Amiri`, `Aref Ruqaa`, and `Cairo`.
- **Severity:** Medium
- **Recommendation:**
  Update to `<html lang="ar" dir="rtl">` and add preloads for Amiri, Aref Ruqaa, Cairo, and Playfair Display.

#### File 3: `apps/Main/src/components/home/EcosystemHome.tsx`
- **Location:** Lines 164-187
- **Deficit:** Hero headline uses plain text without `SplitText` or `BlurText` motion, and the background is a standard gradient rather than `GradientWaves`.
- **Severity:** Low
- **Recommendation:**
  Incorporate `BlurText` on main title and wrap service cards with `TiltedCard`.

---

### 5.5. `apps/Renderer`

#### File 1: `apps/Renderer/src/index.css`
- **Location:** Lines 3-23
- **Deficit:** Severely truncated token set: missing `--athar-maroon-deep`, `--athar-gold-bright`, `--athar-gold-border`, `--athar-bg-tertiary`, status colors, font variables, and Noir VIP tokens.
- **Severity:** High
- **Recommendation:**
  Replace `:root` in `apps/Renderer/src/index.css` with the full unified specification from `docs/ASAR_DESIGN_SYSTEM.md` lines 28-80.

#### File 2: `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`
- **Location:** Lines 74-128, 205-244
- **Deficit:** **Flash of 404 Bug**: while `queryRemoteCollections` is querying Appwrite asynchronously, `effectiveType` is `"unknown"`, immediately rendering `StorefrontNotFound` before remote data arrives.
- **Severity:** Critical (Core Workflow Deficit)
- **Recommendation:**
  Add `isResolving` state to `DynamicStorefrontIndex.tsx`:
  ```tsx
  const [isResolving, setIsResolving] = useState<boolean>(true);
  
  useEffect(() => {
    let isMounted = true;
    if (!subdomain) {
      setIsResolving(false);
      return;
    }
    if (synchronousType !== "unknown") {
      setIsResolving(false);
      return;
    }
    
    const queryRemoteCollections = async () => {
      setIsResolving(true);
      try {
        // Appwrite query ...
      } finally {
        if (isMounted) setIsResolving(false);
      }
    };
    queryRemoteCollections();
    return () => { isMounted = false; };
  }, [subdomain, synchronousType]);
  
  if (isResolving) {
    return <LuxuryEditorialLoadingScreen slug={subdomain} />;
  }
  ```

#### File 3: `apps/Renderer/src/components/booth/BoothMemoryRenderer.tsx`
- **Location:** Lines 377-446
- **Deficit:** Header and toolbar rely on raw inline styles (`style={{ backgroundColor: "rgba(107, 29, 40, 0.95)" }}`) with flat `borderRadius: "4px"` buttons instead of ASAR pill styling.
- **Severity:** Medium
- **Recommendation:**
  Refactor toolbar and buttons to use `.btn-athar-primary`, `.btn-athar-secondary`, and `var(--athar-radius-full)` pills.

---

## 6. Implementation Blueprint & Priority Action Plan

### Phase 1: Global Foundation & Dependency Alignment
1. Add `"@repo/ui-components": "*"` to `apps/Invitation/package.json` and `apps/Main/package.json`.
2. Synchronize `:root` CSS custom properties across `apps/Booth/src/index.css`, `apps/Invitation/src/index.css`, `apps/Main/src/index.css`, and `apps/Renderer/src/index.css` to match `docs/ASAR_DESIGN_SYSTEM.md`.
3. Standardize `index.html` across all apps: set `lang="ar" dir="rtl"` and preload Amiri, Aref Ruqaa, Cairo, and Playfair Display.

### Phase 2: Critical UX Fixes & Anti-Flicker
1. **Fix Flash of 404 in `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`**: Add `isResolving` state and render an editorial loading card with pulsing gold monogram while Appwrite remote resolution is in flight.
2. **Eliminate Browser `alert()` in `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`**: Replace with an inline luxury error banner.
3. **Resolve Mobile Action Bar Stacking in `apps/Booth/src/components/memory/MemoryActionBar.tsx`**: Ensure horizontal button layout on mobile to prevent viewport collision with `AudioPlayerBar`.
4. **Apply `dir="auto"` to All UGC**: Update `GuestBookFeed.tsx`, `InteractiveWishingWallSection.tsx`, and `BoothVoiceCard.tsx`.

### Phase 3: Palette Sanitation & Skeleton States
1. Replace generic Tailwind blue (`#3B82F6`), purple (`#8B5CF6`), and pink (`#EC4899`) in `AdminOverview.tsx` with ASAR gold, burgundy, and rosewood.
2. Build a shared `EditorialSkeleton` component or CSS shimmer utility class for table rows, order cards, and memory waveforms.

### Phase 4: Rich Micro-Interactions & Shaders
1. Enrich `apps/Invitation/src/components/landing/InvitationPackagesSection.tsx` with `TiltedCard` and `FadeContent` from `@repo/ui-components`.
2. Add `SplashCursor` to `apps/Invitation` and `apps/Renderer`.
3. Unify class name aliases (`.card-luxury` ↔ `.athar-card` ↔ `.luxury-card`).

---
*End of UI/UX Audit Report — Generated by explorer_survey_ui*
