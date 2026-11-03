# ASAR Specification Mining & Codebase Survey Report: Agents 07, 08, 09, 10

**Prepared by:** `spec_miner_survey_3`  
**Date:** 2026-11-03  
**Target Domain:**
1. **Agent 07:** Invitation Landing & Booking (`apps/Invitation`)
2. **Agent 08:** Invitation Custom Renderer & QR Pass (`apps/Invitation`)
3. **Agent 09:** Client Portal Orders & Assets (`apps/Main`)
4. **Agent 10:** Client Invitation Mailbox & EmailJS (`apps/Main`)
5. **Foundations:** `docs/ASAR_PROJECT_ARCHITECTURE.md`, `docs/ASAR_DESIGN_SYSTEM.md`, `packages/react-appwrite`

---

## 1. Executive Summary & Scope

This report establishes the complete specification baseline and gap analysis for the **Invitation Service (`apps/Invitation`)** and the **Client Portal & RSVP Mailbox (`apps/Main`)** within the ASAR monorepo.

ASAR is a luxury event memory and digital hospitality platform built around two flagship services:
1. **ASAR Booth:** Audio telephone guestbook with bulk audio mastering.
2. **ASAR Invitation:** Bespoke interactive event websites (Weddings, Festivals, Galas, Summits, Graduations) with dynamic guest data collection, VIP capacity tracking, and automated QR pass delivery via EmailJS.

