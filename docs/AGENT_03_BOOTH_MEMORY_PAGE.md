# AGENT 03 — Generated Booth Memory Website Matching Image #1 (`apps/Booth`)

> **Agent Role:** Booth Memory Experience & Audio Waveform Frontend Engineer  
> **Target Workspace:** `apps/Booth` (Port `3002`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md` & Visual Reference Image #1 (*Mina & Maryam*)  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Booth/src/components/memory/MemoryTopBar.tsx` *(Create)*
* `apps/Booth/src/components/memory/MemoryHero.tsx` *(Create)*
* `apps/Booth/src/components/memory/MemoryTabsBar.tsx` *(Create)*
* `apps/Booth/src/components/memory/AudioMessagesTab.tsx` *(Create)*
* `apps/Booth/src/components/memory/VoiceRecordCard.tsx` *(Create)*
* `apps/Booth/src/components/memory/PhotosTab.tsx` *(Create)*
* `apps/Booth/src/components/memory/VideoHighlightTab.tsx` *(Create)*
* `apps/Booth/src/components/memory/GuestBookTab.tsx` *(Create)*
* `apps/Booth/src/components/memory/ThankYouTab.tsx` *(Create)*
* `apps/Booth/src/components/memory/MemoryBottomActions.tsx` *(Create)*
* `apps/Booth/src/components/memory/MemoryShareQrModal.tsx` *(Create)*
* `apps/Booth/src/components/memory/MemoryPinLockGate.tsx` *(Create)*
* `apps/Booth/src/pages/BoothMemoryPage.tsx` *(Create)*
* `apps/Booth/src/App.tsx` *(Modify ONLY to route `/memory/:slug` or `?memory=:slug` to `<BoothMemoryPage />` while keeping the existing landing page intact)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `PackagesSection.tsx`, `AddonsSection.tsx`, `BookingModal.tsx`, or `apps/Booth/src/hooks/useBoothBooking.ts` (owned by Agent 02).
* Do **NOT** touch any files in `apps/Admin`, `apps/Main`, `apps/Invitation`, or `packages/*`.

---

## 2. Exact Implementation Requirements (Matching Visual Reference Image #1)

### 2.1. Routing & Data Loading (`BoothMemoryPage.tsx` & `App.tsx`)
* In `apps/Booth/src/App.tsx`:
  * Check `window.location.pathname.startsWith("/memory/")` or `new URLSearchParams(window.location.search).get("memory")`.
  * If present, render `<BoothMemoryPage slug={slug} onBackToLanding={() => ...} />`.
  * Also render a subtle floating pill in the bottom-left corner of the main Landing Page: **`🎧 معاينة صفحة ذكريات العروسين (Mina & Maryam)`** that opens `?memory=mina-and-maryam` so anyone testing `apps/Booth` can immediately switch between the Marketing Landing Page and the Generated Client Memory Website!
* Data Fetching in `BoothMemoryPage.tsx`:
  * Queries Appwrite collection `"booth_memories"` by `slug`, plus `"booth_voice_records"` and `"booth_media"` by `memoryId`.
  * **Seamless Demo Fallback:** If the slug is `"mina-and-maryam"` or Appwrite has no matching record yet, render the complete **"Mina & Maryam"** wedding memory from Image #1 (with the 5 featured voice categories totaling 86 messages and playable synthesized/sample audio waveforms + any custom memories published by the Admin in `localStorage` under `"asar_booth_memories_cache"`).

---

### 2.2. Pixel-Accurate Breakdown of Visual Reference Image #1

#### 1. `MemoryTopBar.tsx`
* Sticky frosted alabaster top bar (`bg="rgba(251, 247, 242, 0.94)"`, `backdropFilter="blur(16px)"`, `dir="ltr"` to match Image #1's layout while supporting bilingual content):
  * **Left:** Hamburger menu icon (`≡`) opening a clean quick-navigation drawer (Jump to Tabs, Toggle PIN Lock Preview, Back to Athar Home).
  * **Center:** Centered Athar calligraphy logo (`/assets/logo-main.png`) + `ATHAR AUDIO MEMORIES` micro-caption.
  * **Right:** Gold/Maroon padlock icon (`🔒`) + two-line right-aligned text:
    * `A Private Memory`
    * `For Mina & Maryam` (dynamically bound to `memory.coupleTitle`).

#### 2. `MemoryHero.tsx`
* Full-width editorial hero card with rounded bottom or seamless gradient fade into `#FBF7F2`:
  * **Background Image:** Couple sunset wedding portrait (`/assets/love-wedding.jpg` or client's `heroImageFileId`) with soft top/bottom alabaster gradient overlays so typography is 100% legible.
  * **Overline:** `THE WEDDING OF` (tracked uppercase serif, `#5B1621`).
  * **Main Title:** `Mina & Maryam` (`Playfair Display` italic/bold, `clamp(2.2rem, 5vw, 3.4rem)`, `#5B1621`).
  * **Waveform Divider:** Gold & Maroon SVG acoustic wave line (`─── ∿∿∿ ───`) + subtitle:
    * `Same People. Different Voices.`
    * `A Lasting Athar.`
  * **3 Metadata Items Row:**
    * `[📅 12 July 2026]` · `[📍 Alexandria, Egypt]` · `[🤍 Together Always]`
  * **Couple Quote:**
    * `"Every voice here is a piece of our forever ..."`
    * `– Mina & Maryam`

#### 3. `MemoryTabsBar.tsx` (5 Interactive Tactile Pill Cards)
* Horizontal bar of 5 equal-width (or horizontally scrollable on small mobile) tab cards (`borderRadius="16px"`, `p={3}`):
  1. **`Audio Messages`** (Waveform icon) — Active state: solid Royal Maroon (`#6B1D28`), white text & icon.
  2. **`Photos`** (Picture frame icon) — Inactive state: Warm Linen (`#F4EFEA`), `#4A4240` text.
  3. **`Video Highlights`** (Play triangle icon).
  4. **`Guest Book`** (Open book icon).
  5. **`Thank You`** (Heart icon).

#### 4. `AudioMessagesTab.tsx` & `VoiceRecordCard.tsx`
* **Header:** `AUDIO MESSAGES` with acoustic waveform divider (`─── ∿∿∿ ───`) + subtitle: *"Listen to the love, laughter and blessings from the people who matter most."*
* **Category Filter Pills Row:**
  * `All (86)` (Active `#6B1D28` pill) · `Family (24)` · `Friends (38)` · `Colleagues (6)` · `Special Guests (8)`.
* **Voice Record Card (`VoiceRecordCard.tsx`):**
  * Matches Image #1's exact horizontal card layout (`bg="rgba(255,255,255,0.92)"`, `borderRadius="20px"`, `p={4}`, `border="1px solid rgba(107,29,40,0.08)"`):
    * **Left:** Circular Guest Avatar (`48px` with thin gold border; falls back to a warm monogram circle if no photo) + **36px Royal Maroon Play/Pause Circle Button (`▶` / `⏸`)**.
    * **Center-Left:**
      * **Speaker Name** (`Nour Hassan`, `Ahmed El Sayed`, `Mona Khaled`, `Tarek Mostafa`, `Grandma`).
      * **Speaker Role** (`Best Friend`, `Brother`, `Cousin`, `Colleague`, `Family`).
      * **Quote Snippet** (`dir="auto"`, italic, e.g. `"Mabrook ya gameela, ربنا يسعدكم دايماً ..."`).
    * **Center-Right (Interactive 48-Bar Waveform Scrubber):**
      * Renders the 48 amplitude bars from `waveformPeaksJson`.
      * Clicking anywhere along the waveform seeks playback to that percentage!
      * Displays the formatted duration (`0:42`, `1:12`, `0:38`, `0:55`, `1:08`) right next to the waveform.
    * **Right:**
      * **Favorite Heart Button (`♡` / `♥`)**: Toggles liked state with smooth scale animation.
      * **Three-Dots Menu (`⋮`)**: Opens a compact popover with **Download Audio (`.mp3`)**, **Share Voice Link**, and **Copy Quote**.
* **Audio Playback Engine:**
  * If `audioFileUrl` is a real uploaded audio file/blob, plays it via HTML5 `<audio>` synced with the waveform progress.
  * For demo records without an external `.mp3` URL, uses a realistic **Web Audio API Warm Vintage Telephone & Harmonic Voice Playback Simulator** with a real ticking timer (`0:01` → `0:42`) and animated waveform progress so every single card in the demo is 100% interactive and playable!

#### 5. Video Highlight Banner & Remaining Tabs (`PhotosTab`, `VideoHighlightTab`, `GuestBookTab`, `ThankYouTab`)
* Directly beneath the voice cards in `AudioMessagesTab`, render the **Video Highlight Banner Card** from Image #1:
  * Left thumbnail (`/assets/booth-hero-photo.webp` with `"GOOD PEOPLE BEAUTIFUL VOICES"` card & centered white Play button) + Right label: `VIDEO HIGHLIGHT` / `30 Seconds of Your Day` + `>` chevron (clicking switches to the `Video Highlights` tab).
* Implement rich views for the other 4 tabs:
  * **`PhotosTab`:** Curated masonry wedding gallery around the vintage telephone with lightbox view.
  * **`VideoHighlightTab`:** 30-second cinematic wedding highlight player with audio waveform overlay.
  * **`GuestBookTab`:** Written blessings & guest notes with an option for family members to leave a new written blessing.
  * **`ThankYouTab`:** Heartfelt thank-you letter from `Mina & Maryam` with downloadable keepsake card.

#### 6. `MemoryBottomActions.tsx` & `MemoryShareQrModal.tsx`
* Dual action buttons matching Image #1:
  * **Left (`Download All Messages` — `Keep your memories forever`):** Triggers batch download / ZIP preparation feedback modal.
  * **Right (`Share Love` — `With Family & Friends`):** Opens `MemoryShareQrModal.tsx` displaying the client's branded **Landing Page QR Code**, one-click **Download QR Code (PNG)**, **Copy Memory Link**, and **Share via WhatsApp**.

