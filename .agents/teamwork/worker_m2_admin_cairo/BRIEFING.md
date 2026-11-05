# BRIEFING — 2026-11-05T16:57:00Z

## Mission
Fix TypeScript errors, implement universal Cairo typography and luxury redesign, build flawless authentication flow, and connect admin studios to real Appwrite data in `apps/Admin`.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: d:\asar\.agents\teamwork\worker_m2_admin_cairo
- Original parent: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Milestone: M2 Admin & Cairo Typography

## 🔒 Key Constraints
- Exclusive write ownership: `apps/Admin/**/*` only.
- Do NOT edit files in `appwrite/functions`, `apps/Booth`, `apps/Invitation`, `apps/Main`, or `apps/Renderer`.
- User global constraint: Do NOT run npm run build without reason.
- User global constraint: Do NOT make scripts or code generators without reason.
- The team must NOT: Use pre-built libraries or frameworks for core functionality.
- Integrity: All implementations must be genuine, maintaining real state and behavior.

## Current Parent
- Conversation ID: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Updated: 2026-11-05T16:57:00Z

## Task Summary
- **What to build**:
  1. Fix TypeScript errors in AdminShell.tsx, UsersManager.tsx, and App.tsx.
  2. Implement universal Cairo typography, luxury CSS tokens, dynamic origin resolution, mobile drawer backdrop dismissal.
  3. Redesign AdminLoginView with split-screen luxury layout, password recovery, real form validation, no demo bypass, robust session restoration, and real role syncing.
  4. Connect BoothMemoryStudio, InvitationStudio, PlanBuilderStudio, and OrdersQueueManager to real Appwrite data.
  5. Verify via `npx tsc -p apps/Admin/tsconfig.app.json --noEmit` and unit tests.
- **Success criteria**:
  - `npx tsc -p apps/Admin/tsconfig.app.json --noEmit` produces 0 errors.
  - Tests in `apps/Admin/test/*.ts` pass.
  - Real Appwrite integration in all studios without demo fallback mocks.
- **Interface contracts**: PROJECT.md, docs/ASAR_DESIGN_SYSTEM.md

## Change Tracker
- **Files modified**: none yet
- **Build status**: pending initial check
- **Pending issues**: none

## Quality Status
- **Build/test result**: pending
- **Lint status**: pending
- **Tests added/modified**: pending

## Key Decisions Made
- Will verify current TypeScript errors with `npx tsc -p apps/Admin/tsconfig.app.json --noEmit` before making changes.

## Artifact Index
- `d:\asar\.agents\teamwork\worker_m2_admin_cairo\DISPATCH.md` — Dispatch prompt
- `d:\asar\.agents\teamwork\worker_m2_admin_cairo\progress.md` — Progress tracker
- `d:\asar\.agents\teamwork\worker_m2_admin_cairo\handoff.md` — Final handoff