The system is coordinated through strict parallel boundaries across 10 specialized agents. Agents 07 and 08 build the public and guest-facing experience in `apps/Invitation` (Port `3003`). Agents 09 and 10 build the client account operations, order tracking, asset concierge, and RSVP mailbox in `apps/Main` (Port `3000`).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Agent 07 (Landing) | `InvitationHeader` | Frosted sticky header with brand monogram, navigation links, Live Demo trigger, and Booking Wizard CTA | User click, scroll position | Navigation scroll or modal state toggle (`onPreviewEvent`) | Graceful fallback if `onPreviewEvent` undefined | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.1 |
| 2 | Agent 07 (Landing) | `InvitationHero` | Fullscreen editorial luxury hero utilizing `@repo/ui-components` (`GradientWaves`, `BlurText`, `SplitText`, `FadeContent`, `Magnet`) with value proposition | Viewport render, scroll trigger | Animated Arabic typography and WebGL interactive waves | Degrades to CSS gradient if WebGL unsupported | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.1, `ASAR_DESIGN_SYSTEM.md` |
| 3 | Agent 07 (Landing) | `OccasionsShowcaseSection` | 4 signature occasion cards (Royal Weddings, Cultural Festivals, VIP Galas, Graduations) with one-click preview buttons | Card click / hover | Calls `onPreviewEvent?.(presetSlug)` | Validates preset slugs (`"omar-and-layla"`, `"cairo-jazz-festival"`, `"asar-leadership-gala"`) | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.1 |
| 4 | Agent 07 (Landing) | `FeaturesAndMailboxSection` | Visual 4-step explanation of custom form fields, Client Mailbox, 1-click Approve/Decline, and automated EmailJS QR delivery | Static display + interactive step pills | Rendered timeline explaining ASAR architecture | None (pure UI) | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.1 |
| 5 | Agent 07 (Landing) | `InvitationPackagesSection` | Fetches active invitation packages from Appwrite / localStorage / defaults; displays Tier 1 (Classic 2,500 EGP) and Tier 2 (Royal VIP 4,500 EGP) | Appwrite `plans` collection query or `DEFAULT_INVITATION_PLANS` | Package cards with dynamic feature bullets, prices, and booking CTA | Fallback to hardcoded seed defaults if network or Appwrite unavailable | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.1 |
| 6 | Agent 07 (Booking) | `InvitationBookingModal` | 4-step interactive wizard: (1) Event & Host Info, (2) Plan & Requested Form Fields, (3) Screenshot Upload, (4) Order Confirmation | Form fields, plan selection, requested fields selection, screenshot file | Order & Payment records in Appwrite + localStorage cache; Order ID display | Step-by-step validation (email format, maxVenueCapacity > 0, receipt upload) | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.2 |
| 7 | Agent 07 (Booking) | Requested RSVP Fields Selector | Interactive checklist in booking wizard where client specifies questions guests must answer, with locked mandatory Name & Email | Selection checkboxes, custom text field inputs | Stored in `clientSubmittedAssetsJson.requestedRsvpFields` | Name and Email cannot be unchecked | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.2, `ASAR_PROJECT_ARCHITECTURE.md` § 5.2 |
| 8 | Agent 07 (Booking) | Manual Payment Receipt Upload | Drag-and-drop screenshot uploader during booking flow targeting `payment_receipts` storage bucket | Image file (`.png`, `.jpg`, `.jpeg`, `.webp`) | Uploads via `useUpload()`, returns `screenshotFileId`, updates payment record | Rejects non-image files, handles upload progress and failures | `AGENT_07_INVITATION_LANDING_AND_BOOKING.md` § 2.2, `ASAR_PROJECT_ARCHITECTURE.md` § 4.2 |
| 9 | Agent 08 (Routing) | Tri-View Router & Reviewer Pill | Master controller in `apps/Invitation/src/App.tsx` routing between Landing (`/`), Custom Event (`/e/:slug`), and QR Pass (`/pass/:rsvpId`) | URL params, hash, or local state switcher | Active view component rendering | Fallback to Landing if slug or rsvpId missing | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 1, § 2 |
| 10 | Agent 08 (Renderer) | `CustomEventPage` & `ThemeWrapper` | Loads invitation document by slug; dynamically injects `themeConfigJson` (colors, fonts, RTL/LTR, WebGL shaders) | `slug` string, Appwrite `invitations` collection or local cache | Bespoke event page matching occasion | Shows elegant 404/Empty State if invitation not found | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 2.1 |
| 11 | Agent 08 (Renderer) | Modular Block Stack | Renders ordered sequence from `sectionsConfigJson`: `HeroBlock`, `CountdownBlock`, `StoryTimelineBlock`, `GalleryBlock`, `VenueMapAndDressCodeBlock`, `DynamicRsvpFormBlock` | Block array with props and configurations | Responsive section layout | Gracefully skips unknown or corrupted block types | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 2.1, `ASAR_PROJECT_ARCHITECTURE.md` § 5.1 |
| 12 | Agent 08 (Renderer) | `DynamicRsvpFormBlock` | Dynamically parses `formSchemaJson` and renders inputs (`text`, `email`, `tel`, `number`, `select`, `radio`, `checkbox`, `textarea`) | Guest user inputs | Submits document to `invitation_rsvps` with `status: "pending"` | Strict validation: `guestName` and `guestEmail` are hard-locked as required | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 2.2 |
| 13 | Agent 08 (QR Pass) | `GuestQrPassCard` | Luxury digital pass (`/pass/:rsvpId`) styled like embossed VIP ticket (`TiltedCard`, gold border) with event details and QR code | `rsvpId`, query token, Appwrite `invitation_rsvps` | Scannable QR code, seat count, pass verification status | Displays warning if pass is pending or declined | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 2.3 |
| 14 | Agent 08 (Check-in) | `VenueQrScanner` | Simulated host/security scanner (`/scanner/:invitationId`) verifying guest QR pass token and updating check-in timestamp | QR token input or simulation button | Validates RSVP, marks `isCheckedInAtVenue: true`, updates `checkedInAt` | Rejects invalid tokens, alerts on duplicate check-in | `AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md` § 2.3 |
| 15 | Agent 09 (Main Hub) | `BrandGatewayHome` | Unified ecosystem portal showcasing Athar Booth (`:3002`), Athar Invitation (`:3003`), and Admin Studio (`:3001`) with luxury aesthetic | App switching links, user navigation | Editorial gateway cards with live port links | None | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.1 |
| 16 | Agent 09 (Auth) | `ClientAuthModal` | Appwrite authentication modal supporting Email/Password login, registration, and 1-click Demo Client login | Email, password, or 1-click demo button | Authenticated session in `useAuth()` | Shows bilingual validation error on bad credentials | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.1 |
| 17 | Agent 09 (Portal) | `ClientAccountShell` | Unified client account dashboard managing navigation tabs: Orders (`orders`), Assets (`assets`), QR Hub (`qr_hub`), and Mailbox (`mailbox`) | Active tab state, active order/invitation selection | Rendered child view with contextual header | Redirects unauthenticated users to login or demo mode | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.2 |
| 18 | Agent 09 (Tracking) | `OrderPipelineTracker` | 7-stage concierge timeline (`pending_payment`, `payment_rejected`, `awaiting_client_assets`, `event_scheduled`, `audio_mastering`, `studio_curation`, `published`) | Order document status, stage switcher toolbar | Illuminated visual progress timeline with stage explanations | Handles conditional `payment_rejected` branch | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.2 |
| 19 | Agent 09 (Payment) | `PaymentReceiptUploader` | Displays current payment receipt status, amount, method, and allows re-uploading new screenshot if rejected | Screenshot file, rejection note from Admin | Uploads to `payment_receipts`, resets order to `pending_payment` | Disallows re-upload when already approved | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.3 |
| 20 | Agent 09 (Assets) | `BoothClientAssetsForm` | Unlocked at `awaiting_client_assets`; client inputs Hero photo, couple names, date, location, quote, thank you note, categories | Text fields, photo file (`client_raw_assets` bucket) | Updates `clientSubmittedAssetsJson` on Order document | Validates mandatory hero image and couple names | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.4 |
| 21 | Agent 09 (QR Hub) | `ClientQrCodeHub` | Hub displaying client's high-res landing page QR code, downloadable PNG, print-ready table card, and direct URL | Order / Invitation slug | Rendered QR card, print trigger, download trigger | Fallback QR rendering via external service if Appwrite offline | `AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md` § 2.5 |
| 22 | Agent 10 (Mailbox) | `ClientRsvpMailbox` | Real-time guest RSVP inbox with filters (`All`, `Pending`, `Approved`, `Declined`), live counts, and search | Filter selection, search query, Appwrite `invitation_rsvps` | Split-view guest list + inspector pane | Realtime subscription with fallback to local cache | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.1 |
| 23 | Agent 10 (Capacity) | `CapacityMeterBar` | Visual seat capacity tracker comparing Approved seats + companions against `maxCapacity`, with color-coded warning thresholds | Confirmed guest counts, companion totals, `maxCapacity` | Progress bar (<80% green, 80-99% amber, 100%+ maroon alert) | Alerts host when capacity is reached or exceeded | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.2 |
| 24 | Agent 10 (Inspector) | `RsvpSubmissionInspector` | Detailed view of selected guest submission displaying identity, verified email, and parsed dynamic custom responses | Selected RSVP record | Rendered grid of custom answers + Approve/Decline action buttons | Handles missing or malformed custom JSON gracefully | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.3 |
| 25 | Agent 10 (Decision) | Host Approve Action | Generates `passToken`, constructs QR pass URL, updates RSVP to `approved`, and dispatches EmailJS approval email | Click "Approve & Send QR" | Updated RSVP document, sent EmailJS payload, displayed QR preview | Catches EmailJS errors, falls back to simulated email preview | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.3 |
| 26 | Agent 10 (Decision) | Host Decline Action | Updates RSVP to `declined` and dispatches dignified capacity limit apology email via EmailJS | Click "Decline (Capacity)" | Updated RSVP document, sent EmailJS payload, displayed apology preview | Catches EmailJS errors, falls back to simulated email preview | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.3 |
| 27 | Agent 10 (EmailJS) | `EmailPreviewAndConfigModal` | Modal to inspect sent/preview HTML emails for Approved/Declined states, and configure custom EmailJS API keys | Form inputs (Service ID, Template IDs, Public Key) | Saved config in localStorage, live email previews | Validates EmailJS key formats | `AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md` § 2.4 |

