## 2026-11-04T00:38:42Z
You are an expert React and TypeScript frontend architect implementing Milestone 2 (M2: Admin Modular Website Creation Editor in `apps/Admin`).
Your working directory is: d:\asar\.agents\teamwork\worker_m2

MANDATORY FIRST STEP:
Read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md to understand the exact requirements and constraints.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES:
- dont over run npm run build without any reason
- and dont make scripts or code generators without anyreason , only make that if its needed

REFERENCE MATERIALS TO READ FIRST:
1. `d:\asar\PROJECT.md`
2. `packages/react-appwrite/src/AsarDomain/sections.ts` (The authoritative modular section schema, models, discriminated union `EventSection`, `parseModularWebsiteConfig`, `validateModularWebsiteConfig`, `createDefaultModularWebsiteConfig`)
3. `d:\asar\.agents\teamwork\survey_explorer_1\admin_modular_editor_analysis.md` (Detailed architecture, component blueprints, and state management)
4. Existing `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` and related components

FILES YOU OWN EXCLUSIVELY:
- `apps/Admin/src/components/invitation-studio/SectionPaletteModal.tsx`
- `apps/Admin/src/components/invitation-studio/ModularSectionList.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/CoverHeroInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/CoupleStoryInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/EventScheduleInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/PhotoGalleryInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/WishingWallInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/DigitalGiftRegistryInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/BackgroundAudioInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/VenueLocationInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/LiveCountdownInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/CustomHighlightInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/DynamicRsvpInspector.tsx`
- `apps/Admin/src/components/invitation-studio/inspectors/index.ts`
- `apps/Admin/src/components/invitation-studio/LiveModularPreview.tsx`
- `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx`
- `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`
