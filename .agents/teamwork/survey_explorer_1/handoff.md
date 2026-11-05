# Handoff Report: R2 Admin Modular Website Creation Editor Architecture Survey

**Author:** `survey_explorer_1` (Teamwork Explorer)  
**Date:** 2026-11-04  
**Working Directory:** `d:\asar\.agents\teamwork\survey_explorer_1\`  
**Handoff Type:** Hard (Complete Investigation & Specification)  
**Original Request:** `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md`  
**Primary Deliverable:** `d:\asar\.agents\teamwork\survey_explorer_1\admin_modular_editor_analysis.md`  

---

## 1. Observation

1. **`apps/Admin` Routing & Navigation Architecture:**
   - In `apps/Admin/src/App.tsx` (Lines 297–351), the Admin application is orchestrated through `<AdminShell>` with declarative `<Routes>`:
     - `/overview` -> `<AdminOverview />`
     - `/plans` -> `<PlanBuilderStudio />`
     - `/orders` and `/orders/:orderId` -> `<OrdersQueueManager />`
     - `/booth-studio/:orderId?` -> `<BoothStudioRouteWrapper />`
     - `/invitation-studio/:orderId?` -> `<InvitationStudioRouteWrapper />`
   - In `apps/Admin/src/components/layout/AdminShell.tsx` (Lines 41–53), 5 navigation pill tabs are defined:
     - `"Overview"`, `"Plans & Limits"`, `"Orders & Payments"`, `"Booth Memory Studio"`, `"Invitation Builder"`.

2. **Current `InvitationStudio.tsx` State:**
   - Located at `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` (1,088 lines).
   - Manages three studio tabs:
     - `ThemeAndEffectsPanel` (Lines 4–7)
     - `SectionBlocksManager` (Lines 9–12)
     - `DynamicFormSchemaBuilder` (Lines 14–20)
   - In Lines 300–358, handles serialization to `AsarInvitationDocument` where `sectionsConfigJson` stores `JSON.stringify(blocks)` and persists to `localStorage` (`asar_invitations_cache`, `asar_active_invitation`) and Appwrite collection `invitations` in `asar-db`.

3. **Current Section Blocks Model in `SectionBlocksManager.tsx`:**
   - Located at `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` (862 lines).
   - In Lines 3–10, `SectionBlockType` is currently constrained to:
     ```ts
     export type SectionBlockType =
       | "hero"
       | "countdown"
       | "story_timeline"
       | "gallery"
       | "venue_map"
       | "custom_highlight"
       | "rsvp_form";
     ```
   - In Lines 24–57, `InvitationSectionBlock` aggregates all attributes into a single flat interface without per-section discriminated unions.
   - In Lines 59–140, a static `DEFAULT_SECTION_BLOCKS` array is initialized with no section palette or catalog.
   - The only addition mechanism is `handleAddCustomHighlight` (Line 208), which appends another `custom_highlight` block.
   - Modern competitor sections required by the user (Wishing Wall, Ambient Background Audio, Digital Gift Registry with Bank QR, Multi-Event Schedule, Story Milestones) are completely absent from the current editor.

4. **Customer-Facing Invitation Rendering in `apps/Invitation/src/pages/CustomEventPage.tsx`:**
   - In Lines 430–469, sections are statically rendered in hardcoded JSX sequence:
     1. `<EventHeroSection />`
     2. `<EventCountdownSection />`
     3. `<EventScheduleSection />`
     4. `<EventMediaGallery />`
     5. `<EventLocationMap />`
     6. `<DynamicRsvpForm />`
   - The `invitation.sectionsConfigJson` payload configured in the Admin studio is **not** currently mapped dynamically to control section render order or visibility.

5. **Shared Domain Packages in `@repo/react-appwrite`:**
   - Located at `packages/react-appwrite/src/AsarDomain/`.
   - `collections.ts`: Defines `ASAR_COLLECTIONS.INVITATIONS = "invitations"` and `ASAR_DATABASE_ID = "asar-db"`.
   - `models.ts` (Lines 214–230): Contains preliminary `InvitationSectionBlock` definition.
   - `models.ts` (Lines 416–422): Implements `parseSectionsConfig(sectionsJson: string | null | undefined): InvitationSectionBlock[]`.
   - `Storefront/subdomain.ts`: Implements RFC 1123 subdomain validation (`validateSubdomainSlug`) and URL generation (`buildMemoryUrls`).

---

## 2. Logic Chain

1. **Need for a True Modular Website Editor (Observation 1, 3):**
   - Observation 3 shows that the current editor only allows toggling visibility and reordering 6 hardcoded blocks, with only `custom_highlight` being addable.
   - Competitor platforms (Chungdoi, WithJoy, Zola) provide dynamic section palettes where couples can freely drop in, configure, and reorder wishing walls, music players, digital gift bank QRs, and multi-ceremony schedules.
   - Therefore, to satisfy Requirement R2, `apps/Admin` must provide a **Section Palette / Picker** and a **Modular Website Creation Editor** capable of instantiating, reordering, configuring, and removing any modular section type from an extensible catalog.

2. **Discriminated Union Schema vs Flat Interface (Observation 3, 5):**
   - Observation 3 shows that `InvitationSectionBlock` mixes optional fields from different block types into a single interface.
   - A digital gift registry requires `accounts: BankQrAccount[]` and `enableBlessingBox`, whereas a background audio section requires `audioStreamUrl`, `songTitle`, `autoplay`, and `floatingWidgetStyle`.
   - Putting all fields on one flat interface leads to schema pollution, lack of type validation, and prone-to-crash property access.
   - Therefore, a discriminated union `EventSection` (where each type has its own strictly typed `config` object: `CoverHeroSectionConfig`, `WishingWallSectionConfig`, `GiftRegistrySectionConfig`, `BackgroundAudioSectionConfig`, etc.) is required.

3. **Storage Backward Compatibility (Observation 2, 5):**
   - Observation 2 demonstrates that `InvitationStudio.tsx` already saves `sectionsConfigJson` to `localStorage` and Appwrite collection `invitations`.
   - Observation 5 shows `models.ts` already has a safe parser helper `parseSectionsConfig`.
   - By creating a migration normalizer (`parseModularSections`) that detects whether the JSON is v1 legacy (`InvitationSectionBlock[]`) or v2 modular (`EventSection[]`), existing database records and demo orders will continue to render without runtime errors or schema corruption.

4. **Coordinated UI/UX Layout (Observation 1, 2, 4):**
   - Administrators need immediate visual feedback when modifying sections.
   - Implementing a split-screen studio—featuring a left-hand Control Deck (Section Palette, Reorder Deck, and per-section Config Inspector) and a right-hand Live Preview Canvas with mobile/desktop device frames—empowers administrators to see their changes instantly.
   - Connecting `sectionsConfigJson` dynamically to `CustomEventPage.tsx` ensures that what the administrator builds in R2 is rendered faithfully on the public storefront in R3.

---

## 3. Caveats

1. **Read-Only Explorer Scope:**
   - In accordance with explorer identity and constraints, no project source code was modified during this survey.
   - All proposed components and schema files are documented in `admin_modular_editor_analysis.md` for implementation by the downstream worker agent.

2. **Audio File Hosting for Background Soundtrack:**
   - Background audio tracks can be hosted via external CDN URLs (e.g., MP3 streams) or uploaded to Appwrite Storage bucket `client_raw_assets` / `invitation_assets`. The schema accounts for both via `audioStreamUrl`.

3. **Browser Autoplay Policies:**
   - Modern browsers (Chrome, Safari) restrict audio autoplay until the user has interacted with the document (clicked, scrolled, or tapped).
   - The `BackgroundAudioSectionConfig` includes an autoplay toggle with a fallback floating music player button so visitors can easily initiate audio playback.

---

## 4. Conclusion

1. **Feasibility:** Implementing R2 ("Admin Modular Website Creation Editor") in `apps/Admin` is completely viable, clean, and directly aligned with the existing Appwrite data model and React Router topology.
2. **Architecture:**
   - We have established the full TypeScript schema (`SectionType`, `SectionBase`, per-section configs, discriminated union `EventSection`, root `ModularWebsiteConfig`) in `admin_modular_editor_analysis.md`.
   - We have designed the 4-part UI/UX layout: Section Palette Modal, Section Reorder Deck, Section Config Inspector, and Split-Screen Live Preview Canvas.
   - We have verified the storage pipeline (`sectionsConfigJson` in Appwrite `invitations` collection + `localStorage` draft caching) and provided a zero-crash migration parser for legacy documents.
3. **Actionable Roadmap:**
   - Downstream agents can directly implement the components inside `apps/Admin/src/components/modular-editor/` (or upgrade `invitation-studio/`), export types from `@repo/react-appwrite`, and wire `CustomEventPage.tsx` to dynamically map over `sectionsConfigJson`.

---

## 5. Verification Method

To independently verify the facts and architecture documented in this report:

1. **Verify Existing Admin Studio and Component Paths:**
   ```powershell
   Test-Path "d:\asar\apps\Admin\src\components\invitation-studio\InvitationStudio.tsx"
   Test-Path "d:\asar\apps\Admin\src\components\invitation-studio\SectionBlocksManager.tsx"
   Test-Path "d:\asar\apps\Admin\src\components\booth-studio\BoothMemoryStudio.tsx"
   Test-Path "d:\asar\apps\Invitation\src\pages\CustomEventPage.tsx"
   Test-Path "d:\asar\packages\react-appwrite\src\AsarDomain\models.ts"
   ```
   *Expected result:* All paths return `True`.

2. **Inspect the Comprehensive Analysis Document:**
   ```powershell
   Get-Content "d:\asar\.agents\teamwork\survey_explorer_1\admin_modular_editor_analysis.md" -Head 40
   ```
   *Expected result:* Displays the complete executive summary, competitor benchmarks, schema definitions, and UI layout breakdown.

3. **Verify TypeScript Health Across Admin and Shared Packages:**
   ```powershell
   npx tsc --noEmit -p packages/react-appwrite/tsconfig.json
   npx tsc --noEmit -p apps/Admin/tsconfig.json
   ```
   *Expected result:* TypeScript compiles with 0 errors.
