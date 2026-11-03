# AGENT 06 — Admin Flexible Invitation Website Builder & Dynamic RSVP Form Studio

> **Agent Role:** Bespoke Event Website Builder & Dynamic Schema Engineer  
> **Target Workspace:** `apps/Admin` (Port `3001`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx` *(Create)*
* `apps/Admin/src/components/invitation-studio/ThemeAndEffectsPanel.tsx` *(Create)*
* `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` *(Create)*
* `apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx` *(Create)*
* `apps/Admin/src/components/invitation-studio/LiveInvitationPreview.tsx` *(Create)*
* `apps/Admin/src/components/invitation-studio/index.ts` *(Create — must export `{ InvitationStudio }`)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `apps/Admin/src/App.tsx`, `apps/Admin/src/index.css`, or any files inside `apps/Admin/src/components/{layout,dashboard,plans,orders,booth-studio}/*`.
* Do **NOT** touch `apps/Booth`, `apps/Main`, `apps/Invitation`, or `packages/*`.

### 🤝 Export Contract (`apps/Admin/src/components/invitation-studio/index.ts`):
```tsx
export interface InvitationStudioProps {
  orderId?: string | null;
  onBack?: () => void;
}
export const InvitationStudio: React.FC<InvitationStudioProps>;
```

---

## 2. Exact Implementation Requirements

### 2.1. `InvitationStudio.tsx` — Flexible Custom Memory & Event Website Builder
Unlike Booth, **ASAR Invitation** does not have voice records and must NOT be a rigid single template. Clients order custom interactive websites for **Weddings, Engagements, Festivals, Galas, Corporate Summits, and Graduations**.

* **Top Studio Toolbar:**
  * Order/Invitation switcher + Occasion Badge (`Wedding` | `Festival` | `VIP Gala` | `Corporate Summit` | `Graduation`).
  * **Max Venue Capacity Input (`maxCapacity`):** e.g., `150` guests (used by the Client's RSVP Mailbox capacity meter).
  * **`📥 Apply Client Requested Fields & Assets` Button:** Automatically populates the event details and adds the custom RSVP form fields that the client requested when ordering!
  * **`📱 Generate Invitation Landing QR` Button:** Generates the QR Code for `http://localhost:3003?event=${slug}`.
  * **`🚀 Save & Publish Custom Invitation` Button:** Persists to Appwrite collection `"invitations"` AND syncs to `localStorage` (`"asar_invitations_cache"`).

* **Split-Screen Workspace:**
  * **Left Column (60% Width):** 3 Builder Tabs:
    1. `1. Occasion Theme, Colors & Shaders` (`ThemeAndEffectsPanel.tsx`)
    2. `2. Flexible Page Sections Builder` (`SectionBlocksManager.tsx`)
    3. `3. Dynamic RSVP Form Builder (🔒 Mandatory Email)` (`DynamicFormSchemaBuilder.tsx`)
  * **Right Column (40% Width, Sticky):** `LiveInvitationPreview.tsx` — Live interactive preview of the custom Invitation website (with desktop/mobile viewport toggle) updating in real time as the Admin modifies theme tokens, reorders blocks, or adds form fields!

---

### 2.2. `ThemeAndEffectsPanel.tsx` — Multi-Occasion Theme & `@repo/ui-components` Shader Config
Allows the Admin to tailor the visual identity for any celebration:
1. **Curated Occasion Theme Presets (1-Click Apply + Full Custom Color Pickers):**
   * **Preset 1 — Royal Wedding Editorial:** Warm Alabaster `#FBF7F2`, Royal Maroon `#6B1D28`, Champagne Gold `#D4AF37`, `Amiri` + `Playfair Display`.
   * **Preset 2 — Midnight Gala & Summit (Noir VIP):** Obsidian `#141115`, Gold `#E5C158`, Ivory text `#FBF7F2`, `Cairo` + `Playfair Display`.
   * **Preset 3 — Mediterranean Garden & Engagement:** Sage Olive `#2D4A3E`, Sand Linen `#F7F4EE`, Terracotta Gold `#C89D54`.
   * **Preset 4 — Cultural & Music Festival:** Deep Indigo/Crimson `#2B123A`, Sunset Coral `#E06D53`, Warm Cream `#FFF9F2`.
2. **Direction & Language Toggle:** `RTL (Arabic)` · `LTR (English)` · `Bilingual`.
3. **Interactive `@repo/ui-components` Background & Cursor Effects:**
   * Select Hero Shader: `"GradientWaves"` | `"DitherVeil"` | `"MinimalEditorial"`.
   * Select Cursor Effect: `"SplashCursor"` | `"GlowCursor"` | `"None"`.

---

### 2.3. `SectionBlocksManager.tsx` — Composable & Reorderable Page Sections
Allows the Admin to add, duplicate, toggle visibility (`isVisible`), reorder (Move Up / Move Down), and edit modular blocks stored in `sectionsConfigJson`:
1. **`hero` Block:** Event Overline (e.g., `"CORDIALLY INVITES YOU TO"` or `"FESTIVAL 2026"`), Main Title, Subtitle, Cover Image/Video URL, Date/Time/Venue pills, and CTA Button text.
2. **`countdown` Block:** Live countdown target date/time + custom heading (*"Counting Down to Our Forever"* or *"Doors Open In"*).
3. **`story_timeline` Block:** Dynamic list of milestones/schedule items (for a wedding: *First Met → Engagement → The Big Day*; for a festival/gala: *7:00 PM Red Carpet → 8:30 PM Keynote / Live Performance → 10:00 PM Dinner*).
4. **`gallery` Block:** Curated photo array + display mode selector (`"circular-3d"` using `CircularGallery`, `"polaroid-decay"` using `DecayCard`, or `"bento-masonry"`).
5. **`venue_map` Block:** Venue Name, Full Address, Google Maps URL, Parking/Valet note, and **Dress Code Color Swatches** (e.g., Black Tie, Earth Tones).
6. **`custom_highlight` Block:** Flexible rich editorial banner (e.g., VIP keynote speakers, festival lineup, or couple's poetic verse).
7. **`rsvp_form` Block:** Always anchored at the culmination of the invitation, rendering the dynamic schema from `DynamicFormSchemaBuilder.tsx`.

---

### 2.4. `DynamicFormSchemaBuilder.tsx` — Custom RSVP Form Builder with Locked Email
When a client orders an Invitation website, they specify what data they want guests to fill out in the RSVP form.
* **Client's Requested Fields Banner:** At the top of `DynamicFormSchemaBuilder.tsx`, display the client's requested fields note from their order (with a **"Generate Fields from Client Request"** button).
* **Locked Mandatory System Fields (Cannot be deleted or made optional):**
  1. **`guestName` (`type: "text"`, `required: true`, `isSystemLocked: true`):** *"Full Name / الاسم بالكامل"*
  2. **`guestEmail` (`type: "email"`, `required: true`, `isSystemLocked: true`):** *"Email Address / البريد الإلكتروني (Required to receive your Invitation QR Pass)"*
     * Show a clear gold lock badge (`🔒 System Required for EmailJS QR Delivery`) so the Admin knows why `guestEmail` is permanently required.
* **Dynamic Custom Fields Builder:**
  * Admin can add unlimited custom fields of type:
    * `tel` (WhatsApp / Phone Number)
    * `select` (Dropdown — e.g., *Number of Companions: Just Me (1), +1 Companion (2), +2 Companions (3)*)
    * `radio` (Single choice — e.g., *Attending Side: Bride's Guests / Groom's Guests / VIP Delegate*)
    * `checkbox` (Multi-choice — e.g., *Dietary Preferences*)
    * `number` (Numeric input)
    * `text` (Short text — e.g., *Organization / Table Group*)
    * `textarea` (Long text — e.g., *Leave a Memory, Blessing, or Song Request*)
  * For each custom field, Admin configures: `label`, `placeholder`, `required` toggle (`true`/`false`), `options` (comma-separated for `select`/`radio`/`checkbox`), and Up/Down reorder buttons.