---

## 3. Edge Cases & Handling

| # | Feature | Input / Condition | Observed & Specified Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | `DynamicRsvpFormBlock` | Guest attempts to submit form without email or with invalid email format | Submission is blocked immediately; form marks `guestEmail` field with red focus and displays: *"البريد الإلكتروني مطلوب لاستلام كود الدخول QR"* |
| 2 | `DynamicRsvpFormBlock` | Guest submits with 0 companions or empty optional fields | Validates successfully; `companionsCount` defaults to `0`; optional fields omitted or stored as empty strings in `dynamicResponsesJson` |
| 3 | `DynamicRsvpFormBlock` | Appwrite Cloud instance is offline or unreachable | Submission falls back to `localStorage` (`"asar_invitation_rsvps_cache"`) and displays confirmation toast so UX remains uninterrupted during development/demos |
| 4 | `CapacityMeterBar` | Approved guests + companions exceeds `maxCapacity` (e.g. 152 / 150) | Progress bar turns Royal Maroon (`#6B1D28`), shows "101% - السعة مكتملة بالكامل", and prompts host to decline further pending requests |
| 5 | `RsvpSubmissionInspector` | Host clicks Approve when EmailJS API keys are missing from `.env` | `sendRsvpDecisionEmail` intercepts missing keys, logs formatted payload, and returns `{ simulated: true, success: true }`. Inspector displays rich green banner: *"تمت محاكاة إرسال البريد الإلكتروني بنجاح (وضع العرض التجريبي)"* with full preview |
| 6 | `PaymentReceiptUploader` | Payment was rejected by Admin (`orderStatus === "payment_rejected"`) | Displays clear alert box with `rejectionReason` and renders drag-and-drop replacement uploader. Uploading new screenshot updates payment record and sets `orderStatus = "pending_payment"` |
| 7 | `BoothClientAssetsForm` | Client visits tab while `orderStatus === "pending_payment"` | Tab is locked with informational banner: *"هذه الخطوة تفتح تلقائياً بعد اعتماد إيصال الدفع من الإدارة"* |
| 8 | `CustomEventPage` | Invalid or nonexistent invitation slug provided in URL (e.g. `/e/random-xyz`) | Renders luxury editorial 404 card: *"هذه الدعوة غير متوفرة أو تم نقلها"*, with button to return to Invitation Showcase |
| 9 | `GuestQrPassCard` | Visitor opens `/pass/:rsvpId` with invalid or missing `token` | Displays security warning: *"رمز التحقق غير صالح أو غير مكتمل"* and prevents check-in verification |
| 10 | `VenueQrScanner` | Guard scans an already checked-in QR pass | Scanner identifies duplicate check-in: *"تنبيه: تم تسجيل دخول هذا الضيف مسبقاً في: [وقت التسجيل]"* |
| 11 | `OrderPipelineTracker` | Fast review testing via Demo Switcher | Selecting any of the 7 stages dynamically updates the entire client UI without modifying backend data |

