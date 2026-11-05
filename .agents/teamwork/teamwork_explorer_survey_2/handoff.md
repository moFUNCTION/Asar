# Handoff Report: Subdomain Memory Renderer Architecture

**Agent:** Subdomain Memory Renderer Explorer (`teamwork_explorer_survey_2`)  
**Parent Conversation ID:** `4c825e6f-42b7-49c9-93f4-12289ac61350`  
**Working Directory:** `d:\asar\.agents\teamwork\teamwork_explorer_survey_2`  
**Handoff Type:** Hard (Task complete)  
**Date:** 2026-11-03

---

## 1. Observation

1. **Existing Booth Memory Presentation Components:**
   - In `apps/Booth/src/components/memory/`:
     - `MemoryHeader.tsx` (lines 1–120): Sticky frosted top bar with couple title, total audio count, tabs switcher, and padlock icon (`🔒 A Private Memory For ...`).
     - `MemoryHero.tsx` (lines 1–150): Editorial couple cover photo with bottom alabaster fade, acoustic wave SVG divider (`─── ∿∿∿ ───`), 3 metadata pills (`📅 Date`, `📍 Location`, `🤍 Badge`), and bilingual romantic quote block.
     - `MemoryTabs.tsx` (lines 1–80): 5 luxury rounded tabs (`audio`, `photos`, `video`, `guestbook`, `thankyou`) styled with `#6B1D28` maroon active background.
     - `VoiceCard.tsx` (lines 1–250): Guest avatar (monogram fallback), Play/Pause button, speaker name & role, bilingual quote, **interactive 48-bar waveform scrubber** seeking audio at proportional offsets, heart like counter, and download/share dropdown menu.
     - `MemoryPinLockGate.tsx` (lines 1–183): 4-digit security PIN keypad for private memory vaults with auto-advance, backspace handling, shake error, and demo PIN helper.
     - `BoothMemoryPage.tsx` (lines 23–36 in `App.tsx` & lines 36–570 in `BoothMemoryPage.tsx`):
       - Path / query parsing currently implemented via vanilla string matching:
         ```ts
         // apps/Booth/src/App.tsx:23-35
         const getMemorySlugFromUrl = (): string | null => {
           if (typeof window === "undefined") return null;
           const path = window.location.pathname;
           if (path.startsWith("/memory/")) {
             const slug = path.replace("/memory/", "").split("/")[0].trim();
             if (slug) return slug;
           }
           const searchParams = new URLSearchParams(window.location.search);
           const memoryParam = searchParams.get("memory");
           if (memoryParam && memoryParam.trim()) {
             return memoryParam.trim();
           }
           return null;
         };
         ```
       - Hydration in `BoothMemoryPage.tsx`: checks `localStorage.getItem("asar_booth_memories_cache")` first, falling back to `DEMO_BOOTH_MEMORY`.
       - Web Audio API Telephone Chime (`apps/Booth/src/pages/BoothMemoryPage.tsx:110-139`): Synthesizes dual-tone harmonic pulse (`440Hz` and `480Hz`) through `AudioContext` before audio playback begins.

2. **Existing Invitation Custom Renderer Components:**
   - In `apps/Invitation/src/components/renderer/`:
     - `ThemeWrapper.tsx` (lines 1–95): Injects CSS variables (`--event-primary`, `--event-secondary`, `--event-bg`, `--event-card-bg`), font families (`Amiri`, `Playfair Display`, `Cairo`), text direction (`rtl` / `ltr`), and radial glow background gradients. Supports `ivory-royal` and `noir-obsidian` themes.
     - `EventHeroSection.tsx`, `EventCountdownSection.tsx`, `EventScheduleSection.tsx`, `EventLocationMap.tsx`, `EventMediaGallery.tsx`, `DynamicRsvpForm.tsx`.
     - `DynamicRsvpForm.tsx`: Dynamically renders form schema from Admin, strictly enforcing that `guestEmail` is required and locked.
     - `CustomEventPage.tsx` (lines 152–250): Resolves invitation by slug from `INVITATION_PRESETS` or `localStorage.getItem("asar_invitations_cache")`, parsing JSON configs (`themeConfigJson`, `sectionsConfigJson`, `formSchemaJson`, `scheduleJson`, `galleryJson`, `dressCodeJson`).
     - `App.tsx` (lines 16–44): Routes between `landing`, `event`, and `pass` using `window.location.search` (`?event=`, `?pass=`) and `window.location.pathname` (`/e/:slug`, `/pass/:rsvpId`).

