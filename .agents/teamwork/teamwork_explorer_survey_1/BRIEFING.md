# BRIEFING — 2026-11-03T16:56:15Z

## Mission
Investigate monorepo-wide client-side routing across all applications in `apps/*` (Admin, Booth, Invitation, Main, etc.) and produce detailed architectural design and handoff reports.

## 🔒 My Identity
- Archetype: explorer
- Roles: Monorepo Routing Explorer
- Working directory: d:\asar\.agents\teamwork\teamwork_explorer_survey_1
- Original parent: 4c825e6f-42b7-49c9-93f4-12289ac61350
- Milestone: Routing Architecture Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT edit or create any source code files
- Write only to working directory d:\asar\.agents\teamwork\teamwork_explorer_survey_1
- Do not run npm run build without reason

## Current Parent
- Conversation ID: 4c825e6f-42b7-49c9-93f4-12289ac61350
- Updated: 2026-11-03T13:47:10Z

## Investigation State
- **Explored paths**:
  - `apps/Admin` (package.json, vite.config.ts, tsconfig, main.tsx, App.tsx, layout, studios, test)
  - `apps/Booth` (package.json, vite.config.ts, tsconfig, main.tsx, App.tsx, pages, sections, memory, test)
  - `apps/Invitation` (package.json, vite.config.ts, tsconfig, main.tsx, App.tsx, pages, renderer, pass, test)
  - `apps/Main` (package.json, vite.config.ts, tsconfig, main.tsx, App.tsx, home, account, mailbox, test)
  - `packages/react-appwrite`, `packages/UI-components`, `packages/typescript-config`
  - Root `package.json`, `turbo.json`, `docs/ASAR_PROJECT_ARCHITECTURE.md`
- **Key findings**:
  1. `react-router-dom` is currently 0% installed anywhere in the monorepo.
  2. All 4 apps currently manage navigation via internal `useState` (tabs/views) or pseudo-routers (`window.location.search`, `window.history.pushState`, `popstate` listeners).
  3. Cross-app links and QR code generators currently hardcode `http://localhost:300X?memory=...` and `?event=...` query strings.
  4. React version is pinned via root `overrides` to `18.2.0`, which perfectly supports `react-router-dom@^6.28.0`.
  5. Chakra UI v3 exports `<Link>`, requiring aliased imports (`RouterLink`) or `asChild` composition to avoid type/component collisions.
  6. Subdomain routing requires a unified resolution algorithm supporting RFC 6761 `.localhost`, query parameter fallbacks (`?subdomain=...`), and production wildcard subdomains.
- **Unexplored areas**: None. Full monorepo routing landscape examined.

## Key Decisions Made
- Document target route map for each application.
- Recommend `react-router-dom@^6.28.0` for 100% stable compatibility with React 18 and TypeScript 5.5.
- Provide clear blueprints for converting tab buttons and callback-based navigation to `<NavLink>` and `useNavigate()`.
- Propose architecture for Subdomain-Driven Dynamic Memory Renderer (R2).

## Artifact Index
- DISPATCH.md — Dispatch message record
- BRIEFING.md — Working memory & state index
- progress.md — Liveness heartbeat
- analysis.md — Full technical analysis and routing design
- handoff.md — 5-component self-contained handoff report
