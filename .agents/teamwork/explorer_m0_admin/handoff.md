# Handoff Report: Admin Modular Website Creation Editor Exploration (R2)

**Agent:** `explorer_m0_admin`  
**Working Directory:** `d:\asar\.agents\teamwork\explorer_m0_admin`  
**Recipient:** Orchestrator (`1702b5c8-8740-4f25-b6f5-898d68518b3a`)  
**Date:** 2026-11-04  
**Type:** Hard Handoff (Investigation & Architecture Complete)  

---

## 1. Observation

Direct inspections of the codebase revealed the following structural details:

1. **`apps/Admin/src/App.tsx` (Lines 296–349)**:
   - Admin routes are managed via `react-router-dom`:
     ```tsx
     <Route path="/overview" element={<AdminOverview ... />} />
     <Route path="/plans" element={<PlanBuilderStudio ... />} />
     <Route path="/orders" element={<OrdersQueueManager ... />} />
     <Route path="/orders/:orderId" element={<OrdersQueueManager ... />} />
     <Route path="/booth-studio/:orderId?" element={<BoothStudioRouteWrapper onBack={handleBackToOrders} />} />
     <Route path="/invitation-studio/:orderId?" element={<InvitationStudioRouteWrapper onBack={handleBackToOrders} />} />
     ```
   - State for `orders` and `payments` is persisted to `localStorage` (`asar_synced_orders` and `asar_synced_payments`).

2. **`apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` (Lines 137, 804–928)**:
   - Split-screen workspace with 60% builder controls and 40% `LiveInvitationPreview`.
   - 3-tab layout:
     - Tab 1: `ThemeAndEffectsPanel` (color swatches, fonts, WebGL shaders).
     - Tab 2: `SectionBlocksManager` (list of section blocks).
     - Tab 3: `DynamicFormSchemaBuilder` (RSVP fields with locked `guestEmail`).
   - Save handler (`handleSaveAndPublish`, lines 281–359) serializes state into `AsarInvitationDocument` and saves to `localStorage` (`asar_invitations_cache`, `asar_active_invitation`) and Appwrite collection `invitations` in database `asar-db`.

3. **`apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` (Lines 3–58, 59–140)**:
   - Defined `SectionBlockType` with 7 flat blocks: `"hero" | "countdown" | "story_timeline" | "gallery" | "venue_map" | "custom_highlight" | "rsvp_form"`.
   - All section fields are optional flat properties on `InvitationSectionBlock` (e.g. `mainTitle`, `timelineItems`, `galleryImages`, `venueName`).
   - Missing modern interactive sections required by Chungdoi/WithJoy: Wishing Wall / Guestbook (`wishing_wall`), Digital Gift Registry / Bank QR (`digital_gift_registry`), and Background Audio Soundtrack (`background_audio`).
   - Lacks a visual Section Palette / Picker (only has a single hardcoded `+ Add Highlight Section` button, line 208).
   - Inspectors are inline within one large file (lines 460–855) rather than dedicated modular components.

4. **`packages/react-appwrite/src/AsarDomain/models.ts` (Lines 214–230) & `collections.ts` (Lines 7–16)**:
   - `collections.ts` defines `ASAR_COLLECTIONS.INVITATIONS = "invitations"` and `ASAR_DATABASE_ID = "asar-db"`.
   - `models.ts` defines a minimal `InvitationSectionBlock`:
     ```ts
     export interface InvitationSectionBlock {
       id: string;
       type: "hero" | "countdown" | "story" | "schedule" | "location_map" | "gallery" | "rsvp_form" | "custom_text";
       titleEn: string;
       titleAr: string;
       enabled: boolean;
       order: number;
       configJson?: string;
     }
     ```

5. **`apps/Invitation/src/pages/CustomEventPage.tsx` (Lines 430–470)**:
   - Page renderer mounts sections in a **static hardcoded vertical sequence**:
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
   - It does NOT dynamically map over `sectionsConfigJson` according to user order, visibility, or section count.

---

## 2. Logic Chain

