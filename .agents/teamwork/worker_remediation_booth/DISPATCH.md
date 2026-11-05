# Dispatch: worker_remediation_booth

## Mission

Fix the 9 TypeScript compilation errors in `apps/Booth/src/components/memory/*` and linter errors in `apps/Booth/src/components/sections/BookingModal.tsx` and `apps/Booth/src/hooks/useBoothBooking.ts`.

## Working Directory

`.agents/teamwork/worker_remediation_booth`

## Specific Instructions

1. Read `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` and `d:\asar\.agents\teamwork\victory_auditor_1\handoff.md`.
2. Fix TypeScript errors in `apps/Booth/src/components/memory/*`:
   - `VideoHighlightCard.tsx`: Import `HStack` from `@chakra-ui/react`.
   - `AudioPlayerBar.tsx`: Replace `noOfLines` with `lineClamp` on Chakra v3 Text.
   - `MemoryHeader.tsx` & `MemoryHero.tsx`: Remove unsupported `fallback` prop from Chakra v3 Image (use native `onError` or conditional fallback if needed).
   - `PhotoGalleryGrid.tsx`: Replace `noOfLines` with `lineClamp`; fix Button `href` by wrapping with `<a>` or using `as="a"`.
   - `VoiceCard.tsx`: Replace `noOfLines` with `lineClamp`.
3. Fix ESLint errors in `apps/Booth`:
   - `BookingModal.tsx:257:19, 992:60`: Replace `any` with specific types.
   - `useBoothBooking.ts:540:41`: Replace `any` with specific types.
4. Verify by running:
   `npx tsc --noEmit -p apps/Booth/tsconfig.app.json`
   and check linting on modified files.
5. Write `handoff.md` with verification outputs.
