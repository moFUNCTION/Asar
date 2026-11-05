# Milestone 2: Dedicated Renderer App Scaffolding & Routing Architecture

## Context
You are a worker implementing Milestone 2 of the ASAR monorepo update.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

## Exclusive Write Ownership
You own and may ONLY edit files within:
`apps/Renderer/*`

## Objectives
1. Scaffold `apps/Renderer` under `apps/` with:
   - `package.json`: name `"Renderer"`, port 3004 scripts, dependencies on `@repo/react-appwrite`, `@repo/ui-components`, `react-router-dom@^6.28.0`, `@chakra-ui/react`, etc. (inspect `apps/Booth/package.json` for exact version alignment).
   - `vite.config.ts`: port 3004, host `"0.0.0.0"`.
   - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: matching monorepo conventions.
   - `index.html`: luxury fonts and meta tags.
   - `src/vite-env.d.ts`.
2. Configure Entry Point & Master Route Tree:
   - `src/main.tsx`: wraps with `BrowserRouter`, `ChakraProvider`, and `AppwriteProvider`.
   - `src/App.tsx`: master `<Routes>` tree:
     - `/`: `<DynamicStorefrontIndex />` (dynamically resolves subdomain; if slug present renders memory or placeholder, if bare apex renders `<StorefrontShowcasePortal />`).
     - `/s/:slug`: universal memory path.
     - `/booth/:slug`, `/memory/:slug`, `/m/:slug`: explicit booth memory routes.
     - `/invitation/:slug`, `/event/:slug`, `/e/:slug`: explicit invitation memory routes.
     - `/pass/:rsvpId`: VIP pass route.
     - `*`: `<StorefrontNotFound />` luxury 404.
3. Subdomain Resolution & Fallback Engine:
   - `src/pages/DynamicStorefrontIndex.tsx`:
     - Leverages `useSubdomain` from `@repo/react-appwrite` and React Router `useParams`, `useSearchParams`.
     - Supports 4-tier resolution (RFC 6761 `*.localhost`, query parameter `?subdomain=...`, path `/s/:slug`, bare apex).
     - Resolves memory classification:
       - If slug is `"mina-and-maryam"` or in `asar_booth_memories_cache` -> classified as `booth`.
       - If slug is `"omar-and-layla"` or in `asar_invitations_cache` -> classified as `invitation`.
       - If slug is empty on bare apex -> renders `<StorefrontShowcasePortal />`.
       - If slug is reserved or unknown -> renders `<StorefrontNotFound />`.
4. Showcase Portal & 404 Pages:
   - `src/pages/StorefrontShowcasePortal.tsx`: Luxury showcase portal with interactive cards for Booth and Invitation memories with test links (`?subdomain=...`, `[slug].localhost:3004`, `/s/...`).
   - `src/pages/StorefrontNotFound.tsx`: Branded luxury 404 page.
5. Verification:
   - Run `npx tsc --noEmit -p apps/Renderer/tsconfig.json` (must exit 0 with 0 errors).
   - User Rule: DO NOT run `npm run build` without reason. Use `tsc --noEmit`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report to `d:\asar\.agents\teamwork\worker_milestone_2\handoff.md` and send a message back.


## 2026-11-03T22:22:21Z
[Message] timestamp=2026-11-03T22:22:21Z sender=5b9b91d8-2ae1-48a5-9c39-c7909b1a52d5 priority=MESSAGE_PRIORITY_HIGH content=You are worker_milestone_2 (Role: Renderer App Scaffolding Worker).
Your working directory is d:\asar\.agents\teamwork\worker_milestone_2\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\worker_milestone_2\DISPATCH.md before starting work.
Scope document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

Exclusive Write Ownership:
`apps/Renderer/*`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 2:
1. Scaffold `apps/Renderer` under `apps/` with `package.json` (port 3004), `vite.config.ts`, `tsconfig.json`, `index.html`.
2. Configure React Router v6 in `src/main.tsx` and declarative `<Routes>` tree in `src/App.tsx`.
3. Implement `src/pages/DynamicStorefrontIndex.tsx` with 4-tier subdomain resolution (`useSubdomain`) supporting RFC 6761 `*.localhost`, query parameter override (`?subdomain=...`), path routing (`/s/:slug`, `/booth/:slug`, `/invitation/:slug`), and bare apex (`http://localhost:3004/`).
4. Implement `src/pages/StorefrontShowcasePortal.tsx` and `src/pages/StorefrontNotFound.tsx`.
5. Verify `npx tsc --noEmit -p apps/Renderer/tsconfig.json` exits 0 with zero errors.
User rule: DO NOT over run npm run build without reason. Do not make scripts or code generators unless needed.

Write handoff to d:\asar\.agents\teamwork\worker_milestone_2\handoff.md and send a message back when complete.