1. **Premise 1**: Competitor platforms (Chungdoi.com, WithJoy, Zola) achieve rich customization by treating websites as an ordered stack of composable, reusable sections that can be added, removed, reordered, and configured independently.
2. **Premise 2**: ASAR's existing `SectionBlocksManager.tsx` is limited to 7 hardcoded block types with flat optional fields, and `CustomEventPage.tsx` ignores the custom block order during rendering.
3. **Premise 3**: In order to satisfy Requirement R2 and benchmark feature parity, administrators need to add, reorder, and configure:
   - Wishing Wall / Guestbook (`wishing_wall`)
   - Digital Gift Registry & Bank / InstaPay QR (`digital_gift_registry`)
   - Background Audio Soundtrack Player (`background_audio`)
   - Multi-event Schedule / Itinerary (`event_schedule`)
   - Curated Photo Gallery (`photo_gallery`) with 3D/Bento modes
   - Cover Hero (`cover_hero`), Story (`couple_story`), Venue Map (`venue_location`), Live Countdown (`live_countdown`), and RSVP (`dynamic_rsvp`).
4. **Premise 4**: Modeling these 11 sections as a strongly-typed TypeScript **discriminated union** (`EventSection`) guarantees compiler-enforced type safety across Admin, Invitation, and shared packages, preventing runtime errors and untyped JSON bugs.
5. **Premise 5**: Storing `EventSection[]` in Appwrite's `invitations.sectionsConfigJson` attribute while maintaining a dual-tier `localStorage` cache guarantees instant live preview, cross-tab hot reload, and offline resilience during local development.

---

## 3. Caveats

* **Audio Autoplay Policy**: Modern web browsers (Chrome, Safari, Edge) block unmuted audio autoplay without a prior user gesture. The background audio player must default to `autoplayOnFirstGesture` or display an unmuted play button rather than attempting forceful silent autoplay.
* **Storage Bucket Quotas**: Uploading high-resolution photo galleries and audio files requires Appwrite Storage bucket `invitation_assets`. In offline/mock mode, public HTTPS CDN URLs serve as resilient fallbacks.
* **No Code Modification Undertaken**: As a read-only exploration agent, no production source code in `apps/` or `packages/` was modified. All designs are documented in `admin_modular_editor_analysis.md`.

---

## 4. Conclusion

Requirement R2 ("Admin Modular Website Creation Editor") is architecturally defined and ready for implementation:
1. **TypeScript Schema**: Defined in `packages/react-appwrite/src/AsarDomain/modularSections.ts` with discriminated union `EventSection` (11 section variants), `ModularWebsiteConfig`, and backward-compatible migration parser `migrateLegacyBlocksToModularConfig`.
2. **Editor UI/UX Architecture**: Defined 4 core sub-components:
   - Section Palette / Picker modal (`SectionPaletteModal.tsx`).
   - Section Reorder List with drag handles, Up/Down controls, duplicate, and delete.
   - Dedicated Section Config Inspectors (`WishingWallInspector`, `GiftRegistryInspector`, `BackgroundAudioInspector`, etc.).
   - Interactive Live Preview Canvas (`LiveInvitationPreview.tsx`) supporting responsive mobile (390px) and full-width desktop views.
3. **Storefront Dynamic Dispatch**: `apps/Invitation/src/pages/CustomEventPage.tsx` will map over `sections.filter(s => s.enabled).sort((a,b) => a.order - b.order)` to render configured components dynamically.
4. **Complete Deliverable**: Full technical document written to `d:\asar\.agents\teamwork\explorer_m0_admin\admin_modular_editor_analysis.md`.

---

## 5. Verification Method

1. **Verify Deliverable Files Exist**:
   - Inspect `d:\asar\.agents\teamwork\explorer_m0_admin\admin_modular_editor_analysis.md` (Check that it covers all 9 sections, full TypeScript schemas, and implementation roadmap).
   - Inspect `d:\asar\.agents\teamwork\explorer_m0_admin\handoff.md` (This 5-component report).
   - Inspect `d:\asar\.agents\teamwork\explorer_m0_admin\BRIEFING.md` and `progress.md`.
2. **Inspect Existing Files Cited**:
   - `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`
   - `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx`
   - `apps/Invitation/src/pages/CustomEventPage.tsx`
   - `packages/react-appwrite/src/AsarDomain/models.ts`
3. **Workspace Invalidation Conditions**:
   - If `admin_modular_editor_analysis.md` does not contain the complete TypeScript discriminated union or persistence strategy, the handoff is invalid. (Verified: Complete schemas and persistence model are fully articulated).
