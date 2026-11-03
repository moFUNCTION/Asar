# AGENT 01 — Shared Domain Models, Web Audio Analyzer, Filename Parser & EmailJS Engine

> **Agent Role:** Core Platform Architect & Shared Utilities Engineer  
> **Target Workspace:** `packages/react-appwrite` (`@repo/react-appwrite`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

Because 10 AI agents are working simultaneously in parallel across the `d:\asar` monorepo, you MUST obey these strict file boundaries:

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `packages/react-appwrite/src/AsarDomain/collections.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/models.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/orderPipeline.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/audioAnalyzer.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/emailJsService.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/seedDefaults.ts` *(Create)*
* `packages/react-appwrite/src/AsarDomain/index.ts` *(Create)*
* `packages/react-appwrite/src/index.ts` *(Modify ONLY to append `export * from "./AsarDomain";` at the bottom)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** touch any files inside `apps/Booth`, `apps/Admin`, `apps/Invitation`, `apps/Main`, or `packages/UI-components`.
* Do **NOT** delete or break any existing exports in `packages/react-appwrite/src/index.ts`.
* Do **NOT** run `npm run build` unnecessarily or create random code generation scripts.

---

## 2. Exact Implementation Requirements

### 2.1. `collections.ts` — Appwrite Collection & Storage Bucket Constants
Export the canonical IDs used across all 4 applications:
```ts
export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
} as const;

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "payment_receipts",
  CLIENT_RAW_ASSETS: "client_raw_assets",
  BOOTH_MASTERED_AUDIO: "booth_mastered_audio",
  BOOTH_GALLERY_MEDIA: "booth_gallery_media",
  INVITATION_ASSETS: "invitation_assets",
} as const;
```

---

### 2.2. `models.ts` — Complete TypeScript Interfaces for All 8 Collections
Define and export strictly typed interfaces (compatible with Appwrite `Models.Document` or standalone objects):

1. **`AsarServiceType`**: `"booth" | "invitation"`
2. **`AsarPlanLimits`**:
   ```ts
   export interface AsarPlanLimits {
     coverageHours?: number;
     maxVoiceRecords: number;        // e.g. 80, 150, or -1 for unlimited
     maxGalleryPhotos: number;       // e.g. 20, 100, or -1 for unlimited
     maxCustomCategories: number;    // e.g. 4, 10
     hasVideoHighlight: boolean;
     hasGuestBookTab: boolean;
     allowBulkZipDownload: boolean;
     hostingDurationDays: number;    // e.g. 365
     maxRsvpCapacity?: number;       // For Invitation service (e.g. 150, 500)
     allowCustomSections?: boolean;  // For Invitation service
   }
   ```
3. **`AsarPlanAddon`**: `{ id: string; name: string; price: number; description?: string; badge?: string; }`
4. **`AsarPlan`**:
   ```ts
   export interface AsarPlan {
     $id?: string;
     serviceType: AsarServiceType;
     name: string;
     subtitle: string;
     badge: string;
     subBadge?: string;
     price: number;
     currency: string;
     themeVariant: "ivory-royal" | "noir-obsidian";
     imageUrl?: string;
     featuresJson: string;   // JSON stringified string[]
     addonsJson: string;     // JSON stringified AsarPlanAddon[]
     limitsJson: string;     // JSON stringified AsarPlanLimits
     isActive: boolean;
     sortOrder: number;
   }
   ```
5. **`OrderStatus`**:
   ```ts
   export type OrderStatus =
     | "pending_payment"
     | "payment_rejected"
     | "awaiting_client_assets"
     | "event_scheduled"
     | "audio_mastering"
     | "studio_curation"
     | "published";
   ```
6. **`ClientSubmittedAssets`**:
   ```ts
   export interface ClientSubmittedAssets {
     eventHeaderTag?: string;        // e.g. "THE WEDDING OF"
     coupleTitle?: string;           // e.g. "Mina & Maryam"
     eventDateDisplay?: string;      // e.g. "12 July 2026"
     eventLocationDisplay?: string;  // e.g. "Alexandria, Egypt"
     highlightBadge?: string;        // e.g. "Together Always"
     coupleQuote?: string;           // e.g. "Every voice here is a piece of our forever ..."
     thankYouMessage?: string;
     heroImageFileId?: string;
     heroImagePreviewUrl?: string;
     customCategories?: string[];    // e.g. ["Family", "Friends", "Colleagues", "Special Guests"]
     requestedRsvpFields?: string[]; // For Invitation service
     occasionType?: string;          // For Invitation service: "wedding" | "festival" | "gala" | "corporate"
     maxVenueCapacity?: number;
   }
   ```
7. **`AsarOrder`**, **`AsarPayment`**, **`BoothMemory`**, **`BoothVoiceRecord`**, **`BoothMedia`**, **`AsarInvitation`**, **`DynamicFormField`**, **`InvitationSectionBlock`**, **`InvitationThemeConfig`**, and **`InvitationRsvp`** matching the exact schema in `docs/ASAR_PROJECT_ARCHITECTURE.md` (Section 6.1).
8. Include safe JSON parser helpers: `parsePlanFeatures(plan)`, `parsePlanLimits(plan)`, `parseClientAssets(order)`, `parseWaveformPeaks(jsonStr)`.

---

### 2.3. `orderPipeline.ts` — 7-Stage Concierge Order Tracker Metadata
Export `ORDER_PIPELINE_STAGES` containing the 7 stages (`pending_payment`, `payment_rejected`, `awaiting_client_assets`, `event_scheduled`, `audio_mastering`, `studio_curation`, `published`) with:
* `key`, `stepNumber`, `titleEn`, `titleAr`, `descriptionEn`, `descriptionAr`, `requiresClientAction: boolean`, `badgeColor`.
* Helper `getOrderStageProgress(status: OrderStatus)` returning `{ currentStepIndex, progressPercent, stageInfo }`.

---

### 2.4. `audioAnalyzer.ts` — Web Audio API Waveform Peak Extractor & Smart Filename Parser
Implement the zero-effort audio utilities used by the Admin Bulk Voice Studio:
1. **`extractAudioMetadata(file: File, barCount = 48): Promise<{ durationSeconds: number; durationFormatted: string; waveformPeaks: number[] }>`**:
   * Reads `file.arrayBuffer()`, decodes via `window.AudioContext` or `webkitAudioContext` (`decodeAudioData`).
   * Computes `durationSeconds` and `durationFormatted` (e.g., `"0:42"`, `"1:12"`).
   * Divides the channel PCM `Float32Array` into `barCount` (48) equal buckets, computes peak/RMS amplitude per bucket, and normalizes values to `[0.15 .. 1.0]` rounded to 2 decimal places.
   * Includes a resilient fallback (if browser cannot decode a format, generates a deterministic natural-looking 48-bar waveform from the filename hash and estimates duration from file size) so bulk upload NEVER crashes!
2. **`parseVoiceFilename(filename: string, folderName?: string): { speakerName: string; speakerRole: string; category: string }`**:
   * Strips file extension (`.mp3`, `.wav`, `.m4a`, `.ogg`).
   * Supports patterns:
     * `Category_Speaker Name_Role` (e.g., `Friends_Nour Hassan_Best Friend.mp3`)
     * `Category - Speaker Name - Role` (e.g., `Family - Ahmed El Sayed - Brother.mp3`)
     * `Speaker Name - Role` (uses `folderName || "Family"` as category)
     * Fallback: cleans underscores/hyphens into `speakerName`, sets `speakerRole = "Guest"`, and `category = folderName || "Friends"`.

---

### 2.5. `emailJsService.ts` — EmailJS Dispatcher & QR Code URL Helper
1. **`buildQrCodeImageUrl(targetUrl: string, size = 500): string`**:
   * Constructs a reliable, high-contrast QR Code image URL using the Appwrite Avatars QR endpoint (`${endpoint}/avatars/qr?text=${encodeURIComponent(targetUrl)}&size=${size}&margin=2&project=${project}`) with fallback to a public QR SVG/PNG API (`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(targetUrl)}`) so QR codes always render visually even in offline/demo environments!
2. **`sendRsvpDecisionEmail(params)`**:
   * Calls the official EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`) using `import.meta.env.VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, and `VITE_EMAILJS_TEMPLATE_RSVP_APPROVED` / `VITE_EMAILJS_TEMPLATE_RSVP_DECLINED`.
   * If Approved (`decision === "approved"`): Sends `to_email`, `to_name`, `event_title`, `event_date`, `venue_name`, `qr_code_url`, `pass_link`, and confirmation message.
   * If Declined (`decision === "declined"`): Sends `to_email`, `to_name`, `event_title`, and the polite **venue capacity constraint apology message** (*"Due to strict venue capacity limitations, we are unfortunately unable to accommodate additional seats at this time..."*).
   * If `.env` EmailJS keys are not yet configured by the developer, logs the full formatted email payload cleanly and returns `{ simulated: true, success: true, emailSubject, emailBodyPreview, qrCodeUrl }` so the UI can show a rich "Email Sent / Preview" confirmation without throwing an error!

---

### 2.6. `seedDefaults.ts` — Luxury Fallback & Demo Seed Data
Export rich, realistic seed objects so all 4 apps work out of the box even before Appwrite collections are populated:
* `DEFAULT_BOOTH_PLANS` (*"لحظة أثر — Athar Moment"* `5,500 EGP` & *"حكاية أثر — Athar Story"* `7,000 EGP` with full `AsarPlanLimits`).
* `DEFAULT_INVITATION_PLANS` (*"دعوة أثر الكلاسيكية — Athar Classic Invite"* `2,500 EGP` & *"دعوة أثر الملكية المخصصة — Athar Bespoke Gala"* `4,500 EGP`).
* `DEMO_BOOTH_MEMORY` (*"Mina & Maryam"*, slug `"mina-and-maryam"`, date `"12 July 2026"`, location `"Alexandria, Egypt"`, badge `"Together Always"`, quote `"Every voice here is a piece of our forever ..."`) + `DEMO_BOOTH_VOICE_RECORDS` (matching the 5 exact speakers from **Image #1**: `Nour Hassan`, `Ahmed El Sayed`, `Mona Khaled`, `Tarek Mostafa`, `Grandma`, with realistic 48-bar waveforms and quotes).
* `DEMO_INVITATION` & `DEMO_INVITATION_RSVPS` (for testing the Invitation renderer and Client Mailbox immediately).

