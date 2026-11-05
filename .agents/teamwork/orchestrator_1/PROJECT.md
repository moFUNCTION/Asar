# Project: ASAR Monorepo Architecture Update — Dedicated Dynamic Subdomain Renderer & Monorepo React Router

## Architecture

The ASAR platform is a multi-tenant luxury audio guestbook and digital invitation platform engineered as a Turborepo monorepo (`turbo.json`, npm workspaces `apps/*`, `packages/*`):

- `packages/react-appwrite`: Shared domain models, Appwrite collection/bucket constants, order pipeline state machines, Web Audio analyzer, EmailJS dispatch service, and the **Storefront Subdomain Engine** (`extractSubdomain`, `useSubdomain`, `validateSubdomainSlug`, `buildMemoryUrls`, `cacheHelper`).
- `apps/Renderer` (NEW): The dedicated dynamic storefront renderer app running on **Port 3004**. Functions as the multi-tenant storefront runtime (similar to Shopify storefronts or Webflow hosting). Detects dynamic subdomains (RFC 6761 `*.localhost`, production `*.asar.me`), supports fallback path/query routing (`/s/:slug`, `?subdomain=...`), classifies memory type, and conditionally renders either **Booth Memories** or **Invitation Memories**, with a luxury Showcase Portal on bare apex and a luxury 404 screen.
- `apps/Admin`: Luxury management console (Port 3001) with React Router v6 declarative routes, dynamic plans builder, order queue pipeline with receipt verification, split-screen bulk voice record studio, and invitation form builder. Generates canonical URLs and QR codes aligned with the dedicated renderer app.
- `apps/Booth`: Audio guestbook marketing landing, booking wizard, and booth experience (Port 3002).
- `apps/Invitation`: Digital invitation showcase landing and booking flow (Port 3003).
- `apps/Main`: Client platform gateway and customer account portal (Port 3000) with React Router v6 nested routes (`/account/*`).
- `packages/UI-components`: 21 luxury UI components (`GradientWaves`, `BlurText`, `SplitText`, `TiltedCard`, etc.).

