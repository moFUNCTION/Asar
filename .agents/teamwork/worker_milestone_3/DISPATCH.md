# Milestone 3: Dynamic Storefront Memory Renderers

## Context
You are a worker implementing Milestone 3 of the ASAR monorepo update.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

## Exclusive Write Ownership
You own and may ONLY edit files within:
`apps/Renderer/src/components/*`
`apps/Renderer/src/pages/*`

## Objectives
1. Implement Full Interactive `BoothMemoryRenderer` in `apps/Renderer`:
   - Hero: Editorial header tag ("THE WEDDING OF"), couple title ("Mina & Maryam"), date, location, badge, quote.
   - Voice Player: 48-peak waveform visualizer, audio play/pause, scrubber, speaker badges, category filtering (All, Family, Friends, VIP, Colleagues), Web Audio chime on play.
   - Private Heirloom PIN Padlock: If `isPrivateLocked === true`, gate content with 4-digit PIN verification modal (`accessPinCode`).
   - Keepsake Gallery: Photography masonry grid with lightbox.
   - Video Highlight: 30-second video reel embed card.
   - Guestbook: Blessings feed and "Leave a Blessing" note modal.
   - Share modal: QR card pointing to canonical URL (`https://${slug}.asar.me`) and clipboard copy.
2. Implement Full Interactive `InvitationMemoryRenderer` in `apps/Renderer`:
   - Theme styling: support luxury themes (`ivory-royal`, `noir-obsidian`, etc.) with CSS variable injection.
   - Event Hero: Occasion type, event title, date/time, venue, smooth scroll "RSVP Now" CTA.
   - Real-time Countdown: Live countdown ticker (Days, Hours, Minutes, Seconds).
   - Schedule Timeline: Itinerary cards with time badges.
   - Venue Location & Dress Code: Map directions link and dress code swatches.
   - Dynamic Schema-Driven RSVP Form:
     - Strictly enforce mandatory locked `guestName` and `guestEmail` (email format, required).
     - Dynamic custom fields (select, radio, text, checkbox) parsed from `formSchemaJson`.
     - Generate VIP QR Access Pass modal upon RSVP submission with unique pass token.
3. Connect Both Renderers seamlessly inside `DynamicStorefrontIndex.tsx` with hydration from presets (`DEMO_BOOTH_MEMORY`, `INVITATION_PRESETS`), `localStorage` caches (`getBoothMemoriesCache`, `getInvitationsCache`), and Appwrite collections.
4. Verification:
   - Run `npx tsc --noEmit -p apps/Renderer/tsconfig.json` (must exit 0 with 0 errors).
   - Run `npx eslint "apps/Renderer/src/**/*.{ts,tsx}"` (must exit 0 with 0 errors).
   - User Rule: DO NOT run `npm run build` without reason. Use `tsc --noEmit`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report to `d:\asar\.agents\teamwork\worker_milestone_3\handoff.md` and send a message back.
