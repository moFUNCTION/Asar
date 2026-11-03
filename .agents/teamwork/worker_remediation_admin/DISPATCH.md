# Dispatch: worker_remediation_admin

## Mission
Fix ESLint errors in modified files in `apps/Admin`.

## Working Directory
`.agents/teamwork/worker_remediation_admin`

## Specific Instructions
1. Read `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` and `d:\asar\.agents\teamwork\victory_auditor_1\handoff.md`.
2. Fix ESLint errors in `apps/Admin`:
   - `apps/Admin/src/App.tsx:10:18`: Replace `any` with specific type. Lines 14:1, 16:1: Replace `@ts-ignore` with `@ts-expect-error` (or remove if no longer needed).
   - `apps/Admin/src/components/orders/OrdersQueueManager.tsx:329:59`: Replace `any` with specific type.
   - `apps/Admin/src/components/plans/PlanBuilderStudio.tsx:501:54, 889:75, 903:76`: Replace `any` with specific types.
3. Verify by running:
   `npx tsc --noEmit -p apps/Admin/tsconfig.app.json`
   and check linting on modified files.
4. Write `handoff.md` with verification outputs.