3. **Data Models & Querying in `packages/react-appwrite`:**
   - In `packages/react-appwrite/src/AsarDomain/collections.ts` (lines 7–16):
     - `ASAR_COLLECTIONS.BOOTH_MEMORIES = "booth_memories"`
     - `ASAR_COLLECTIONS.BOOTH_VOICE_RECORDS = "booth_voice_records"`
     - `ASAR_COLLECTIONS.BOOTH_MEDIA = "booth_media"`
     - `ASAR_COLLECTIONS.INVITATIONS = "invitations"`
     - `ASAR_COLLECTIONS.INVITATION_RSVPS = "invitation_rsvps"`
   - In `packages/react-appwrite/src/AsarDomain/models.ts`:
     - `BoothMemory` (lines 114–140): Has `slug: string;` (e.g. `mina-and-maryam`). Does NOT currently have an explicit `subdomain` or `customDomain` field.
     - `AsarInvitation` (lines 244–264): Has `slug: string;` (e.g. `omar-and-layla`). Does NOT currently have an explicit `subdomain` or `customDomain` field.

4. **Admin Studio URLs & Alignment:**
   - In `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx` (line 254):
     `message: '🚀 Published successfully! Website live at http://localhost:3002?memory=${memory.slug}'`
   - In `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` (line 343):
     `const invitationUrl = 'http://localhost:3003?event=${slug}';`

5. **Monorepo Routing Dependencies:**
   - Across `package.json`, `apps/Booth/package.json`, `apps/Invitation/package.json`, `apps/Main/package.json`, `apps/Admin/package.json`:
     `react-router-dom` is **not currently installed** in any workspace.
   - All apps configure Vite with `host: "0.0.0.0"` in `vite.config.ts`, which natively allows binding incoming requests to `*.localhost:<port>` on local machines.

---

## 2. Logic Chain

1. **Subdomain Identification & Data Model Alignment:**
   - *From Observation 3:* Both `BoothMemory` and `AsarInvitation` models use `slug` as their unique URL identifier, and neither has an explicit `subdomain` field.
   - *Reasoning:* In multi-tenant web builder architectures, subdomains inherently map to tenant slugs (e.g. slug `mina-and-maryam` maps to subdomain `mina-and-maryam.asar.me`). Therefore, queries can resolve directly by `slug` in the Appwrite database (`Query.equal("slug", subdomain)`), while adding an optional `subdomain?: string` and `customDomain?: string` to `BoothMemory` and `AsarInvitation` allows clients future flexibility for vanity subdomains.

2. **Local vs Production Subdomain Resolution:**
   - *From Observation 5:* Vite servers are configured with `host: "0.0.0.0"`. Modern browsers automatically route `*.localhost` to `127.0.0.1` without hosts file modification.
   - *From Observation 1 & 2:* Existing apps and tests rely heavily on URL parameters (`?memory=...`, `?event=...`).
   - *Reasoning:* Relying solely on `window.location.hostname` in local development would break when developers test on IP addresses (e.g. `192.168.1.x`), in test runners (Vitest/Jest/JSDOM), or on older devices.
   - *Deduction:* A **4-Tier Subdomain Resolution Hierarchy** is mandatory:
     1. Query Param (`?subdomain=...` or `?memory=...` or `?event=...`)
     2. React Router Route Param (`/m/:slug` or `/memory/:slug` or `/e/:slug`)
     3. Hostname Subdomain (`subdomain.localhost` or `subdomain.asar.me`)
     4. Environment Variable fallback (`VITE_DEFAULT_SUBDOMAIN`)

