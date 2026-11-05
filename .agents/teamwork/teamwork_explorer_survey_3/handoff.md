# Handoff Report: Admin Alignment & Architecture Explorer

## 1. Observation
1. **Admin Navigation & Routing Implementation:**
   - In `apps/Admin/src/App.tsx`, lines 218–281: navigation is implemented via React state (`const [activeTab, setActiveTab] = useState<AdminTab>("overview")`) and conditional component rendering (`{activeTab === "overview" && ...}`).
   - In `apps/Admin/package.json`, lines 12–19: `dependencies` include `@chakra-ui/react`, `@emotion/react`, `@repo/react-appwrite`, `appwrite`, `react`, and `react-dom`. `react-router-dom` is **not** present.
   - Ripgrep pattern search across `d:\asar` for `react-router` returned 0 occurrences across all apps.
2. **Hardcoded Ports and Query-Param URLs in Admin:**
   - In `apps/Admin/src/components/layout/AdminShell.tsx`, lines 111–171: ecosystem links are hardcoded:
     - Line 112: `href="http://localhost:3000"` (Main Hub)
     - Line 132: `href="http://localhost:3002"` (Booth App)
     - Line 153: `href="http://localhost:3003"` (Invitation App)
   - In `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx`:
     - Line 103: `<span className="athar-badge-gold">🌐 /memory/{memory.slug || "slug"}</span>`
     - Line 116: `onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}`
     - Line 120: `Live link: <code>http://localhost:3002?memory={memory.slug}</code>`
   - In `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx`:
     - Line 254: `message: "🚀 Published successfully! Website live at http://localhost:3002?memory=${memory.slug}"`
   - In `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx`:
     - Line 43: `const landingUrl = "http://localhost:3002?memory=${memory.slug || "mina-and-maryam"}";`
     - Line 44–46: QR code API URL constructed using `encodeURIComponent(landingUrl)`
     - Line 466: `<a href={landingUrl} target="_blank" rel="noopener noreferrer">Open Live Memory Page ↗</a>`
   - In `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`:
     - Line 301: `qrCodeUrl: "http://localhost:3003?event=${slug}"`
     - Line 334: `showToast("🚀 Custom Invitation Published! URL: http://localhost:3003?event=${slug}", "success")`
     - Line 343: `const invitationUrl = "http://localhost:3003?event=${slug}";`
     - Line 842–844: QR code API URL constructed using `encodeURIComponent(invitationUrl)`
     - Line 854: displays `{invitationUrl}`
3. **Admin Memory Template Management:**
   - In `apps/Admin/src/components/plans/PlanBuilderStudio.tsx`, lines 5–41: defines `AsarPlanLimits` (`coverageHours`, `maxVoiceRecords`, `maxGalleryPhotos`, `hasVideoHighlight`, `hasGuestBookTab`, `allowBulkZipDownload`, `hostingDurationDays`, `maxRsvpCapacity`) and `AsarPlan`.
   - Lines 46–180: provides initial seed plans `DEFAULT_INITIAL_PLANS` for Booth and Invitation. Plans govern quotas and feature toggles, but do not encode URLs or subdomains.
4. **Current Architecture Documentation State:**
   - In `docs/ASAR_PROJECT_ARCHITECTURE.md`:
     - Line 98: depicts Booth as `apps/Booth (Port 3002) ... Generated Client Memory Website (/memory/:slug)`.
     - Line 99: depicts Invitation as `apps/Invitation (Port 3003) ... Generated Custom Event Website (/e/:slug)`.
     - Line 120: `Because Main (:3000), Admin (:3001), Booth (:3002), and Invitation (:3003) run on separate ports in development (and either subdomains or path-based routes in production)...` (only mention of the word 'subdomain' in the document).
     - Lines 212–270 (§ 4.4): describes Booth Memory Website as located at `apps/Booth` route `/memory/:slug`.
     - Lines 343–382 (§ 5.1): describes Invitation custom events at `/e/:slug`.

