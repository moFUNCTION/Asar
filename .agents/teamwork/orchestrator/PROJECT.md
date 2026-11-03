# Project: ASAR Monorepo Parallel Execution (Agents 01 - 10)

## Architecture
ASAR is a luxury event audio and digital invitation platform engineered as a Turborepo monorepo:
- `packages/react-appwrite`: Shared domain models, Appwrite collection/bucket constants, 7-stage order pipeline state machines, Web Audio analyzer, and EmailJS dispatch service.
- `apps/Booth`: Audio guestbook experience, dynamic plans selection, booking wizard with manual receipt upload, and luxury Booth Memory page with 48-peak audio playback matching Visual Reference #1 (*Mina & Maryam*).
- `apps/Admin`: Luxury management console, dynamic plans builder, order queue pipeline with receipt verification, split-screen bulk voice record studio with smart filename parsing, and invitation dynamic form builder.
- `apps/Invitation`: Digital invitation showcase landing, dynamic booking flow, custom invitation event page renderer with dynamic RSVP form submission, and digital QR guest pass.
- `apps/Main`: Client platform gateway, authentication, client portal 7-stage order tracker, raw assets upload manager, real-time RSVP mailbox, and automated EmailJS notification dispatcher.
- `packages/UI-components`: 21 Awwwards-grade luxury UI components (`GradientWaves`, `BlurText`, `SplitText`, `TiltedCard`, etc.).

