# ASAR Admin Domain Specification Mining & Codebase Survey Report
**Target System:** `apps/Admin` (Port 3001)  
**Assigned Agents Under Survey:**
- **Agent 04:** Admin Console Shell, Dynamic Plan Builder & Manual Payment Verification Queue (`docs/AGENT_04_ADMIN_SHELL_PLANS_AND_ORDERS.md`)
- **Agent 05:** Admin Booth Memory Studio & Zero-Effort Bulk Voice Record Uploader (`docs/AGENT_05_ADMIN_BOOTH_BULK_VOICE_STUDIO.md`)
- **Agent 06:** Admin Flexible Invitation Website Builder & Dynamic RSVP Form Studio (`docs/AGENT_06_ADMIN_INVITATION_AND_FORM_BUILDER.md`)  
**Core Architectural Specifications:**
- `docs/ASAR_PROJECT_ARCHITECTURE.md`
- `docs/ASAR_DESIGN_SYSTEM.md`
- `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

`apps/Admin` serves as the centralized operations, visual curation, and business administration engine for the ASAR platform. It orchestrates the two commercial services:
1. **ASAR Booth:** Vintage audio guestbook installations, dynamic plan tiers, manual payment verification, concierge order management, and bulk voice mastering/curation studio.
2. **ASAR Invitation:** Bespoke event and invitation websites, customizable section blocks, theme engine, dynamic RSVP form schema builder with locked mandatory email, and capacity management.

The codebase currently in `apps/Admin` is an early scaffold/stub with 4 basic files (`App.tsx`, `index.css`, `main.tsx`, `vite-env.d.ts`). All domain components for Agents 04, 05, and 06 are yet to be implemented. Strict file boundaries and clean import/export contracts allow Agents 04, 05, and 06 to work in parallel without merge conflicts.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Shell / Layout | `AdminShell` Luxury Layout | Warm Vintage Editorial container (`#FBF7F2`, `#231F20`, `#6B1D28`, `#D4AF37`) with sidebar/topbar navigation between 5 tabs and external quick links to ports 3000, 3002, 3003. | Active tab state, user auth session | Rendered shell with header, sidebar, brand badge, and active studio view | Renders fallback if session missing or unauthorized | `AGENT_04`, `ASAR_DESIGN_SYSTEM` |
| 2 | Dashboard | `AdminOverview` KPIs | Live business metrics: pending payment receipts, active orders, total voice records, published memory sites, recent registrations. | Database counts from Appwrite collections | KPI stat cards, pending payment badge counter, quick action links | Displays zero/fallback states if collections empty | `AGENT_04`, `ASAR_PROJECT_ARCHITECTURE` §4.2 |
| 3 | Plans | Dynamic Plan CRUD | Interface to create, edit, duplicate, toggle `isActive`, and delete plans for `booth` and `invitation` services. | Service tab filter (`All`, `Booth`, `Invitation`), form inputs | Appwrite document in `plans`, mirrored to `localStorage` (`"asar_synced_plans"`) | Validation errors on empty name, invalid price, or non-numeric quota | `AGENT_04` §2.2 |
| 4 | Plans | Custom Features Builder | Dynamic string array editor allowing Admin to add, reorder, edit, and delete custom marketing feature bullet points. | Feature strings | Stored in plan's `featuresJson` string array | Disallows empty feature strings; handles malformed JSON safely | `AGENT_04` §2.2 |
| 5 | Plans | Enforced Quotas & Limits Matrix | Numeric steppers and boolean toggles configuring `coverageHours`, `maxVoiceRecords`, `maxGalleryPhotos`, `maxCustomCategories`, `hasVideoHighlight`, `hasGuestBookTab`, `allowBulkZipDownload`, `hostingDurationDays`, `maxRsvpCapacity`. | Form toggles / numbers (-1 for Unlimited) | Serialized `limitsJson` matching `AsarPlanLimits` | Coerces negative values (other than -1) to valid bounds | `AGENT_04` §2.2, `AGENT_01` §2.2 |
| 6 | Plans | Add-ons Catalog Manager | Manager for optional service add-ons (name, price, badge, description). | Addon items list | Serialized `addonsJson` matching `AsarPlanAddon[]` | Rejects non-numeric prices | `AGENT_04` §2.2 |
| 7 | Orders | 7-Stage Orders Pipeline Manager | Filterable orders queue by service and pipeline stage (`pending_payment`, `payment_rejected`, `awaiting_client_assets`, `event_scheduled`, `audio_mastering`, `studio_curation`, `published`). | Service filter, stage filter | Filtered order cards/table with current stage badges and advance buttons | Handles empty orders gracefully with informative empty state | `AGENT_04` §2.3, `ASAR_PROJECT_ARCHITECTURE` §4.3 |
| 8 | Orders | Manual Payment Receipt Inspector | Modal/drawer inspecting payment method, amount, timestamp, and high-resolution zoomable receipt screenshot preview. | `selectedPayment`, screenshot file ID from `payment_receipts` | Zoomable receipt lightbox with Approve / Reject controls | Displays fallback placeholder if screenshot cannot be loaded | `AGENT_04` §2.3 |
| 9 | Orders | Payment Approval Action | Approves payment: sets `payment.status = "approved"`, advances `order.orderStatus = "awaiting_client_assets"`. | Admin click on `✓ Approve Payment` | Updates Appwrite `payments` and `orders` documents | Catches mutation errors and notifies admin with inline error banner | `AGENT_04` §2.3, `ASAR_PROJECT_ARCHITECTURE` §4.2 |
| 10 | Orders | Payment Rejection Action | Rejects payment: prompts Admin for `rejectionReason`, sets `payment.status = "rejected"`, sets `order.orderStatus = "payment_rejected"`. | Admin click on `✕ Reject Payment` + reason string | Updates Appwrite `payments` and `orders` documents | Validates that `rejectionReason` is not blank | `AGENT_04` §2.3 |
| 11 | Orders | Client Submitted Assets Viewer | View assets sent by client in stage 3 (Hero photo, couple title, date, venue, quote, requested categories/RSVP fields). | `ClientSubmittedAssets` from `clientSubmittedAssetsJson` | Read-only visual preview card with direct "Launch Studio" button | Handles null/empty asset fields gracefully | `AGENT_04` §2.3 |
| 12 | Orders | Direct Studio Deep Launch | One-click launch from order queue row: sets `selectedOrderId` and transitions tab to `booth-studio` or `invitation-studio`. | Order click event | Parent `App.tsx` state update (`activeTab`, `selectedOrderId`) | Fallback if `serviceType` is undefined | `AGENT_04` §2.3 |
| 13 | Booth Studio | Split-Screen Visual Editor | 60% left studio workspace tabs, 40% sticky right iPhone 15 Pro bezel preview (`LiveMemoryMobilePreview`). | Order ID, current memory document | Interactive split-screen layout synced in real time | Responsive fold/stack on small viewports | `AGENT_05` §2.1 |
| 14 | Booth Studio | Top Action Bar & Quota Meter | Order switcher, live quota meter badge (e.g. `Voices: 86 / Unlimited`), "Override Quota" toggle, pull client assets button, QR generator button, publish button. | Active order limits, current counts | Visual badges, modals, persistence triggers | Warns if voice/photo count exceeds quota when override is off | `AGENT_05` §2.1 |
| 15 | Booth Studio | "Pull Client Submitted Assets" | One-click auto-population of Hero photo, names, date, location, quote, and categories from client's order asset payload. | Order's `clientSubmittedAssetsJson` | Pre-fills `booth_memories` form fields instantly | Informs Admin if client has not yet submitted assets | `AGENT_05` §2.1, §4.5 |
| 16 | Booth Studio | Hero & Texts Editor | Manages slug (`mina-and-maryam`), header tag, couple title, tagline, date, location, highlight badge, quote, hero image upload, category pills, and 4-digit PIN lock. | Text inputs, image file picker, PIN string | Stored in `booth_memories` document | Validates 4-digit numeric PIN format if PIN lock enabled | `AGENT_05` §2.3 |
| 17 | Booth Studio | Multi-File & Folder Bulk Voice Drop | Multi-file drop zone accepting 50–150+ audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`) and category folders. | Audio files / folder drop | Populates batch grid staging list | Rejects unsupported file extensions with warning | `AGENT_05` §2.2 |
| 18 | Booth Studio | Simulated Bulk Drop (15 Tracks) | One-click test button injecting 15 simulated wedding voice tracks with authentic durations, waveforms, and speaker names. | Click event | Immediately loads 15 pre-configured demo tracks into the batch grid | Safe mock; does not overwrite without confirmation | `AGENT_05` §2.2 |
| 19 | Booth Studio | Web Audio API Auto-Analyzer | Decodes audio via `AudioContext` (`decodeAudioData`), extracts duration (`"0:42"`), and computes 48 normalized waveform peaks (`[0.18, 0.54, ...]`). | Audio file ArrayBuffer | `{ durationSeconds, durationFormatted, waveformPeaks }` | Resilient fallback: generates deterministic 48-peak waveform from hash and size | `AGENT_05` §2.2, `AGENT_01` §2.4 |
| 20 | Booth Studio | Smart Filename & Folder Parser | Auto-extracts category, speaker name, and speaker role from filename patterns (`Category_Name_Role`, `Name - Role`, folders). | File name string, parent folder name | `{ speakerName, speakerRole, category }` | Fallback: labels `Voice Memory #N`, role `Loved One`, default category | `AGENT_05` §2.2, `AGENT_01` §2.4 |
| 21 | Booth Studio | Keyboard-Navigable Batch Grid | Compact spreadsheet grid with inline player (`▶`/`⏸`), inputs for speaker name, role, category pill, quote (`dir="auto"`), mini waveform, delete. | User keyboard events (`Tab`, `Enter`), edits | In-memory staging state for batch commit | Inline input validation; handles empty quotes cleanly | `AGENT_05` §2.2 |
| 22 | Booth Studio | Bulk Batch Actions Toolbar | "Select All", "Filter by Category", "Set Category for Selected", "Auto-Fill Default Quotes", "Upload & Save All". | Selection checkboxes, action clicks | Batch update of staging rows; chunked upload via `useBatchOperations` | Progress bar feedback; error report for individual failed uploads | `AGENT_05` §2.2 |
| 23 | Booth Studio | Media, Video & Guest Book Editor | Uploads event gallery photos, 30s video highlight reel & title, guest book written notes, thank you message. | Media files, note texts | Stored in `booth_media` and `booth_memories` | Checks plan limit on photo count (`maxGalleryPhotos`) | `AGENT_05` §2.3 |
| 24 | Booth Studio | Printable Table QR Kit Generator | Generates high-res QR code for `/memory/:slug` using `useAvatars().getQR()` with branded Athar frame; download as PNG. | Slug, domain URL | High-res printable QR card modal & PNG download | Fallbacks to public SVG QR generator if Appwrite offline | `AGENT_05` §2.3, `ASAR_PROJECT_ARCHITECTURE` §4.6 |
| 25 | Invitation Studio | Split-Screen Custom Event Builder | 60% left builder tabs (Theme, Sections, Dynamic Form), 40% sticky right interactive preview with desktop/mobile viewport toggle. | Order ID, invitation document | Real-time updating preview of bespoke event site | Adapts layout gracefully across viewport widths | `AGENT_06` §2.1 |
| 26 | Invitation Studio | Top Toolbar & Occasion Switcher | Switcher for active invitations, Occasion badge (`Wedding`, `Festival`, `VIP Gala`, `Corporate Summit`, `Graduation`), max venue capacity input. | Selected invitation, capacity number | Updates top-level `invitations` record | Validates capacity as positive integer | `AGENT_06` §2.1 |
| 27 | Invitation Studio | "Apply Client Requested Fields & Assets" | Automatically loads client's event details and requested RSVP form fields from their order submission. | Order's `clientSubmittedAssetsJson` | Pre-fills event metadata and appends requested fields to form schema | Informs Admin if requested fields empty | `AGENT_06` §2.1 |
| 28 | Invitation Studio | Theme Presets & Shader Selector | Curated occasion presets (Royal Wedding, Noir Gala, Mediterranean Garden, Cultural Festival), custom color pickers, RTL/LTR toggle, shader & cursor selectors. | Theme selections, color hexes | Stored in `themeConfigJson` | Fallbacks to default Royal Wedding theme if corrupted | `AGENT_06` §2.2 |
| 29 | Invitation Studio | Composable Section Blocks Manager | Add, duplicate, toggle visibility (`isVisible`), reorder (Up/Down), and configure modular blocks (`hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, `rsvp_form`). | Block configurations | Serialized `sectionsConfigJson` | Enforces that `rsvp_form` block is always retained at the end | `AGENT_06` §2.3 |
| 30 | Invitation Studio | Dynamic RSVP Form Schema Builder | Builder for custom RSVP fields requested by client, configured with labels, placeholders, requirement flags, and options. | Field definitions | Serialized `formSchemaJson` | Enforces locked mandatory email and guest name | `AGENT_06` §2.4 |
| 31 | Invitation Studio | Hard-Locked System Fields | Mandatory fields `guestName` (text) and `guestEmail` (email) marked `isSystemLocked: true`, `required: true`, accompanied by gold lock badge. | Admin cannot delete or mark optional | Immutable core schema fields | Throws/blocks if any attempt is made to delete or disable email | `AGENT_06` §2.4, `ASAR_PROJECT_ARCHITECTURE` §5.2 |
| 32 | Invitation Studio | Dynamic Custom Field Types | Supports adding custom fields: `tel` (WhatsApp), `select` (dropdown), `radio`, `checkbox`, `number`, `text`, `textarea`. | Field type selector, comma-separated options | Dynamic field object added to form schema | Requires options array for `select`/`radio`/`checkbox` | `AGENT_06` §2.4 |

---

## 3. Edge Cases & Specification Requirements

| # | Feature | Input | Observed Behavior / Required Spec Handling |
|---|---------|-------|---------------------------------------------|
| 1 | Filename Parser | File named `REC_0001.mp3` or `Track_12.wav` | Cleanly extracts speaker name as `Voice Memory #1` (or `#12`), speaker role as `Loved One`, and category as default active category or `Friends`. Never crashes or produces `undefined`. |
| 2 | Filename Parser | File named `Friends_Nour Hassan_Best Friend.mp3` | Accurately splits by underscore: Category: `Friends`, Name: `Nour Hassan`, Role: `Best Friend`. Strips extension. |
| 3 | Filename Parser | File named `Family - Ahmed El Sayed - Brother.m4a` | Accurately splits by hyphen: Category: `Family`, Name: `Ahmed El Sayed`, Role: `Brother`. Handles whitespace around hyphens. |
| 4 | Filename Parser | File in a folder `Colleagues/Dr_Khaled.mp3` | Uses folder name `Colleagues` as category; cleans underscore into `Dr Khaled`; sets role to `Colleague` or `Guest`. |
| 5 | Web Audio API | Corrupted or unsupported audio format (e.g., raw `.ogg` on older browser) | `AudioContext.decodeAudioData` rejects or throws. Resilient fallback activates: computes a deterministic 48-peak waveform based on string hashing of filename and estimates duration from file size. Upload and preview continue without throwing unhandled exceptions. |
| 6 | Bulk Voice Upload | 120 files dropped simultaneously | Studio must not fire 120 simultaneous raw fetch calls. Must use chunked batch operations (`useBatchOperations` concurrency chunking: 5 files per batch) with live progress bar (`Uploading 45/120 — 38%`). |
| 7 | Dynamic Form Schema | Admin attempts to delete or uncheck "Required" on `guestEmail` | Operation is strictly disabled in UI. `guestEmail` has `isSystemLocked: true` and `required: true`. A gold badge displays `🔒 System Required for EmailJS QR Delivery`. Backend/storage validation rejects any schema omitting `guestEmail`. |
| 8 | Dynamic Form Schema | Empty option list for `select`, `radio`, or `checkbox` field | Field validation flags an error prompting the Admin to enter at least one option before saving. |
| 9 | Payment Verification | Admin approves payment with missing screenshot | Allowed only if Admin explicitly overrides, but normally verifies receipt image exists; advances order to `awaiting_client_assets` and updates payment status to `approved`. |
| 10 | Payment Verification | Admin rejects payment with blank reason | Rejection button is disabled until a non-empty string is provided in `rejectionReason`. On rejection, status becomes `payment_rejected` and client portal prompts for new screenshot. |
| 11 | Plan Builder | Admin sets `maxVoiceRecords` or `maxGalleryPhotos` to `-1` | Treated as `Unlimited` in UI quota meters, badges, and client plan cards; avoids arithmetic comparison issues. |
| 12 | Plan Builder | Plan persistence when Appwrite backend is unreachable | Updates `localStorage` key `"asar_synced_plans"` immediately so local testing and apps on ports 3002 and 3003 can read updated plans even in offline/demo mode. |
| 13 | Quota Override | Booth memory has 105 voices on an 80-voice plan | Top Quota Meter shows warning `Voices: 105 / 80 (Exceeded)`. If Admin toggles "Override Quota", the warning turns gold `Voices: 105 / 80 (VIP Override Active ✓)` and publishing remains permitted. |
| 14 | Cross-app Launch | Admin clicks "Open in Booth Memory Studio" on order row | Passes `orderId` to state, updates active tab to `"booth-studio"`, loads that order's data, and provides a `"← Back to Orders"` button returning to the exact prior queue view. |

---

## 4. Strict File Boundaries & Permissions Matrix

To prevent conflicts among parallel AI agents, the following file ownership boundaries are strictly established:

| File Path | Agent 04 (Shell, Plans, Orders) | Agent 05 (Booth Studio) | Agent 06 (Invitation Studio) | Other Agents / Packages |
| :--- | :---: | :---: | :---: | :---: |
| `apps/Admin/src/index.css` | **OWNER (Modify)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/App.tsx` | **OWNER (Modify)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/layout/AdminShell.tsx` | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/dashboard/AdminOverview.tsx` | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/plans/PlanBuilderStudio.tsx` | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/orders/OrdersQueueManager.tsx` | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx` | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/VoiceBatchGridEditor.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/LiveMemoryMobilePreview.tsx` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/booth-studio/index.ts` | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/ThemeAndEffectsPanel.tsx` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/LiveInvitationPreview.tsx` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Admin/src/components/invitation-studio/index.ts` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | **OWNER (Create)** | 🚫 FORBIDDEN |
| `apps/Booth/*`, `apps/Main/*`, `apps/Invitation/*` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN | Respective Agents |
| `packages/react-appwrite/*` | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN | Agent 01 |

### Cross-Agent Integration Contracts

In `apps/Admin/src/App.tsx` (owned by Agent 04), the studios built by Agent 05 and Agent 06 must be imported and consumed using these exact interfaces:

```tsx
import { BoothMemoryStudio } from "./components/booth-studio";
import { InvitationStudio } from "./components/invitation-studio";

// When activeTab === "booth-studio":
<BoothMemoryStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />

// When activeTab === "invitation-studio":
<InvitationStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />
```

**Export signatures required:**
- `apps/Admin/src/components/booth-studio/index.ts`:
  ```tsx
  export interface BoothMemoryStudioProps {
    orderId?: string | null;
    onBack?: () => void;
  }
  export const BoothMemoryStudio: React.FC<BoothMemoryStudioProps>;
  ```
- `apps/Admin/src/components/invitation-studio/index.ts`:
  ```tsx
  export interface InvitationStudioProps {
    orderId?: string | null;
    onBack?: () => void;
  }
  export const InvitationStudio: React.FC<InvitationStudioProps>;
  ```

---

## 5. Current Codebase Audit (`apps/Admin`)

### 5.1. File Inventory
- `apps/Admin/package.json`: Configured with React 18.2.0, Vite 5.4.0, Chakra UI v3 (`@chakra-ui/react: ^3.32.0`), `@emotion/react: ^11.14.0`, `@repo/react-appwrite: *`, `appwrite: ^17.0.2`.
- `apps/Admin/src/main.tsx`: Wraps `<App />` in `<React.StrictMode>`, `<ChakraProvider value={defaultSystem}>`, and `<AppwriteProvider endpoint project databaseId>`. Clean and functional.
- `apps/Admin/src/index.css`: Currently contains a generic dark SaaS theme (`--bg-primary: #090d16;`). **Missing:** The luxury Warm Vintage Editorial tokens from `docs/ASAR_DESIGN_SYSTEM.md` (`#FBF7F2`, `#231F20`, `#6B1D28`, `#D4AF37`, etc.).
- `apps/Admin/src/App.tsx`: Currently contains a placeholder dashboard with a mock event registration table (`AttendeeRow`). **Missing:** The 5-tab navigation, `AdminShell`, `AdminOverview`, `PlanBuilderStudio`, `OrdersQueueManager`, `PaymentReceiptInspector`, and studio mounts.
- `apps/Admin/src/components/*`: No component folders exist yet.

### 5.2. Compiler Health
- Verified with command: `npx tsc -p apps/Admin/tsconfig.app.json --noEmit`
- Result: **0 errors**. Typecheck passes cleanly on baseline files.

### 5.3. Icon & UI Library Considerations
- `apps/Booth` has `"react-icons": "^5.5.0"` and `"@repo/ui-components": "*"`.
- `apps/Admin` does not have `react-icons` in `package.json`.
- **Architectural Recommendation:** Agent 04, 05, and 06 should either:
  1. Use clean SVG icons / luxury emoji / UTF-8 glyphs (e.g. `🎙️`, `✉️`, `✓`, `✕`, `▶`, `⏸`, `🔒`, `✦`, `🏷️`), which match the Warm Vintage Editorial aesthetic natively without extra packages, OR
  2. Use inline SVG icons following the acoustic divider and badge recipes in `docs/ASAR_DESIGN_SYSTEM.md`.

---

## 6. Deep Architectural Breakdown

### 6.1. Agent 04: Admin Shell, Plans & Orders
- **Design Tokens:**
  - Background primary: `#FBF7F2` (Warm Alabaster)
  - Background secondary: `#F4EFEA` (Linen Cream)
  - Maroon primary: `#6B1D28` / `#5B1621`
  - Champagne Gold: `#D4AF37` / `#E5C158`
  - Text: `#231F20` (Deep Espresso)
- **Navigation Tabs:**
  1. `dashboard` (`Overview`)
  2. `plans` (`Plans & Limits`)
  3. `orders` (`Orders & Payments`) with pending receipts badge
  4. `booth-studio` (`Booth Memory Studio`)
  5. `invitation-studio` (`Invitation Builder`)
  Plus quick external links to port 3000, 3002, 3003.
- **Plans Management:**
  - Create / Edit / Duplicate / Toggle / Delete.
  - Form sections: Identity/Pricing, Custom Features list (`featuresJson`), Quotas matrix (`limitsJson`), Add-ons (`addonsJson`).
  - Storage: Appwrite `plans` collection + `localStorage.setItem("asar_synced_plans")`.
- **Orders & Payments Pipeline:**
  - 7 stages: `pending_payment` → `payment_rejected` → `awaiting_client_assets` → `event_scheduled` → `audio_mastering` → `studio_curation` → `published`.
  - Filter by service and stage.
  - Payment modal: Zoomable receipt image from `payment_receipts` bucket, Approve (advances order to `awaiting_client_assets`), Reject (sets `payment_rejected` with reason).
  - Launch button: sets `selectedOrderId` and switches to `booth-studio` or `invitation-studio`.

### 6.2. Agent 05: Booth Bulk Voice Studio
- **Split-Screen Layout:** 60% left editing controls, 40% right sticky iPhone 15 Pro preview (`LiveMemoryMobilePreview`).
- **Top Studio Action Bar:**
  - Order switcher dropdown.
  - Quota Meter: `Voices: 86 / Unlimited` + VIP Override toggle.
  - "Pull Client Submitted Assets" button: auto-loads hero image, names, date, venue, quote, and categories from order asset JSON.
  - "Generate & Download Landing QR" modal for `http://localhost:3002?memory=${slug}`.
  - "Save & Publish" button: persists to `booth_memories`, `booth_voice_records`, `booth_media`, advances order status to `"published"`.
- **5 Zero-Effort Bulk Capabilities:**
  1. **Multi-File & Folder Drag-Drop:** 50–150+ audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`) + `⚡ Simulate Bulk Drop (15 Sample Wedding Voices)`.
  2. **Web Audio API Analysis:** Duration extraction + 48 normalized waveform peaks (`waveformPeaksJson: number[]`) with fallback.
  3. **Smart Filename Parser:**
     - Pattern A: `Category_Speaker Name_Role.mp3`
     - Pattern B: `Category - Speaker Name - Role.mp3`
     - Pattern C: `Speaker Name - Role.mp3` (folder name fallback)
     - Pattern D: Unnamed / numeric (`Track_01.mp3`) → clean default labels (`Guest #1`, `Loved One`).
  4. **Keyboard-Navigable Spreadsheet Batch Grid:**
     - Checkbox, Inline audition (`▶`/`⏸`), Name, Role, Category pill, Quote (`dir="auto"`), mini waveform, reorder/delete.
     - `Tab`/`Enter` between cells.
  5. **Bulk Toolbar Actions:** Select All, Set Category for Selected, Auto-Fill Default Quotes, Upload & Save All with `useBatchOperations().bulkCreate`.
- **Media & Tabs Editor:** Gallery photos uploader, 30s video highlight uploader, guest book manager, thank you message editor.

### 6.3. Agent 06: Invitation & Dynamic Form Builder
- **Bespoke, Non-Rigid Concept:** Websites for Weddings, Engagements, Festivals, Galas, Summits, Graduations.
- **Top Toolbar:** Switcher, Occasion Badge, Max Venue Capacity input (`maxCapacity`), "Apply Client Requested Fields & Assets", "Generate QR", "Save & Publish".
- **Tab 1 — Theme & Effects:**
  - 4 Curated Presets: Royal Wedding Editorial, Midnight Gala Noir, Mediterranean Garden, Cultural Festival.
  - Direction: RTL / LTR / Bilingual.
  - Shader selection: `GradientWaves` | `DitherVeil` | `MinimalEditorial`.
  - Cursor selection: `SplashCursor` | `GlowCursor` | `None`.
- **Tab 2 — Section Blocks Manager:**
  - Modular blocks stored in `sectionsConfigJson`: `hero`, `countdown`, `story_timeline`, `gallery`, `venue_map`, `custom_highlight`, `rsvp_form`.
  - Add, duplicate, toggle visibility (`isVisible`), reorder (Up/Down).
- **Tab 3 — Dynamic RSVP Form Schema Builder:**
  - Client requested fields note with auto-generate button.
  - **Locked Mandatory System Fields:**
    - `guestName` (type: `"text"`, `required: true`, `isSystemLocked: true`)
    - `guestEmail` (type: `"email"`, `required: true`, `isSystemLocked: true`) with gold lock badge: `🔒 System Required for EmailJS QR Delivery`.
  - **Dynamic Custom Fields:**
    - Types: `tel`, `select`, `radio`, `checkbox`, `number`, `text`, `textarea`.
    - Config: label, placeholder, required toggle, comma-separated options.
- **Right Column:** `LiveInvitationPreview` with desktop/mobile viewport toggle.

---

## 7. Unit Test & Verification Matrix

The acceptance criteria specify that core domain logic must be verified with unit tests without requiring a live Appwrite instance:

| Test Target | Module / Function | Required Test Cases | Offline Feasibility |
| :--- | :--- | :--- | :--- |
| **Filename Parsing** | `parseVoiceFilename(filename, folder)` | 1. Underscore pattern: `Friends_Nour Hassan_Best Friend.mp3`<br/>2. Hyphen pattern: `Family - Ahmed El Sayed - Brother.wav`<br/>3. Folder fallback: `Colleagues/Mona.mp3`<br/>4. Unnamed track: `REC_001.mp3`<br/>5. Extension stripping: `.mp3`, `.wav`, `.m4a`, `.ogg` | 100% Offline (pure regex/string logic) |
| **Form Schema Validation** | `validateFormSchema(schema)` | 1. Hard-locked `guestEmail` must be present and `required === true`<br/>2. Hard-locked `guestName` must be present and `required === true`<br/>3. Rejection of schemas where `guestEmail` was removed or made optional<br/>4. Options validation for `select`/`radio`/`checkbox` | 100% Offline (pure JSON validator) |
| **Order Pipeline Transitions** | `getOrderStageProgress(status)` | 1. Correct stage index for all 7 statuses<br/>2. Correct progress percentages (0% to 100%)<br/>3. Transition logic: `pending_payment` + approve → `awaiting_client_assets`<br/>4. Transition logic: `pending_payment` + reject → `payment_rejected` | 100% Offline (pure state machine helper) |
| **Waveform & Duration Extraction** | `extractAudioMetadata` / fallback | 1. Correct duration formatting (`42` → `"0:42"`, `72` → `"1:12"`)<br/>2. Exactly 48 normalized peaks in `[0.15 .. 1.0]`<br/>3. Fallback deterministic waveform generator when decode fails | 100% Offline (can test mock audio buffer or fallback path) |

---

## 8. Dependencies on `packages/react-appwrite` & Risk Mitigation

- **Current State of `@repo/react-appwrite`:**
  - Base hooks and SDK wrappers are complete (`useAppwrite`, `useCollection`, `useDocument`, `useMutations`, `useBatchOperations`, `useUpload`, `<AppwriteImage>`, `useAvatars`).
  - Domain models (`AsarDomain`) are being created by Agent 01 in parallel.
- **Risk Mitigation Strategy for Agents 04, 05, 06:**
  1. Each Admin component should import types and constants from `@repo/react-appwrite` or define local interfaces matching `docs/AGENT_01_SHARED_DOMAIN_AND_UTILITIES.md`.
  2. Implement local fallback seed data (matching `DEFAULT_BOOTH_PLANS`, `DEMO_BOOTH_MEMORY`, `DEMO_BOOTH_VOICE_RECORDS`, `DEMO_INVITATION`) so the Admin UI renders rich interactive data immediately even if Appwrite collections are empty or offline.
  3. Keep `apps/Admin` zero-conflict boundaries strictly intact so Agent 04, Agent 05, and Agent 06 can edit their designated files without clobbering each other.
