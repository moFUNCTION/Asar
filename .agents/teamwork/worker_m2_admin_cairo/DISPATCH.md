## 2026-11-05T16:56:24Z
You are worker_m2_admin_cairo, a teamwork_worker subagent.
Your working directory is: d:\asar\.agents\teamwork\worker_m2_admin_cairo

EXCLUSIVE WRITE OWNERSHIP:
You own ONLY the following files and directories:
- `apps/Admin/**/*`
Do NOT edit files in `appwrite/functions`, `apps/Booth`, `apps/Invitation`, `apps/Main`, or `apps/Renderer`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER GLOBAL CONSTRAINTS:
- Do NOT run npm run build without reason.
- Do NOT make unnecessary scripts or code generators.
- The team must NOT: Use pre-built libraries or frameworks for core functionality.

MANDATORY FIRST STEP:
Read:
- `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md`
- `d:\asar\PROJECT.md`
- `d:\asar\.agents\teamwork\explorer_admin_and_auth\admin_auth_report.md`
- `d:\asar\.agents\teamwork\explorer_admin_and_auth\handoff.md`
- `docs/ASAR_DESIGN_SYSTEM.md`

YOUR MISSION & TASKS:
1. Fix all TypeScript compilation errors in `apps/Admin`:
   - `AdminShell.tsx(356, 367)`: Accesses undeclared `profile`. Properly obtain profile from `useAdminAuth` / `AppUserRecord` or user object.
   - `UsersManager.tsx`: Fix undeclared `fetchUsers` and `isLoading`. Fix document type mismatches in `App.tsx` and `UsersManager.tsx`.
   - Remove any unused variables causing strict errors.

2. Universal Cairo Typography & Luxury UI Redesign:
   - In `apps/Admin/src/index.css`: Define `--font-sans` and `--font-mono`. Set `--font-arabic-display: 'Cairo', system-ui, -apple-system, sans-serif;` so all operational headers, badges, buttons, and navigation render in Cairo font across the admin dashboard.
   - In theme/tokens: Ensure Chakra UI v3 `--chakra-fonts-heading` and `--chakra-fonts-body` bind to `'Cairo'`.
   - Replace raw hex codes (`#7A1C2E`, `#FBF8F3`, etc.) with design system tokens (`--athar-maroon`, `--athar-bg-primary`, `--athar-gold`).
   - Add backdrop click dismiss to mobile drawer in `AdminShell.tsx`.
   - Replace hardcoded `http://localhost:3000/account` with dynamic origin resolution.

3. Flawless Luxury Authentication Journey:
   - Redesign `AdminLoginView.tsx` with split-screen luxury layout adhering to Warm Vintage Editorial design, utilizing Cairo typography, and real form validation.
   - Add password recovery flow (`account.createRecovery`).
   - Remove demo bypass button and hardcoded fallback credentials.
   - Ensure robust session restoration in `useAdminAuth.ts` and `AppwriteProvider`, eliminating 401 cold-reload race conditions.
   - Wire `UsersManager.tsx` role toggle to call `sync-user-role` cloud function or Appwrite Teams API.

4. Connect Admin Studios to Real Appwrite Data:
   - `BoothMemoryStudio.tsx`: Remove `DEFAULT_ORDERS` fallback; load real orders from Appwrite; wire publish to `databases.createDocument` / `databases.updateDocument` and chunked upload.
   - `InvitationStudio.tsx`: Remove `DEMO_ORDERS` fallback; load real orders.
   - `PlanBuilderStudio.tsx`: Wire plan creation and deletion to call `databases.createDocument` and `databases.deleteDocument`.
   - `OrdersQueueManager.tsx`: Call `updatePaymentDoc` to update payment status in `payments` collection.

5. Verification:
   - Verify TypeScript compilation: `npx tsc -p apps/Admin/tsconfig.app.json --noEmit` -> Must produce 0 errors.
   - Verify unit tests: `npx tsx --test apps/Admin/test/*.ts` -> All must pass.

6. Deliverables:
   - Write detailed `handoff.md` in your working directory.
   - Send completion message to parent orchestrator.
