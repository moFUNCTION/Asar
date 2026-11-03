# BRIEFING — 2026-11-03T09:20:00Z

## Mission
Implement the Client Portal, Order Tracking & Raw Assets Management for apps/Main (Port 3000), including ASAR luxury design tokens in index.css, luxury monorepo gateway EcosystemHome, customer AuthModal, ClientAccountShell with 7-stage OrderTrackerTimeline, RawAssetsManager, AudioReviewPlayer, QrHubManager, integration with ClientRsvpMailbox, and App.tsx navigation.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: d:\asar\.agents\teamwork\worker_agent_09
- Original parent: 7938576b-c672-4574-90f4-66e882c30818
- Milestone: Agent 09 Client Portal, Order Tracking & Raw Assets Management

## 🔒 Key Constraints
- Exclusive Write Boundaries (ONLY touch these):
  - apps/Main/src/index.css
  - apps/Main/src/App.tsx
  - apps/Main/src/components/home/* (EcosystemHome.tsx, index.ts)
  - apps/Main/src/components/auth/* (AuthModal.tsx, index.ts)
  - apps/Main/src/components/account/* (ClientAccountShell.tsx, OrderTrackerTimeline.tsx, RawAssetsManager.tsx, AudioReviewPlayer.tsx, QrHubManager.tsx, index.ts)
- Strictly Prohibited Files:
  - apps/Main/src/components/mailbox/* (owned by Agent 10)
  - Any file outside apps/Main
- User rules:
  - Do not over run npm run build without any reason.
  - Do not make scripts or code generators without any reason, only make that if needed.
- Design System: Warm Vintage Editorial Luxury (ASAR Alabaster, Royal Maroon, Champagne Gold, Amiri/Playfair/Cairo typography).
- Chakra UI v3 compatibility: Use layout primitives and styled elements, avoid deprecated v2-only subcomponents.

## Current Parent
- Conversation ID: 7938576b-c672-4574-90f4-66e882c30818
- Updated: 2026-11-03T09:20:00Z

## Task Summary
- **What to build**:
  1. `apps/Main/src/index.css` with ASAR luxury tokens, typography, glass cards, warm backgrounds, custom scrollbars, animations.
  2. `components/home/EcosystemHome.tsx`: Monorepo gateway featuring Booth (:3002), Invitation (:3003), and Admin (:3001) access cards with luxury styling, quick links to account/orders and mailbox.
  3. `components/auth/AuthModal.tsx`: Customer login/register modal using Appwrite account session (`useAuth`) with mock demo client fallback.
  4. `components/account/ClientAccountShell.tsx`: Account shell with tabs (Orders, Raw Assets Box, QR Codes, RSVP Mailbox), active order switcher, demo state controls, rendering child managers and `<ClientRsvpMailbox />`.
  5. `components/account/OrderTrackerTimeline.tsx`: 7-stage visual progress stepper (`draft` -> `submitted` -> `under_review` -> `paid_confirmed` -> `assets_uploaded` -> `processing` -> `delivered`, with support for payment receipt status, stage explanation, action buttons).
  6. `components/account/RawAssetsManager.tsx`: Drag-and-drop uploader for raw event recordings/photos with progress bar, file listing, Appwrite storage integration (`client_raw_assets`), and asset metadata form.
  7. `components/account/AudioReviewPlayer.tsx`: Audio review player for mastered clips delivered to client with play/pause, scrub slider, waveform visualization, category filtering, and single/batch download.
  8. `components/account/QrHubManager.tsx`: QR pass codes display, high-resolution QR card, download PNG, print-ready table card generator, and sharing tools.
  9. `components/account/index.ts`, `components/home/index.ts`, `components/auth/index.ts`.
  10. `apps/Main/src/App.tsx`: Master router managing views: Gateway (`gateway`), Auth Modal, and Account Portal (`account` with default/active tab).

## Change Tracker
- **Files modified / created**:
  - `apps/Main/src/index.css`: Updated with ASAR design system luxury CSS variables, fonts, and utility classes.
  - `apps/Main/src/components/home/EcosystemHome.tsx`: Monorepo gateway featuring Booth, Invitation, and Admin cards.
  - `apps/Main/src/components/home/index.ts`: Re-export for EcosystemHome.
  - `apps/Main/src/components/auth/AuthModal.tsx`: Customer login/register modal with Appwrite session and 1-click Demo Client switcher.
  - `apps/Main/src/components/auth/index.ts`: Re-export for AuthModal.
  - `apps/Main/src/components/account/OrderTrackerTimeline.tsx`: 7-stage live order status stepper with receipt re-uploader and demo stage switcher.
  - `apps/Main/src/components/account/RawAssetsManager.tsx`: Raw asset concierge uploader for hero photo, couple quotes, categories, and event assets.
  - `apps/Main/src/components/account/AudioReviewPlayer.tsx`: Mastered audio player with 48-bar waveform scrubber, categories filter, and batch download.
  - `apps/Main/src/components/account/QrHubManager.tsx`: Keepsake QR card and print-ready 5x7" table stand card generator.
  - `apps/Main/src/components/account/ClientAccountShell.tsx`: Client account layout with 5 tabs, integrating `<ClientRsvpMailbox />` from Agent 10.
  - `apps/Main/src/components/account/index.ts`: Master exports for account module.
  - `apps/Main/src/App.tsx`: Master routing between Gateway, Auth, and Account Portal with URL search param support.
- **Build status**: Clean compilation on all Agent 09 files. ESLint zero errors.
- **Pending issues**: None in Agent 09 scope.

## Quality Status
- **Build/test result**: Zero errors in Agent 09 owned files during TypeScript typecheck.
- **Lint status**: Zero ESLint violations across all Agent 09 files.
- **Tests added/modified**: Integrated type-safe contracts and interactive demo controls across all components.

## Loaded Skills
- None
