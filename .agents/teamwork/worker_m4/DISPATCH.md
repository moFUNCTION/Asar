## 2026-11-05T14:03:35Z

You are worker_m4, a teamwork_worker subagent.
Your working directory is d:\asar\.agents\teamwork\worker_m4.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and the survey findings at:
d:\asar\.agents\teamwork\explorer_admin_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION (Milestone 4: Arabic RTL Admin Dashboard & Right-Hand Vertical Tabs):

1. Admin Shell Right-Hand Vertical Tabs Navigation Redesign:
   - In `apps/Admin/src/components/layout/AdminShell.tsx`:
     - Replace the top horizontal pill tab bar with a sleek **Right-Hand Vertical Tabs Navigation Menu** tailored for Arabic RTL layout.
     - Structure the root layout as a flex container (`direction={{ base: "column", md: "row" }}`).
     - In RTL (`dir="rtl"` in `apps/Admin/index.html`), place the navigation sidebar on the physical right: `<Box as="aside" w={{ base: "100%", md: "280px" }} minH={{ md: "100vh" }} borderLeft="1px solid ...">`.
     - In the right sidebar: render brand crest/logo, admin user profile badge with signout, and vertical navigation tab buttons:
       - `overview`: "لوحة العمليات والملخص" (Overview)
       - `plans`: "بناء وتعديل الباقات" (Plan Builder)
       - `orders`: "الطلبات والمدفوعات" (Orders & Receipts Queue with pending badge count)
       - `booth-studio`: "استوديو هاتف أثر" (Booth Memory Studio)
       - `invitation-studio`: "استوديو الدعوات الرقمية" (Invitation Studio)
       - `users`: "المستخدمين والأدوار" (Users & RBAC)
     - Active tab styling: Deep royal maroon background accent (`#7A1C2E`), warm cream text (`#FBF8F3`), and subtle gold indicator line on the right edge.
     - Provide a mobile drawer toggle for screens below `md` breakpoint.
     - Main content canvas on the left (`<Box as="main" flex="1" p={{ base: 4, md: 8 }}>{children}</Box>`).
2. Comprehensive Arabic RTL Localization across `apps/Admin`:
   - In `apps/Admin/src/pages/AdminOverview.tsx`: Translate all English KPI titles and pipeline stage headers to Arabic (`إجمالي الحجوزات`, `إيصالات بانتظار المراجعة`, `جلسات الاستوديو النشطة`, etc.).
   - In `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx`: Translate English action buttons, header texts, and category labels to Arabic.
   - In `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`: Translate English labels, tabs, and inspector titles to Arabic.
3. Testing & Verification:
   - Run typecheck: `npx tsc -b apps/Admin`.
   - Run tests: `npm test` and `npx tsx --test "test/e2e/tier1-feature-coverage/tier1-admin-dashboard.test.ts"`.

FILE OWNERSHIP:
You EXCLUSIVELY own:

- `d:\asar\apps\Admin\src\components/layout/AdminShell.tsx`
- `d:\asar\apps\Admin\src\pages/AdminOverview.tsx`
- `d:\asar\apps\Admin\src\components/booth-studio/BoothMemoryStudio.tsx`
- `d:\asar\apps\Admin\src\components/invitation-studio/InvitationStudio.tsx`
  Do NOT modify files in `apps/Main`, `apps/Booth`, `apps/Invitation`, or `packages/*`.

USER RULES:

- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

When finished, write your handoff report to:
`d:\asar\.agents\teamwork\worker_m4\handoff.md`
and notify the orchestrator via send_message.