### Cross-Cutting Design System Tokens
- `--athar-maroon`: `#6B1D28` (Royal Maroon)
- `--athar-gold`: `#D4AF37` (Egyptian Gold)
- `--athar-bg-primary`: `#FBF7F2` (Warm Alabaster)
- `--athar-text-title`: `#231F20` (Deep Bronze/Black)
- Chakra UI v3 primitives (`Box`, `Flex`, `HStack`, `VStack`, `Button`, `Badge`, `Text`) with zero deprecated v2 controls.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Appwrite Collection & Bucket Constants | Typed constants for 8 collections and 5 storage buckets | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 2 | Shared Domain Models & Types | Complete TypeScript interfaces for plans, orders, payments, memories, records, invitations, RSVPs | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 3 | Order Pipeline State Machine | 7-stage transitions (`draft` -> `submitted` -> `under_review` -> `paid_confirmed` -> `assets_uploaded` -> `processing` -> `delivered`), transition rules & helpers | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 4 | Web Audio Analyzer & Waveform Generator | Audio buffer duration calculation, 48-peak normalized waveform extraction, offline simulation fallback | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 5 | EmailJS Notification Dispatcher | Direct REST dispatcher for RSVP approval/decline notifications with simulation fallback | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 6 | Seed Defaults & Safe JSON Parsers | Typed fallback datasets (`DEFAULT_BOOTH_PLANS`, `DEMO_BOOTH_MEMORY`, `DEMO_INVITATION`) and error-tolerant JSON parser | M1 (Agent 01) | AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md |
| 7 | Booth Dynamic Plans & Booking Hook | `useBoothBooking` hook fetching active plans from Appwrite with offline fallback | M2 (Agent 02) | AGENT_02_BOOTH_DYNAMIC_PLANS_AND_BOOKING.md |
| 8 | Booth Package & Add-ons Selection UI | Integrated dynamic plan selection and interactive add-ons in `PackagesSection.tsx` & `AddonsSection.tsx` | M2 (Agent 02) | AGENT_02_BOOTH_DYNAMIC_PLANS_AND_BOOKING.md |
| 9 | Booth Booking Modal & Receipt Upload | Multi-step booking wizard with customer details, plan summary, payment instruction, and receipt upload | M2 (Agent 02) | AGENT_02_BOOTH_DYNAMIC_PLANS_AND_BOOKING.md |
| 10 | Booth Memory Sticky Header & Event Hero | Private memory presentation header with padlock, couple sunset portrait, and romantic quote | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 11 | Booth Memory 5-Tab Navigation System | Tabs for Audio Messages, Photos, Video Highlights, Guest Book, and Thank You note | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 12 | Booth Memory Audio Player & Waveforms | Category filter pills, audio cards with 48-bar synchronized waveforms, play/pause, time tracker | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 13 | Booth Memory Media, Highlights & Guest Book | Video highlight preview card, photo gallery grid, and guest book leave-love feed | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 14 | Booth Memory Action Bar & Modals | Sticky bottom bar for "Download All Messages" and "Share Love" with interactive modals | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 15 | Booth Memory Route & Slug Resolver | Routing in `apps/Booth/src/App.tsx` handling `/memory/:slug` and `?memory=:slug` with fallback | M2 (Agent 03) | AGENT_03_BOOTH_MEMORY_PAGE.md |
| 16 | Admin Shell Layout & Design System | Luxury dark/alabaster navigation sidebar, header, active tab state, and global tokens | M3 (Agent 04) | AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md |
| 17 | Admin Overview KPI Dashboard | High-level metrics for revenue, active orders, booth memories, and pending payments | M3 (Agent 04) | AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md |
| 18 | Dynamic Plans Studio CRUD | Plan builder for creating, editing, and toggling booth & invitation tiers, features, and pricing | M3 (Agent 04) | AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md |
| 19 | Orders Pipeline Queue Manager | 7-stage order status filter, search, quick status advancement, and detail inspection | M3 (Agent 04) | AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md |
| 20 | Payment Receipt Inspector Modal | Modal displaying uploaded payment receipt, order details, and Approve/Reject buttons | M3 (Agent 04) | AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md |
| 21 | Booth Memory Studio Split-Screen Layout | Two-column desktop studio with configuration forms on left and live preview on right | M3 (Agent 05) | AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md |
| 22 | Smart Filename Parser & Batch Uploader | Automatic extraction of guest name, relation, and clip ID from uploaded audio filenames | M3 (Agent 05) | AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md |
| 23 | Voice Batch Grid Editor & Waveform | Batch metadata editing (guest, relation, favorite toggle) with audio playback and waveform | M3 (Agent 05) | AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md |
| 24 | Booth Memory Live iPhone Mockup Preview | Interactive mobile viewport mockup updating instantly with studio changes | M3 (Agent 05) | AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md |
| 25 | Invitation Theme & Dynamic Form Builder | Invitation studio with theme customization, section block toggles, and dynamic form schema builder | M3 (Agent 06) | AGENT_06_ADMIN_INVITATION_AND_FORM_BUILDER.md |
| 26 | Invitation Landing Page & Dynamic Packages | Showcase landing page with luxury hero, dynamic package cards, and add-on selector | M4 (Agent 07) | AGENT_07_INVITATION_LANDING_AND_BOOKING.md |
| 27 | Invitation Booking Wizard & Payment Upload | Multi-step booking modal with event details, package selection, and manual payment receipt upload | M4 (Agent 07) | AGENT_07_INVITATION_LANDING_AND_BOOKING.md |
| 28 | Invitation Dynamic Event Page Renderer | Custom event page renderer supporting luxury hero, countdown, schedule, location map, and gallery | M4 (Agent 08) | AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md |
| 29 | Dynamic RSVP Form Submissions | Dynamic schema-driven RSVP form with locked mandatory guestEmail, validation, and Appwrite submission | M4 (Agent 08) | AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md |
| 30 | Digital Guest QR Access Pass | Generated digital QR pass card with guest details, event pass QR code, and download/share actions | M4 (Agent 08) | AGENT_08_INVITATION_CUSTOM_RENDERER_AND_QR_PASS.md |
| 31 | Client Portal Gateway & Authentication | Monorepo navigation landing, user login/registration modal, and session management | M5 (Agent 09) | AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md |
| 32 | Client Portal 7-Stage Order Tracker | Visual stepper showing order progression from draft to delivered with status descriptions | M5 (Agent 09) | AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md |
| 33 | Client Portal Raw Assets Box Upload & Audio | Raw media files uploader with progress tracking, file listing, and mastered audio review player | M5 (Agent 09) | AGENT_09_CLIENT_PORTAL_ORDERS_AND_ASSETS.md |
| 34 | Client Invitation RSVP Mailbox & EmailJS | Real-time guest RSVP responses table, search/filter, Approve/Decline actions, and EmailJS dispatch | M5 (Agent 10) | AGENT_10_CLIENT_INVITATION_MAILBOX_AND_EMAILJS.md |
| 35 | Monorepo E2E Test Suite & Integrity Forensics | Multi-tier test suite covering core domain logic, compilation, linter health, and forensic audit | M6 (Verification) | ORIGINAL_REQUEST.md & ASAR_PROJECT_ARCHITECTURE.md |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Shared Domain & Utilities (Agent 01) | `packages/react-appwrite/src/AsarDomain/*`, collections, models, orderPipeline, audioAnalyzer, emailJsService, seedDefaults | none | DONE |
| M2 | Booth Dynamic Plans & Memory (Agents 02 & 03) | `apps/Booth` dynamic booking flow (`useBoothBooking.ts`, `PackagesSection.tsx`, `AddonsSection.tsx`, `BookingModal.tsx`) and Booth Memory page (`src/components/memory/*`, `BoothMemoryPage.tsx`, `App.tsx`) | M1 | DONE |
| M3 | Admin Shell, Bulk Voice & Form Builder (Agents 04, 05, 06) | `apps/Admin` shell, plans, orders queue, payment modal, bulk voice studio with filename parsing, and invitation dynamic form builder | M1 | DONE |
| M4 | Invitation Landing, Custom Renderer & QR Pass (Agents 07 & 08) | `apps/Invitation` landing page, booking wizard, custom invitation page renderer, dynamic RSVP form, and digital QR pass | M1 | DONE |
| M5 | Client Portal Orders, Assets & RSVP Mailbox (Agents 09 & 10) | `apps/Main` platform gateway, auth modal, 7-stage order tracker, raw assets uploader, RSVP mailbox, and EmailJS dispatch | M1 | DONE |
| M6 | Monorepo Verification & Audit Track | Typecheck (`tsc --noEmit`), unit tests for domain logic without live Appwrite, and forensic audit | M1, M2, M3, M4, M5 | DONE |

---

## Interface Contracts