3. **App Topology Evaluation (Dedicated App vs Autonomous Apps):**
   - *From Observation 1 & 2:* `apps/Booth` contains 12+ presentation components specifically built for Booth memories (Image #1 audio player, waveform scrubber, category filters, phone chime), and `apps/Invitation` contains 8+ presentation components specifically built for dynamic invitation block rendering and form schemas.
   - *Reasoning:*
     - Introducing a dedicated 5th app (`apps/Storefront` or `apps/Memory`) requires moving all 20+ memory presentation components into a new shared package (`@repo/memory-components`), updating imports across all apps, adding another Turborepo build target, and refactoring styles.
     - In contrast, introducing a shared resolution module (`@repo/react-appwrite/src/Storefront` or `useSubdomain`) allows `apps/Booth` and `apps/Invitation` to act as their own domain-specific dynamic storefront renderers.
     - When `apps/Booth` receives `subdomain.asar.me` or `?subdomain=...`, it renders `BoothMemoryPage`. When `apps/Invitation` receives `subdomain.asar.me` or `?subdomain=...`, it renders `CustomEventPage`.
     - *Deduction:* Option C (Autonomous apps backed by a unified shared `@repo/react-appwrite/src/Storefront` resolution package) minimizes churn, eliminates circular dependencies, maintains fast builds, and preserves 100% of existing component implementations.

4. **Admin Studio Alignment:**
   - *From Observation 4:* Admin studios currently hardcode `?memory=${slug}` and `?event=${slug}` on ports 3002 and 3003.
   - *Reasoning:* Because our 4-Tier resolution hierarchy supports `?subdomain=${slug}` as Tier 1, Admin studios can seamlessly update their preview links to `http://localhost:3002?subdomain=${memory.slug}` and `http://localhost:3003?subdomain=${slug}` in local dev, and `https://${slug}.booth.asar.me` in production. No existing Admin management features are broken.

---

## 3. Caveats

1. **Wildcard DNS & SSL in Production:**
   - The client-side application extracts the subdomain from `window.location.hostname`. However, in production, hosting providers (e.g. Vercel, Cloudflare Pages, AWS CloudFront) must have a Wildcard DNS record (`*.asar.me` -> CNAME) and a Wildcard SSL certificate provisioned.
2. **First-Party Appwrite Session Cookies:**
   - In local development, cookies set on `localhost:3000` are port-isolated in some browser security policies. When deep-linking between `Admin` (:3001), `Booth` (:3002), and `Invitation` (:3003), passing the session token or relying on `localStorage` preview cache (`asar_booth_memories_cache`) ensures instant preview across tabs.
3. **Alternative Interpretation Considered (Single App `apps/Storefront`):**
   - If the product owners strictly demand a single domain apex without service subdomains (`https://[subdomain].asar.me` for BOTH booth and invitations from a single Vite SPA), then moving memory presentation components to a shared package is viable, but it requires significantly more refactoring. Our detailed comparison in `analysis.md` provides the exact trade-offs.

---

## 4. Conclusion

1. **Subdomain Resolution Architecture:**
   Implement a shared storefront resolution module in `@repo/react-appwrite/src/Storefront` providing:
   - `extractSubdomainFromHostname(hostname, rootDomains)`
   - `useSubdomain(options)` hook with 4-tier fallback hierarchy
   - `resolveSubdomainMemory(subdomain, databases)` tenant fetcher
2. **App Structure Recommendation:**
   Retain the existing 4 apps (`Admin`, `Booth`, `Invitation`, `Main`) and empower `apps/Booth` and `apps/Invitation` with React Router and `useSubdomain()` to dynamically render memories when accessed via subdomains or query parameters.
3. **Data Model Updates:**
   Augment `BoothMemory` and `AsarInvitation` in `packages/react-appwrite/src/AsarDomain/models.ts` with optional `subdomain?: string` and `customDomain?: string`, defaulting to `slug`.
4. **Admin Studio Updates:**
   Update preview URL generation in `BoothMemoryStudio.tsx` and `InvitationStudio.tsx` to generate standardized `?subdomain=${slug}` URLs and validate RFC 1123 hostname compliance.

---

## 5. Verification Method

To independently verify the architecture and findings:

1. **Inspect Existing Memory Components:**
   - Review Booth presentation: `apps/Booth/src/components/memory/*` and `apps/Booth/src/pages/BoothMemoryPage.tsx`.
   - Review Invitation renderer: `apps/Invitation/src/components/renderer/*` and `apps/Invitation/src/pages/CustomEventPage.tsx`.
   - Verify PIN gate: `apps/Booth/src/components/memory/MemoryPinLockGate.tsx`.

2. **Inspect Domain Models & Collections:**
   - Review `packages/react-appwrite/src/AsarDomain/models.ts` (lines 114–140 for `BoothMemory`, lines 244–264 for `AsarInvitation`).
   - Review `packages/react-appwrite/src/AsarDomain/collections.ts` (lines 7–16 for collection keys).

3. **Verify Vite Host Binding:**
   - Check `apps/Booth/vite.config.ts`, `apps/Invitation/vite.config.ts`, `apps/Main/vite.config.ts`: verify `host: "0.0.0.0"` is enabled.

4. **Verify TypeScript & Linting Across Monorepo:**
   - Run type checks: `npx turbo run build --filter=@repo/react-appwrite` or `npx tsc --noEmit` on modified apps.
   - Run linter: `npx turbo run lint`.

5. **Invalidation Conditions:**
   - If a cloud edge router is deployed that inspects the Appwrite database at the CDN layer to rewrite requests before reaching Vite SPAs, the client-side memory type dispatch logic would become redundant.
