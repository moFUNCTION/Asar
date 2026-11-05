# Milestone 4: Monorepo React Router Alignment & Admin Integration

## Context
You are a worker implementing Milestone 4 of the ASAR monorepo update.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

## Exclusive Write Ownership
You own and may ONLY edit files within:
`apps/Admin/*`
`apps/Booth/*`
`apps/Invitation/*`
`apps/Main/*`
(Make targeted edits only where necessary to ensure alignment with the new renderer app or fix router/typecheck issues).

## Objectives
1. Admin Memory Template & Management Alignment (R3):
   - In `apps/Admin/src/components/booth-studio/` and `apps/Admin/src/components/invitation-studio/`:
     - Inspect `buildMemoryUrls` usage. Ensure dev preview links can target `urls.devRendererUrl` or port 3004 so admins can preview directly in the dedicated renderer app.
     - Ensure canonical URLs (`https://${slug}.asar.me`) and QR card generation remain intact.
     - Preserve all Admin workflows: `PlanBuilderStudio` quotas, 7-stage order status transitions, receipt zoom inspector, bulk voice uploader with waveform extraction, dynamic form schema builder with locked `guestEmail`, and live split-screen previews.
2. Monorepo React Router Consistency (R1):
   - Verify all applications (`apps/Main`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Renderer`) have `react-router-dom@^6.28.0` with `<BrowserRouter>` in `main.tsx` and declarative `<Routes>` in `App.tsx`.
3. TypeScript Zero-Error Compilation:
   - Run `npx tsc --noEmit` on:
     1. `packages/react-appwrite/tsconfig.json`
     2. `apps/Admin/tsconfig.json`
     3. `apps/Booth/tsconfig.json`
     4. `apps/Invitation/tsconfig.json`
     5. `apps/Main/tsconfig.json`
     6. `apps/Renderer/tsconfig.json`
   - Every single one MUST exit 0 with 0 errors! If any app has a type error, resolve it cleanly.
   - User Rule: DO NOT run `npm run build` without reason. Use `tsc --noEmit`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report to `d:\asar\.agents\teamwork\worker_milestone_4\handoff.md` and send a message back.


## 2026-11-03T22:49:35Z
You are worker_milestone_4 (Role: Admin Integration & Monorepo Worker).
Your working directory is d:\asar\.agents\teamwork\worker_milestone_4\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\worker_milestone_4\DISPATCH.md before starting work.
Scope document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

Exclusive Write Ownership:
`apps/Admin/*`
`apps/Booth/*`
`apps/Invitation/*`
`apps/Main/*`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 4:
1. Align Admin memory template management: update `buildMemoryUrls` usage in `apps/Admin` to support `devRendererUrl` (port 3004) so admins can preview directly in the dedicated renderer app, while maintaining canonical production URLs and QR code targets.
2. Preserve all Admin studio workflows (plans builder, order pipeline, bulk voice uploader with waveforms, dynamic form schema builder with locked `guestEmail`, and live split-screen previews).
3. Verify React Router v6 setup across all 5 apps (`apps/Main`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Renderer`).
4. Run `npx tsc --noEmit` across all 6 configs:
   - `packages/react-appwrite/tsconfig.json`
   - `apps/Admin/tsconfig.json`
   - `apps/Booth/tsconfig.json`
   - `apps/Invitation/tsconfig.json`
   - `apps/Main/tsconfig.json`
   - `apps/Renderer/tsconfig.json`
   Ensure 100% clean exit (code 0) with 0 errors across all 6 configs!
User rule: DO NOT over run npm run build without reason. Do not make scripts or code generators unless needed.

Write handoff to d:\asar\.agents\teamwork\worker_milestone_4\handoff.md and send a message back when complete.