## 2. Logic Chain
1. From Observation 1, `apps/Admin` and all other `apps/*` currently lack React Router, utilizing React state and browser window history hacks. Adopting React Router requires adding `react-router-dom` to `apps/Admin/package.json` and replacing `activeTab` state in `App.tsx` with a declarative `<Routes>` tree (`/overview`, `/plans`, `/orders`, `/booth-studio/:orderId?`, `/invitation-studio/:orderId?`).
2. From Observation 2, all public memory URLs and preview links in Admin (`HeroAndTextsEditor`, `BoothMemoryStudio`, `MediaAndTabsEditor`, `InvitationStudio`) currently hardcode query params (`?memory=...`, `?event=...`) on ports 3002 and 3003.
3. To align with the dynamic subdomain renderer architecture (`https://[subdomain].asar.me`), Admin must not rely on hardcoded ports. Instead, a centralized URL builder helper (`buildMemoryUrls`) must construct canonical public subdomain URLs (`https://${slug}.asar.me`) for production and printable QR codes, while providing local dev fallbacks (`http://${slug}.localhost:PORT` or `http://localhost:PORT?subdomain=${slug}`).
4. In both `BoothMemory` (Observation 2) and `AsarInvitationDocument` (Observation 2), the data entity already contains a `slug` string field. In the dynamic subdomain architecture, `slug == subdomain`. Because DNS hostnames have strict syntax rules (RFC 1123), Admin must enforce DNS slug validation (1–63 characters, `a-z0-9-`, no leading/trailing hyphens) and prevent collision with reserved infrastructure subdomains (`admin`, `api`, `booth`, `main`, etc.).
5. From Observation 3, Plan templates manage system quotas (`maxVoiceRecords`, `hasVideoHighlight`, etc.) and do not touch subdomain routing. Admin management flows (plans, order pipeline, payment verification, and studio editing) can be seamlessly preserved without regressions.
6. From Observation 4, `docs/ASAR_PROJECT_ARCHITECTURE.md` currently documents path-based memory rendering (`/memory/:slug`, `/e/:slug`) and lacks specifications for React Router and dynamic subdomain resolution. A comprehensive update of Sections 1, 2, 3, 4, 5, 7, and 8 of the architecture document is required to align documentation with the new architecture.

## 3. Caveats
1. **Local DNS Wildcard Limitations on Windows:** While modern Chromium browsers natively resolve `*.localhost` (e.g. `mina-and-maryam.localhost:3002`) to loopback `127.0.0.1`, some tools, mobile emulators, or Safari may not resolve subdomains of localhost without modifying `hosts`. Therefore, the Admin URL helper must always supply the query parameter fallback (`?subdomain=...`) during local development.
2. **Appwrite Database Slug Uniqueness:** In Appwrite collections `booth_memories` and `invitations`, the `slug` attribute should have a Unique Index. Because Booth memories and Invitation memories are separate collections, Admin should enforce uniqueness across both collections to prevent subdomain collisions between a booth memory and an invitation event.
3. **In-App Mobile Preview vs. External Subdomain Resolution:** The in-app split-screen previews (`LiveMemoryMobilePreview` and `LiveInvitationPreview`) render local React state directly. They must NOT be replaced with iframes pointing to subdomains, as that would introduce CORS issues, latency, and break uncommitted editing workflows.

## 4. Conclusion
1. **React Router Adoption in Admin:** Replace state-based tab routing in `apps/Admin/src/App.tsx` with React Router v6 routes (`/overview`, `/plans`, `/orders`, `/booth-studio/:orderId?`, `/invitation-studio/:orderId?`). Deep-linking by order ID is immediately enabled.
2. **Subdomain Slug Alignment in Admin:**
   - Enforce DNS-compliant slug validation (`validateSubdomainSlug`) with reserved subdomain protection.
   - Update `HeroAndTextsEditor.tsx` and `InvitationStudio.tsx` to display the public canonical URL `https://${slug}.asar.me`.
   - Update `MediaAndTabsEditor.tsx` (QR Kit) and `InvitationStudio.tsx` to encode the canonical subdomain URL into generated QR codes.
3. **Zero-Regression Guarantee:** Existing Admin workflows—Plan Quotas, 7-Stage Order Pipeline, Payment Receipt Inspector, Bulk Audio Waveform Extractor, and Live In-App Previews—remain 100% operational and undisturbed.
4. **Documentation Alignment:** Update `docs/ASAR_PROJECT_ARCHITECTURE.md` across sections 1, 2, 3, 4, 5, 7, and 8 to document React Router adoption, the storefront-style dynamic subdomain renderer, DNS/local dev resolution, and Admin alignment.

## 5. Verification Method
1. **Static Analysis & TypeScript Compilation:**
   - Run `npx tsc --noEmit` within `apps/Admin` to confirm that router refactoring and URL helper additions introduce zero type errors.
2. **Code Inspection of URL References:**
   - Grep search `apps/Admin/src` for `http://localhost:3002` and `http://localhost:3003` to verify all hardcoded references have been superseded by `buildMemoryUrls`.
3. **Slug Validator Verification:**
   - Execute unit tests on `validateSubdomainSlug` verifying:
     - Valid slugs (`"mina-and-maryam"`, `"gala-2026"`) return `isValid: true`.
     - Invalid slugs (`"-invalid"`, `"slug-"`, `"has_underscore"`, `"a"`) return `isValid: false` with explicit error descriptions.
     - Reserved names (`"admin"`, `"api"`, `"booth"`) return `isValid: false`.
4. **Interactive Routing Verification:**
   - In Admin, test navigating between `/overview`, `/plans`, `/orders`, `/booth-studio/ORD-8821`, and `/invitation-studio/ORD-8819`. Verify browser forward/back buttons and URL bar synchronization work properly.
5. **Architecture Documentation Invalidation Conditions:**
   - The documentation update is invalidated if it still refers to `/memory/:slug` or `/e/:slug` as the primary public URLs instead of dynamic subdomains (`https://[subdomain].asar.me`).