---

## 4. Deep Specification Analysis by Agent

### 4.1. Agent 07 — Invitation Landing Page, Plan Selector & Booking Modal (`apps/Invitation`)
- **Visual Direction:** Warm Vintage Editorial Luxury (`#FBF7F2` Alabaster, `#6B1D28` Maroon, `#D4AF37` Gold hairlines). Full Arabic RTL layout.
- **Header (`InvitationHeader.tsx`):**
  - Frosted glass effect with `backdropFilter="blur(16px)"`.
  - Athar monogram brand logo.
  - Links: `المناسبات`, `مميزات النظام`, `صندوق الردود و QR`, `الباقات`, `معاينة حية`.
  - Buttons: "معاينة دعوة حية" (`onPreviewEvent?.("omar-and-layla")`) and "اطلب موقع دعوتك الآن" (triggers booking modal).
- **Hero (`InvitationHero.tsx`):**
  - Integrated `@repo/ui-components`: `GradientWaves` in background (`horizonColor="#FBF7F2"`, `waveColor="#8A2E3B"`, `crestColor="#F7EFE6"`), `BlurText` / `SplitText` for title.
  - Headline: *"دعوتك ليست مجرد بطاقة... بل موقع تفاعلي يخلّد مناسبتك."*
  - CTA button wrapped in `Magnet`.
- **Occasions Showcase (`OccasionsShowcaseSection.tsx`):**
  - 4 occasion cards: Royal Weddings, Festivals & Cultural Events, Galas & Summits, Graduations.
  - Each card has rich descriptions, visual badges, and preview buttons.
- **Features & Mailbox (`FeaturesAndMailboxSection.tsx`):**
  - Visual 4-step explanation of:
    1. Custom Form Fields
    2. Real-time Account Mailbox
    3. 1-Click Decision
    4. Automated EmailJS QR pass delivery.
