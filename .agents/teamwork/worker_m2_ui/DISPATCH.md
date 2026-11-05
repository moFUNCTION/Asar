# Worker Dispatch: Milestone 2 — Workspace UI/UX Overhaul (ASAR Warm Vintage Editorial)

## Mandate
Modernize and enhance the user interface and user experience across Admin and all client applications (Booth, Invitation, Main, Renderer), adhering strictly to the **ASAR Warm Vintage Editorial luxury design system**.

## Required References (Read First)
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY)
2. `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`
3. `docs/ASAR_DESIGN_SYSTEM.md` (Definitive luxury design system guidelines, colors, typography, glassmorphism)
4. `d:\asar\.agents\teamwork\explorer_survey_ui\ui_ux_audit.md` (Detailed audit report with exact line numbers and recommendations)
5. `d:\asar\.agents\teamwork\explorer_survey_ui\handoff.md`

## Exclusive File Ownership (Write Boundaries)
You EXCLUSIVELY own and may modify ONLY these files:
- `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`
- `apps/Invitation/package.json`
- `apps/Main/package.json`
- `apps/Admin/src/components/dashboard/AdminOverview.tsx`
- `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`
- `apps/Booth/src/components/memory/MemoryActionBar.tsx`
- `apps/Booth/src/components/memory/GuestBookFeed.tsx`
- `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx`
- `apps/Admin/index.html`
- `apps/Invitation/index.html`
- `apps/Main/index.html`
- `apps/Renderer/src/index.css`
- `apps/Booth/src/index.css`
- New skeleton components (if needed, create in `packages/UI-components/src/components/` or within app components folder)

## Implementation Tasks

### 1. Fix Flash of 404 in DynamicStorefrontIndex (`apps/Renderer`)
- In `apps/Renderer/src/pages/DynamicStorefrontIndex.tsx`:
  - When `synchronousType === "unknown"` and an asynchronous remote query is in flight (`isResolvingRemote` / `isLoading`), render a luxury Warm Vintage Editorial loading screen with a warm gold spinner, vintage alabaster backdrop, and poetic status text (`"جاري تهيئة واجهة الذكريات الفاخرة..."`), rather than falling through to `<StorefrontNotFound />`.

### 2. Package Dependency Alignment (`@repo/ui-components`)
- In `apps/Invitation/package.json` and `apps/Main/package.json`:
  - Add `"@repo/ui-components": "*"` to `dependencies`.

### 3. Admin Palette Sanitation
- In `apps/Admin/src/components/dashboard/AdminOverview.tsx`:
  - Replace Tailwind generic hex values (`#3B82F6` blue, `#8B5CF6` purple, `#EC4899` pink) with ASAR Warm Vintage Editorial luxury palette colors:
    - Warm Alabaster (`#FBF7F2`), Linen Cream (`#F4EFEA`), Royal Maroon (`#6B1D28`), Champagne Gold (`#D4AF37`), Deep Noir (`#1A1615`), Bronze (`#8C6D46`), Warm Charcoal (`#2D2422`).

### 4. Replace Native Alert in Admin Payment Inspector
- In `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx`:
  - Replace `alert("يرجى كتابة أو اختيار سبب الرفض...")` with an inline error state or Chakra UI luxury toast (`toast({ title: "تنبيه", description: "يرجى كتابة أو اختيار سبب الرفض لتوجيه العميل لإعادة الرفع بشكل صحيح.", status: "warning" })`).

### 5. Flatten Mobile Action Bar in Booth
- In `apps/Booth/src/components/memory/MemoryActionBar.tsx`:
  - Improve mobile responsive layout (`direction={{ base: "row", sm: "row" }}` with compact icon buttons or wrapped flex) so it does not vertically expand to 150px and collide with `AudioPlayerBar`.

### 6. Add `dir="auto"` on Bilingual UGC Feeds
- In `apps/Booth/src/components/memory/GuestBookFeed.tsx` (message text) and `apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx` (wish message):
  - Add `dir="auto"` to message text containers so Arabic and English text format naturally with proper punctuation alignment.