### Dynamic Subdomain Storefront Model
- **Production**: `https://[subdomain].asar.me` or `https://[subdomain].asar.audio` routed to the dynamic renderer app.
- **Local Development**: RFC 6761 `http://[subdomain].localhost:3004` (native browser loopback to 127.0.0.1) and fallback routing via path (`http://localhost:3004/s/[slug]`, `/memory/[slug]`, `/e/[slug]`) or query parameter (`http://localhost:3004?subdomain=[slug]`).
- **4-Tier Resolution Hierarchy**:
  1. Tier 1: Query parameter (`?subdomain=...`, `?memory=...`, `?event=...`)
  2. Tier 2: Route parameter (`options.routeParam`, e.g. `/s/:slug`, `/memory/:slug`, `/e/:slug`)
  3. Tier 3: Hostname subdomain (`[slug].localhost` or `[slug].asar.me`)
  4. Tier 4: Fallback subdomain

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Storefront URL Builder Alignment | Update `buildMemoryUrls` in `@repo/react-appwrite` to support `rendererPort: 3004` and `devRendererUrl` while preserving backward compatibility | M1 | ORIGINAL_REQUEST §R2, §R3 |
| 2 | Cache Normalization Helper | Defensive handling of single-object vs array schemas in `localStorage` caches (`asar_booth_memories_cache`, `asar_invitations_cache`) | M1 | Survey Explorer 2 |
| 3 | Dedicated Renderer App Scaffolding | Establish `apps/Renderer` with Vite, TS config, `@repo/react-appwrite` & `@repo/ui-components` dependencies, assigned to Port 3004 | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Dedicated Renderer React Router Tree | Declarative React Router v6 tree with root dynamic index, explicit paths (`/s/:slug`, `/booth/:slug`, `/memory/:slug`, `/invitation/:slug`, `/event/:slug`, `/pass/:rsvpId`), and 404 | M2 | ORIGINAL_REQUEST §R1, §R2 |
| 5 | Dynamic Subdomain Resolver & Fallback Hook | Integrate `useSubdomain` in `apps/Renderer` supporting RFC 6761 `*.localhost`, query overrides (`?subdomain=`), and path routing | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Bare Root Showcase Portal | Render luxury Storefront Showcase Portal displaying live selector cards for Booth and Invitation memories when accessed at bare `localhost:3004/` | M2 | Survey Explorer 1, 2 |
| 7 | Dynamic Memory Type Classifier | Classify requested slugs into Booth Memory vs Invitation Memory using route hints, presets, caches, or Appwrite queries | M3 | ORIGINAL_REQUEST §R2 |
| 8 | Dynamic Booth Memory Storefront Renderer | Full interactive Booth Memory experience with 48-peak waveform audio player, categories, photo gallery, 30s video, guestbook, PIN lock | M3 | ORIGINAL_REQUEST §R2 |
| 9 | Dynamic Invitation Memory Storefront Renderer | Full interactive Invitation Memory experience with themes, live countdown ticker, schedule timeline, venue map, dynamic RSVP form, VIP pass | M3 | ORIGINAL_REQUEST §R2 |
| 10 | Luxury Storefront 404 Screen | Branded editorial 404 screen when a requested memory slug is invalid, reserved, or not found | M3 | ORIGINAL_REQUEST §R2 |
| 11 | Monorepo React Router Consistency | Verify and maintain consistent React Router v6 setup across all apps (`apps/Main`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Renderer`) | M4 | ORIGINAL_REQUEST §R1 |
| 12 | Admin Template Management Alignment | Ensure Admin studios (`BoothMemoryStudio`, `InvitationStudio`, `HeroAndTextsEditor`) link to renderer dev URLs and generate correct canonical QR codes | M4 | ORIGINAL_REQUEST §R3 |
| 13 | Monorepo TypeScript Clean Compilation | Ensure zero `tsc --noEmit` errors across all apps and packages in the monorepo | M4 | ORIGINAL_REQUEST §Acceptance |
| 14 | Automated Subdomain & Fallback Routing Tests | Automated unit/integration tests for RFC 6761 `*.localhost`, query param fallback, path fallback, and reserved subdomains | M5 | ORIGINAL_REQUEST §R4 |
| 15 | Automated Conditional Memory Rendering Tests | Automated tests verifying Booth vs Invitation classification, slug resolution, and 404 fallback | M5 | ORIGINAL_REQUEST §R4 |
| 16 | Final Verification, Adversarial Stress & Audit | Independent Reviewer, Challenger stress harness, and Forensic Integrity Audit verification | M6 | ORIGINAL_REQUEST §Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Shared Storefront Engine & URL Alignment | `packages/react-appwrite/src/Storefront/*` | none | DONE |
| M2 | Dedicated Renderer App Scaffolding & Routing Architecture | `apps/Renderer` (Vite 3004, React Router, Subdomain Resolver, Showcase Portal) | M1 | DONE |
| M3 | Dynamic Storefront Memory Renderers | `apps/Renderer` (Booth Memory, Invitation Memory, Classifier, 404) | M2 | DONE |
| M4 | Monorepo React Router Alignment & Admin Integration | `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main` verification & `tsc --noEmit` | M1, M2, M3 | DONE |
| M5 | Automated Testing Suite (Unit & Integration) | `apps/Renderer/test/*`, monorepo test verification | M3, M4 | DONE |
| M6 | Verification, Adversarial Stress Testing & Forensic Audit | Monorepo-wide multi-agent review, stress tests, forensic integrity audit | M1..M5 | DONE |

---

## Interface Contracts

### 1. `packages/react-appwrite/src/Storefront` -> `apps/Renderer` and `apps/Admin`
- `extractSubdomain(hostname: string, options?: ExtractSubdomainOptions): string | null`
- `validateSubdomainSlug(slug: string): { isValid: boolean; error?: string }`
- `buildMemoryUrls(params: { slug: string; type: "booth" | "invitation"; port?: number; rendererPort?: number; isDev?: boolean; rootDomain?: string }): MemoryUrls`
  - `canonicalUrl`: `https://${slug}.asar.me`
  - `devLocalhostUrl`: `http://${slug}.localhost:${port}`
  - `devRendererUrl`: `http://${slug}.localhost:${rendererPort || 3004}`
  - `devQueryUrl`: `http://localhost:${port}?subdomain=${slug}`
- `useSubdomain(options?: UseSubdomainOptions): { subdomain: string | null; isSubdomain: boolean; source: "query" | "param" | "hostname" | "fallback" | null }`
- `getNormalizedCache<T>(key: string, storageOverride?): T[]`
- `findInCache<T>(cacheOrKey, identifier, storageOverride?): T | null`

### 2. `apps/Renderer` Route Tree Contract
- `/`: `DynamicStorefrontIndex` -> resolves subdomain via `useSubdomain`. If slug present -> renders classified memory view (`BoothMemoryRenderer` or `InvitationMemoryRenderer`). If bare apex (`localhost:3004/`) -> renders `StorefrontShowcasePortal`.
- `/s/:slug`: Universal memory route.
- `/booth/:slug`, `/memory/:slug`, `/m/:slug`: Explicit Booth memory route.
- `/invitation/:slug`, `/event/:slug`, `/e/:slug`: Explicit Invitation memory route.
- `/pass/:rsvpId`: VIP QR Guest Pass route.
- `*`: `StorefrontNotFound` luxury 404.

### 3. `apps/Admin` Integration Contract
- `BoothMemoryStudio` and `InvitationStudio` consume updated `buildMemoryUrls`. Canonical URLs and QR cards target `https://${slug}.asar.me`. Dev preview links can open port 3004 (`devRendererUrl`).
- Admin management workflows for memory templates, booth memories, and invitations remain completely unchanged.

---

## Code Layout

- `packages/react-appwrite/src/Storefront/`:
  - `subdomain.ts`: Subdomain parser, RFC 1123 validator, reserved list
  - `urlBuilder.ts`: Canonical and dev URL generator
  - `useSubdomain.ts`: 4-tier resolution React hook
  - `cacheHelper.ts`: Defensive localStorage cache retriever
  - `index.ts`: Public exports
- `apps/Renderer/`:
  - `package.json`: Renderer workspace package (port 3004)
  - `vite.config.ts`: Vite server config on port 3004
  - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript configurations
  - `index.html`: Web builder storefront HTML entry
  - `src/main.tsx`: React DOM root with `BrowserRouter`, ChakraProvider, AppwriteProvider
  - `src/App.tsx`: React Router v6 route tree
  - `src/pages/DynamicStorefrontIndex.tsx`: Dynamic subdomain resolution & classifier
  - `src/pages/StorefrontShowcasePortal.tsx`: Apex storefront portal with interactive cards
  - `src/pages/StorefrontNotFound.tsx`: Luxury 404 screen
  - `src/components/booth/BoothMemoryRenderer.tsx`: Full interactive Booth memory experience
  - `src/components/invitation/InvitationMemoryRenderer.tsx`: Full interactive Invitation experience
  - `test/subdomainResolution.test.ts`: Automated tests for 4-tier resolution and fallback
  - `test/memoryClassifier.test.ts`: Automated tests for memory classification
  - `test/storefrontRouting.test.ts`: Automated tests for React Router navigation and paths
- `apps/Admin/`: Management console maintaining zero-regression compatibility
- `apps/Booth/`, `apps/Invitation/`, `apps/Main/`: Monorepo applications with React Router v6