- **Package Pricing (`InvitationPackagesSection.tsx`):**
  - Queries `plans` collection (`serviceType == "invitation"`).
  - Tier 1: باقة دعوة أثر الكلاسيكية (2,500 EGP) - up to 150 RSVPs.
  - Tier 2: باقة أثر الملكية للمناسبات الكبرى VIP (4,500 EGP) - unlimited RSVPs, VIP scanner, custom sections.
- **Booking Flow (`InvitationBookingModal.tsx`):**
  - 4-step modal wizard:
    - Step 1: Host & Event Details (Name, Partner/Org, Email, Phone, Occasion Type, Date, Venue, Max Capacity).
    - Step 2: Plan selection + dynamic requested form fields checklist (locks Name & Email).
    - Step 3: Manual payment transfer details + screenshot upload to `payment_receipts` bucket via `useUpload()`.
    - Step 4: Order Confirmation with direct link to Client Account Portal (`http://localhost:3000/account`).

### 4.2. Agent 08 — Custom Invitation Renderer, Dynamic RSVP & QR Pass (`apps/Invitation`)
- **View Controller (`App.tsx`):**
  - Manages navigation state across 3 modes:
    1. `landing`: `<InvitationLandingPage />`
    2. `event`: `<CustomEventPage slug={slug} />`
    3. `pass`: `<GuestPassPage rsvpId={rsvpId} />`
  - Floating switcher pill in bottom-left for immediate reviewer demonstration.
- **Theme Engine (`ThemeWrapper.tsx`):**
  - Injects `themeConfigJson` tokens dynamically: background color, primary accent, font family (`Amiri`, `Playfair Display`, `Cairo`), and WebGL effects.
- **Section Block Engine (`CustomEventPage.tsx`):**
  - Iterates over `sectionsConfigJson` and renders:
    1. `HeroBlock`: Event cover, animated title, date/time/venue pills, scroll CTA.
    2. `CountdownBlock`: Live ticking countdown timer.
    3. `StoryTimelineBlock`: Chronological story or event schedule.
    4. `GalleryBlock`: Interactive photo showcase.
    5. `VenueMapAndDressCodeBlock`: Venue details, map link, dress code swatches.
    6. `DynamicRsvpFormBlock`: Custom dynamic form.
- **Dynamic RSVP Form (`DynamicRsvpFormBlock.tsx`):**
  - Validates `guestName` and `guestEmail` strictly.
  - Submits document to Appwrite `invitation_rsvps` with `status: "pending"`.
  - Shows success confirmation card explaining the Client Mailbox and EmailJS workflow.
- **Digital QR Pass (`GuestQrPassCard.tsx`):**
  - VIP pass ticket design using `TiltedCard` 3D tilt.
  - Displays guest name, approved seat count, event details, and scannable QR code (`buildQrCodeImageUrl`).
- **Venue Scanner (`VenueQrScanner.tsx`):**
  - Host/security check-in simulation verifying token and updating check-in timestamp.

### 4.3. Agent 09 — Client Portal Orders & Assets (`apps/Main`)
- **Brand Gateway (`BrandGatewayHome.tsx`):**
  - Luxury editorial hub showcasing Booth (`:3002`), Invitation (`:3003`), and Admin (`:3001`).
  - Top navigation linking to Account & Orders and Invitation Mailbox.
- **Authentication (`ClientAuthModal.tsx`):**
  - Email/Password login/registration + 1-click Demo Client login button.
