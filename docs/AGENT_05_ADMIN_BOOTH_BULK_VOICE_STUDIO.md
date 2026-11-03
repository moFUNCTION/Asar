# AGENT 05 — Admin Booth Memory Studio & Zero-Effort Bulk Voice Record Uploader

> **Agent Role:** Booth Memory Studio & Bulk Audio Engineering Specialist  
> **Target Workspace:** `apps/Admin` (Port `3001`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md` & Visual Reference Image #1  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/BulkVoiceUploader.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/VoiceBatchGridEditor.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/LiveMemoryMobilePreview.tsx` *(Create)*
* `apps/Admin/src/components/booth-studio/index.ts` *(Create — must export `{ BoothMemoryStudio }`)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `apps/Admin/src/App.tsx`, `apps/Admin/src/index.css`, or any files inside `apps/Admin/src/components/{layout,dashboard,plans,orders,invitation-studio}/*`.
* Do **NOT** touch `apps/Booth`, `apps/Main`, `apps/Invitation`, or `packages/*`.

### 🤝 Export Contract (`apps/Admin/src/components/booth-studio/index.ts`):
```tsx
export interface BoothMemoryStudioProps {
  orderId?: string | null;
  onBack?: () => void;
}
export const BoothMemoryStudio: React.FC<BoothMemoryStudioProps>;
```

---

## 2. Exact Implementation Requirements

### 2.1. `BoothMemoryStudio.tsx` — Split-Screen Visual Editor Architecture
The Admin Booth Studio is designed so the Admin can assemble and publish a client's Booth Memory Website **rapidly, intuitively, and with zero friction**:

* **Top Studio Action Bar:**
  * Order selector dropdown (allows switching between active Booth orders or editing the flagship `"Mina & Maryam"` memory page).
  * **Plan Quota Meter Badge:** Shows current usage against the client's plan limits (e.g., `Voices: 86 / Unlimited`, `Photos: 12 / 100`, `Video Highlight: Enabled ✓`) + an **"Override Quota"** toggle for VIP flexibility.
  * **`📥 Pull Client Submitted Assets` Button:** One click loads the cover photo, couple names, event date, location, highlight badge, personal quote, thank-you note, and categories that the client submitted in their account portal!
  * **`📱 Generate & Download Landing QR` Button:** Opens the branded QR Code modal for `http://localhost:3002?memory=${slug}`.
  * **`🚀 Save & Publish Memory Website` Button:** Persists to Appwrite (`booth_memories`, `booth_voice_records`, `booth_media`), advances order status to `"published"`, and syncs to `localStorage` (`"asar_booth_memories_cache"`).

* **Split-Screen Workspace Grid:**
  * **Left Column (60% Width on Desktop):** 4 Studio Tabs:
    1. `1. Hero, Texts & Privacy` (`HeroAndTextsEditor.tsx`)
    2. `2. Bulk Voice Studio (⚡ Zero-Effort)` (`BulkVoiceUploader.tsx` + `VoiceBatchGridEditor.tsx`)
    3. `3. Photos, 30s Video & Guest Book` (`MediaAndTabsEditor.tsx`)
    4. `4. Thank You & Landing QR Code`
  * **Right Column (40% Width on Desktop, Sticky):** `LiveMemoryMobilePreview.tsx` — an interactive iPhone 15 Pro bezel rendering the client's Memory Website (Image #1) live as the Admin edits any field or reorders voice tracks!

---

### 2.2. `BulkVoiceUploader.tsx` & `VoiceBatchGridEditor.tsx` — Zero-Effort Bulk Voice Record Placement
This is the centerpiece of the Booth Admin experience. A wedding often produces **50 to 150+ voice recordings**, so placing them one by one manually is unacceptable. Implement these **5 Zero-Effort Bulk Capabilities**:

1. **Multi-File & Folder Drag-and-Drop Zone:**
   * Admin can drop 50–150+ audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`) at once.
   * Also include a **`⚡ Simulate Bulk Drop (15 Sample Wedding Voices)`** button so the Admin/reviewer can test the entire bulk pipeline in one click even without local `.mp3` files on disk!
2. **Automatic Client-Side Web Audio API Analysis (Duration + 48 Waveform Peaks):**
   * Immediately upon file drop, decode each audio file via the browser's `AudioContext.decodeAudioData` (or fallback waveform generator) to automatically extract:
     * Exact formatted duration (`"0:42"`, `"1:12"`).
     * `waveformPeaks`: array of `48` normalized numbers (`[0.18, 0.54, 0.92, ...]`) so the Memory Website renders authentic waveforms instantly!
3. **Smart Filename & Folder Auto-Parser:**
   * Automatically parses filenames into `Category`, `Speaker Name`, and `Speaker Role`:
     * `Friends_Nour Hassan_Best Friend.mp3` → Category: `Friends`, Name: `Nour Hassan`, Role: `Best Friend`.
     * `Family - Ahmed El Sayed - Brother.mp3` → Category: `Family`, Name: `Ahmed El Sayed`, Role: `Brother`.
     * If unnamed (`Track_01.mp3`), assigns clean defaults (`Guest #1`, Role: `Loved One`, Category: `Active Filter Category`).
4. **Fast Keyboard-Navigable Spreadsheet Batch Grid (`VoiceBatchGridEditor.tsx`):**
   * Displays all voice records in a sleek, compact table where the Admin can press `Tab` / `Enter` to move across cells without touching the mouse:
     * **Checkbox (`☑`)** for bulk selection.
     * **Inline Audition Button (`▶` / `⏸`)** so the Admin can listen to the voice right inside the row while typing the speaker's name or quote!
     * **Speaker Name Input** (e.g., `Nour Hassan`).
     * **Role / Relationship Input** (e.g., `Best Friend`).
     * **Category Pill Select** (`Family`, `Friends`, `Colleagues`, `Special Guests`, or custom category).
     * **Quote / Blessing Input (`dir="auto"`)** (e.g., `"Mabrook ya gameela, ربنا يسعدكم دايماً ..."`).
     * **Mini Waveform & Duration Preview** (`0:42`).
     * **Up / Down Reorder & Delete Icons**.
5. **One-Click Bulk Toolbar Actions:**
   * `☑ Select All / Filter by Category`
   * `🏷️ Set Category for Selected (e.g. Move 25 tracks to "Friends")`
   * `✨ Auto-Fill Default Quotes for Empty Rows`
   * `☁️ Upload & Save All Tracks` — Uses `@repo/react-appwrite`'s chunked upload (`useUpload`) and `useBatchOperations().bulkCreate` with a live progress bar (`Uploading 86/86 tracks — 100%`).

---

### 2.3. `HeroAndTextsEditor.tsx`, `MediaAndTabsEditor.tsx` & QR Generator
* **`HeroAndTextsEditor.tsx`:**
  * Edit `slug` (e.g., `mina-and-maryam`), `eventHeaderTag` (`THE WEDDING OF`), `coupleTitle` (`Mina & Maryam`), `tagline`, `eventDateDisplay` (`12 July 2026`), `eventLocationDisplay` (`Alexandria, Egypt`), `highlightBadge` (`Together Always`), `coupleQuote`, `heroImage` uploader, Category Pills manager, and **Private Memory PIN Lock** (`isPrivateLocked` + 4-digit `accessPinCode`).
* **`MediaAndTabsEditor.tsx`:**
  * Multi-photo drag-and-drop gallery uploader for the `Photos` tab.
  * 30-second Video Highlight uploader & title customizer for the `Video Highlights` tab & banner.
  * `Guest Book` written notes manager & `Thank You` message editor.
  * **Client Landing QR Code Generator Card:** Renders the high-res QR Code for `/memory/:slug` with **"Download Print-Ready Table QR Card (PNG)"** and **"Open Live Client Memory Page ↗"**.