### 1. `packages/react-appwrite` -> All Apps
- `export * from "./AsarDomain";`
- `ASAR_COLLECTIONS`: typed mapping of collection IDs (`plans`, `orders`, `payments`, `booth_memories`, `booth_voice_records`, `booth_media`, `invitations`, `invitation_rsvps`).
- `ASAR_BUCKETS`: typed mapping of bucket IDs (`payment_receipts`, `client_raw_assets`, `booth_mastered_audio`, `booth_gallery_media`, `invitation_assets`).
- `OrderPipeline`: `isValidTransition(from, to)`, `getNextValidStates(current)`, `getOrderStatusColor(status)`, `getOrderStatusLabel(status)`.
- `AudioAnalyzer`: `analyzeAudioBlob(blob)`, `generateWaveformFromBuffer(buffer, peaksCount)`.
- `EmailJsService`: `sendRsvpDecisionEmail(params)`, `buildQrCodeImageUrl(data)`.
- `SeedDefaults`: `DEFAULT_BOOTH_PLANS`, `DEFAULT_INVITATION_PLANS`, `DEMO_BOOTH_MEMORY`, `DEMO_BOOTH_VOICE_RECORDS`, `DEMO_INVITATION`, `DEMO_INVITATION_RSVPS`.

### 2. `apps/Admin` Inter-Component Contracts
- `apps/Admin/src/App.tsx` imports:
  - `<BoothMemoryStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />` from `./components/booth-studio`
  - `<InvitationStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />` from `./components/invitation-studio`
- Props: `{ orderId?: string; onBack: () => void; }`

### 3. `apps/Invitation` Inter-Component Contracts
- `apps/Invitation/src/App.tsx` imports:
  - `<InvitationLandingPage onSelectPackage={(pkg) => handleBooking(pkg)} />` from `./pages/InvitationLandingPage`
  - `<CustomEventPage slug={eventSlug} />` from `./pages/CustomEventPage`
  - `<GuestPassPage passId={passId} />` from `./pages/GuestPassPage`

### 4. `apps/Main` Inter-Component Contracts
- `apps/Main/src/components/account/ClientAccountShell.tsx` imports:
  - `<ClientRsvpMailbox invitationId={selectedInvitationId} />` from `../mailbox/ClientRsvpMailbox`
- Props: `{ invitationId?: string; }`

---

## Code Layout & Strict Parallel Execution Boundaries

| Agent | App / Package | Exclusive File Boundaries (Write Permitted) | Strictly Prohibited Files |
|-------|---------------|---------------------------------------------|---------------------------|
| Agent 01 | `packages/react-appwrite` | `packages/react-appwrite/src/AsarDomain/*`, `packages/react-appwrite/src/index.ts` (export append only) | Any other package or app |
| Agent 02 | `apps/Booth` | `apps/Booth/src/hooks/useBoothBooking.ts`, `apps/Booth/src/components/sections/PackagesSection.tsx`, `AddonsSection.tsx`, `BookingModal.tsx` | `apps/Booth/src/App.tsx`, `src/components/memory/*` |
| Agent 03 | `apps/Booth` | `apps/Booth/src/components/memory/*`, `apps/Booth/src/pages/BoothMemoryPage.tsx`, `apps/Booth/src/App.tsx` | `apps/Booth/src/components/sections/*`, `hooks/useBoothBooking.ts` |
| Agent 04 | `apps/Admin` | `apps/Admin/src/index.css`, `App.tsx`, `components/layout/*`, `components/dashboard/*`, `components/plans/*`, `components/orders/*` | `apps/Admin/src/components/booth-studio/*`, `components/invitation-studio/*` |
| Agent 05 | `apps/Admin` | `apps/Admin/src/components/booth-studio/*` | `apps/Admin/src/App.tsx`, `components/layout/*`, `components/plans/*`, `components/orders/*`, `components/invitation-studio/*` |
| Agent 06 | `apps/Admin` | `apps/Admin/src/components/invitation-studio/*` | `apps/Admin/src/App.tsx`, `components/layout/*`, `components/plans/*`, `components/orders/*`, `components/booth-studio/*` |
| Agent 07 | `apps/Invitation` | `apps/Invitation/src/components/landing/*`, `apps/Invitation/src/pages/InvitationLandingPage.tsx` | `apps/Invitation/src/App.tsx`, `index.css`, `components/renderer/*`, `components/pass/*` |
| Agent 08 | `apps/Invitation` | `apps/Invitation/src/components/renderer/*`, `components/pass/*`, `pages/CustomEventPage.tsx`, `pages/GuestPassPage.tsx`, `App.tsx`, `index.css` | `apps/Invitation/src/components/landing/*`, `pages/InvitationLandingPage.tsx` |
| Agent 09 | `apps/Main` | `apps/Main/src/components/home/*`, `components/auth/*`, `components/account/*`, `App.tsx`, `index.css` | `apps/Main/src/components/mailbox/*` |
| Agent 10 | `apps/Main` | `apps/Main/src/components/mailbox/*` | `apps/Main/src/App.tsx`, `index.css`, `components/home/*`, `components/auth/*`, `components/account/*` |