- **Account Shell (`ClientAccountShell.tsx`):**
  - Account sidebar navigation tabs:
    - `orders`: 7-Stage Order Tracker
    - `assets`: Memory Asset Submission Box
    - `qr_hub`: Client QR Code Hub
    - `mailbox`: Client Invitation RSVP Mailbox (renders Agent 10's `ClientRsvpMailbox`)
- **7-Stage Order Tracker (`OrderPipelineTracker.tsx`):**
  - Stages:
    1. `pending_payment`
    2. `payment_rejected` (conditional)
    3. `awaiting_client_assets`
    4. `event_scheduled`
    5. `audio_mastering`
    6. `studio_curation`
    7. `published`
  - Includes interactive Demo Stage Switcher toolbar for rapid evaluation.
- **Payment Receipt Uploader (`PaymentReceiptUploader.tsx`):**
  - Displays screenshot thumbnail, method, status.
  - If rejected, displays admin note and drag-and-drop replacement upload.
- **Memory Asset Submission Box (`BoothClientAssetsForm.tsx`):**
  - Unlocked at `awaiting_client_assets`.
  - Client uploads hero cover photo, couple names, date, location, quote, thank you message, categories.
  - Saves to `clientSubmittedAssetsJson` on Order in Appwrite.
- **Client QR Hub (`ClientQrCodeHub.tsx`):**
  - High-res landing page QR code display, PNG download, print-ready table card download.

### 4.4. Agent 10 — Client Invitation Mailbox & EmailJS (`apps/Main`)
- **Real-Time Mailbox (`ClientRsvpMailbox.tsx`):**
  - Real-time subscription to `invitation_rsvps` collection.
  - Filter tabs: `الكل`, `⏳ قيد المراجعة`, `✓ مقبول`, `✕ اعتذار السعة`.
  - Search by Name, Email, or Phone.
  - Action buttons for EmailJS modal and CSV export.
- **Capacity Meter (`CapacityMeterBar.tsx`):**
  - Confirmed Seats vs `maxCapacity`.
  - Color-coded progress bar with alerts when capacity is reached.
- **Submission Inspector (`RsvpSubmissionInspector.tsx`):**
  - Split-view right pane for selected submission.
  - Guest identity, verified email badge, and full dynamic response values.
  - Approve Button:
    - Generates `passToken`.
    - Updates RSVP status to `approved`, sets `passToken`, `qrCodeUrl`, `emailSent = true`.
    - Dispatches EmailJS approval email with embedded QR code.
  - Decline Button:
    - Updates RSVP status to `declined`, sets `emailSent = true`.
    - Dispatches EmailJS venue capacity apology email.
- **EmailJS Config & Previewer (`EmailPreviewAndConfigModal.tsx`):**
  - View sent/simulated HTML email for both states.
  - Configure or test custom EmailJS credentials.

---

## 5. Strict File Boundaries & Permissions Matrix

| App / Workspace | File Path | Owned By | Permissions for Other Agents |
|---|---|---|---|
| `apps/Invitation` | `src/components/landing/*` (7 files) | **Agent 07** | Read-Only |
| `apps/Invitation` | `src/pages/InvitationLandingPage.tsx` | **Agent 07** | Read-Only |
| `apps/Invitation` | `src/index.css` | **Agent 08** | Read-Only |
| `apps/Invitation` | `src/App.tsx` | **Agent 08** | Read-Only |
| `apps/Invitation` | `src/components/renderer/*` (7 files) | **Agent 08** | Read-Only |
| `apps/Invitation` | `src/components/pass/*` (2 files) | **Agent 08** | Read-Only |
| `apps/Invitation` | `src/pages/CustomEventPage.tsx` | **Agent 08** | Read-Only |
| `apps/Invitation` | `src/pages/GuestPassPage.tsx` | **Agent 08** | Read-Only |
| `apps/Main` | `src/index.css` | **Agent 09** | Read-Only |
| `apps/Main` | `src/App.tsx` | **Agent 09** | Read-Only |
| `apps/Main` | `src/components/home/BrandGatewayHome.tsx` | **Agent 09** | Read-Only |
| `apps/Main` | `src/components/auth/ClientAuthModal.tsx` | **Agent 09** | Read-Only |
| `apps/Main` | `src/components/account/*` (5 files) | **Agent 09** | Read-Only |
| `apps/Main` | `src/components/mailbox/*` (5 files) | **Agent 10** | Read-Only |
| `packages/react-appwrite` | `src/AsarDomain/*` | **Agent 01** | Read-Only (Consumer) |
| Monorepo Root | `package.json`, `turbo.json` | Orchestrator | Read-Only |

---

## 6. Existing Codebase Audit & Delta Analysis

### 6.1. `apps/Invitation` Audit
- **Current State:**
  - `src/App.tsx` is an early static single-card placeholder ("Asar Privé").
  - `src/index.css` uses generic dark purple variables (`--bg-primary: #0a0a0f`) instead of ASAR Design System tokens.
  - Zero landing components exist.
  - Zero renderer components exist.
  - Zero pass/scanner components exist.
- **Delta:** All 8 files for Agent 07 and all 13 files for Agent 08 must be constructed from scratch.
- **Dependency Note:** `package.json` has `@chakra-ui/react: ^3.32.0`, `@emotion/react`, `@repo/react-appwrite`, `appwrite`. Root `node_modules` provides `@repo/ui-components`, but if needed, components can import directly from `@repo/ui-components` or use internal Chakra primitives.

### 6.2. `apps/Main` Audit
- **Current State:**
  - `src/App.tsx` is a developer port-listing dashboard.
  - `src/index.css` has generic slate blue styles (`--accent-blue: #38bdf8`).
  - Zero home, auth, account, or mailbox components exist.
- **Delta:** All 9 files for Agent 09 and all 5 files for Agent 10 must be constructed from scratch.

### 6.3. `packages/react-appwrite` Audit
- **Current State:**
  - Base SDK hooks (`useAppwrite`, `useCollection`, `useDocument`, `useMutations`, `useUpload`, `useAuth`, `useAvatars`) are 100% complete and verified.
  - `AsarDomain` module (collection constants, models, order pipeline metadata, audio analyzer, EmailJS service) is being created by Agent 01.
- **Integration Readiness:**
  - Agents 07–10 can import shared constants and types from `@repo/react-appwrite` once Agent 01 exports them, or utilize safe internal fallbacks / demo seed data to guarantee zero runtime failures even in isolation.

---

## 7. Unit Test Requirements Specification

To satisfy acceptance criteria R4, R5, and Objective Verification without requiring a live Appwrite instance:

### 7.1. Dynamic Form Validation (`DynamicRsvpFormBlock.tsx` / `AsarDomain`)
1. **Mandatory Email Enforcement:** Test that submitting with missing, null, or whitespace-only email throws/blocks submission with an error.
2. **Email Format Regex:** Test standard valid (`user@domain.com`, `user.name+tag@sub.domain.org`) vs invalid (`user@`, `@domain.com`, `plainaddress`) inputs.
3. **Mandatory Name Enforcement:** Test that empty `guestName` is rejected.
4. **Companions Count Bounds:** Test negative numbers are normalized to 0; positive numbers are preserved.
5. **Dynamic Field Type Mapping:** Verify correct serialization of select options, textareas, checkboxes into `dynamicResponsesJson`.

### 7.2. QR Pass Data Encoding & Token Construction
1. **Pass Token Format:** Verify cryptographic token generation matches format `INV-PASS-[A-Z0-9]{4,8}`.
2. **URL Construction:** Verify generated pass link matches `http://localhost:3003?pass=${rsvpId}&token=${passToken}`.
3. **QR Image URL Construction:** Test `buildQrCodeImageUrl(url, size)`:
   - Returns Appwrite Avatars QR endpoint when endpoint and project configured.
   - Falls back to public QR SVG/PNG endpoint with maroon/gold brand colors when Appwrite offline.
4. **Check-in Verification Logic:** Test that venue scanner correctly compares scan token against stored `passToken` and flags duplicate check-ins.

### 7.3. EmailJS Template Payload Construction
1. **Approved Payload Structure:** Verify that `sendRsvpDecisionEmail({ decision: "approved", ... })` packages:
   - `to_name`, `to_email`, `event_title`, `event_date`, `venue_name`, `qr_code_url`, `pass_link`.
2. **Declined Payload Structure:** Verify that `sendRsvpDecisionEmail({ decision: "declined", ... })` packages:
   - `to_name`, `to_email`, `event_title`, and the polite venue capacity constraint text.
3. **Simulated Fallback Mode:** Verify that if EmailJS environment variables are absent, the service logs cleanly and returns `{ simulated: true, success: true, ... }` without rejecting the Promise.

### 7.4. Order Pipeline State Transitions
1. **Linear Transitions:** Verify progression `pending_payment` -> `awaiting_client_assets` -> `event_scheduled` -> `audio_mastering` -> `studio_curation` -> `published`.
2. **Rejection & Re-upload:** Verify `pending_payment` -> `payment_rejected` -> `pending_payment` on re-upload.
3. **Progress Calculation:** Verify `getOrderStageProgress` returns correct step index and percentage for each status.

---

## 8. Verification & Next Steps

All specifications, contracts, and code boundaries for Agents 07, 08, 09, and 10 have been probed and documented. The implementation agents can execute with zero file collision and complete architectural fidelity.