### 7. Standardize HTML Preloading & CSS Variables
- In `apps/Admin/index.html`, `apps/Invitation/index.html`, and `apps/Main/index.html`:
  - Update `lang="ar" dir="rtl"` where appropriate and ensure Google Fonts preloading includes `Amiri`, `Aref Ruqaa`, `Cairo`, and `Plus Jakarta Sans`.
- In `apps/Renderer/src/index.css` and `apps/Booth/src/index.css`:
  - Ensure all `--athar-*` luxury CSS root variables are present and synchronized.

## Constraints & Mandatory Warnings
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULE: Do not over-run `npm run build` without any reason, and do not make scripts or code generators without reason.

## Verification
- Verify TypeScript compilation:
  `npx tsc --noEmit -p apps/Renderer/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Admin/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Booth/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Invitation/tsconfig.app.json`
  `npx tsc --noEmit -p apps/Main/tsconfig.app.json`
- Run existing tests:
  `npx tsx --test apps/Renderer/test/*.test.ts apps/Booth/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts`
- Write your completion handoff report to `d:\asar\.agents\teamwork\worker_m2_ui\handoff.md`.


## 2026-11-04T22:29:27Z
You are worker_m2_ui, a teamwork_worker implementation agent.
Your working directory is d:\asar\.agents\teamwork\worker_m2_ui.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Read d:\asar\.agents\teamwork\worker_m2_ui\DISPATCH.md, docs/ASAR_DESIGN_SYSTEM.md, and d:\asar\.agents\teamwork\explorer_survey_ui\ui_ux_audit.md for full technical details.

Your mission:
Implement Milestone 2: Workspace UI/UX Overhaul adhering to ASAR Warm Vintage Editorial luxury design system:
1. Fix flash of 404 in apps/Renderer/src/pages/DynamicStorefrontIndex.tsx with luxury editorial resolving state.
2. Align package dependencies: add "@repo/ui-components": "*" to apps/Invitation/package.json and apps/Main/package.json.
3. Cleanse palette in apps/Admin/src/components/dashboard/AdminOverview.tsx (eliminate generic Tailwind blue/purple/pink in favor of ASAR warm vintage tokens).
4. Remove native alert() in apps/Admin/src/components/orders/PaymentReceiptInspector.tsx (replace with luxury toast/inline error).
5. Flatten mobile layout of apps/Booth/src/components/memory/MemoryActionBar.tsx to prevent 150px footer collision with AudioPlayerBar.
6. Add dir="auto" to UGC message containers in apps/Booth/src/components/memory/GuestBookFeed.tsx and apps/Invitation/src/components/modular-renderer/sections/InteractiveWishingWallSection.tsx.
7. Standardize index.html font preloading and CSS variables in apps/Admin/index.html, apps/Invitation/index.html, apps/Main/index.html, apps/Renderer/src/index.css, and apps/Booth/src/index.css.

Exclusive file ownership: ONLY touch the files listed above.
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
USER RULE: Do not over-run npm run build without reason, do not make scripts or code generators without reason.

Verify with:
npx tsc --noEmit -p apps/Renderer/tsconfig.app.json
npx tsc --noEmit -p apps/Admin/tsconfig.app.json
npx tsc --noEmit -p apps/Booth/tsconfig.app.json
npx tsc --noEmit -p apps/Invitation/tsconfig.app.json
npx tsc --noEmit -p apps/Main/tsconfig.app.json
npx tsx --test apps/Renderer/test/*.test.ts apps/Booth/test/*.test.ts apps/Invitation/test/*.test.ts apps/Admin/test/*.test.ts

Deliver your handoff report to d:\asar\.agents\teamwork\worker_m2_ui\handoff.md and notify me via send_message.


## 2026-11-04T22:39:14Z
**Context**: Milestone 2 Workspace UI/UX Overhaul Status Check
**Content**: Milestone 3 is complete. Checking on your progress across the UI/UX overhaul tasks (DynamicStorefrontIndex loading screen, palette sanitation, alert removal, mobile layout, font preloads).
**Action**: Please share your current status or ETA for delivery of your handoff.
